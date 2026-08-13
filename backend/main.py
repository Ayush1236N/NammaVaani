import os
import shutil
import uuid
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from asr import transcribe, convert_to_wav
from normalize import normalize
from intent import classify_intent
from database import init_db, get_db, Complaint
from models import ComplaintOut, ComplaintCreateManual

app = FastAPI(title="Speech-to-Intent Complaint Pipeline")

# Loosen CORS for hackathon demo — tighten if you have time
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TMP_DIR = "tmp_audio"
os.makedirs(TMP_DIR, exist_ok=True)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process-audio", response_model=ComplaintOut)
async def process_audio(
    file: UploadFile = File(...),
    complainant_name: str = Form(""),
    complainant_contact: str = Form(""),
    db: Session = Depends(get_db),
):
    # 1. Save uploaded audio
    raw_path = os.path.join(TMP_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(raw_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    wav_path = raw_path + ".wav"

    try:
        # 2. Convert to 16kHz mono WAV
        convert_to_wav(raw_path, wav_path)

        # 3. Transcribe
        asr_result = transcribe(wav_path)
        raw_text = asr_result["text"]

        if not raw_text:
            raise HTTPException(status_code=422, detail="Could not transcribe audio — try again")

        # 4. Normalize code-mixed transcript
        normalized_text = normalize(raw_text)

        # 5. Classify intent + extract entities
        intent = classify_intent(normalized_text)

        # 6. Persist
        complaint = Complaint(
            raw_text=raw_text,
            normalized_text=normalized_text,
            category=intent.category,
            location=intent.location,
            urgency=intent.urgency,
            summary=intent.summary,
            complainant_name=complainant_name or None,
            complainant_contact=complainant_contact or None,
            source="voice",
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        return complaint

    finally:
        # Clean up temp files regardless of success/failure
        for p in (raw_path, wav_path):
            if os.path.exists(p):
                os.remove(p)


@app.post("/register-complaint", response_model=ComplaintOut)
def register_complaint(payload: ComplaintCreateManual, db: Session = Depends(get_db)):
    """
    Separate, non-voice complaint intake. The complainant types their issue
    directly instead of speaking it — useful when a mic isn't available, or
    the person prefers to write. Runs through the same normalize + LLM
    classification core as the voice pipeline, so both channels produce
    identically structured complaints.
    """
    normalized_text = normalize(payload.description)

    if not normalized_text:
        raise HTTPException(status_code=422, detail="Complaint description is empty")

    intent = classify_intent(normalized_text)

    complaint = Complaint(
        raw_text=payload.description,
        normalized_text=normalized_text,
        category=intent.category,
        location=intent.location,
        urgency=intent.urgency,
        summary=intent.summary,
        complainant_name=payload.complainant_name,
        complainant_contact=payload.complainant_contact,
        source="manual",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return complaint


@app.get("/complaints", response_model=list[ComplaintOut])
def list_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()
