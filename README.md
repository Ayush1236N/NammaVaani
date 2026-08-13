# Campus Complaint Portal — Speech-to-Intent Pipeline

File a campus complaint two ways — **speak it** (Kannada/Hindi/English, code-mixed)
or **type it** — and both are transcribed/normalized/classified into a structured
complaint (category, location, urgency, summary) by the same LLM core, tagged with
who filed it, and stored together.

- 🎙 **Voice intake** — record → Whisper transcription → normalize → classify
- 📝 **Manual intake** — type your complaint directly → normalize → classify (same
  pipeline, no mic needed)
- 👤 **Complainant details** (name + contact) captured on both paths
- 🗂 **Live complaints dashboard** — see every complaint filed, from either channel
- 🎨 Glassmorphic, 3D-tilt UI

## Project Structure

```
speech-to-intent/
├── backend/
│   ├── main.py          # FastAPI app — orchestrates the full pipeline
│   ├── asr.py            # Whisper transcription (audio -> text)
│   ├── normalize.py       # Code-mix cleanup (rule-based)
│   ├── intent.py          # LLM classification -> structured JSON
│   ├── models.py          # Pydantic schemas (request/response validation)
│   ├── database.py        # SQLite via SQLAlchemy
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js               # calls to backend
│   │   ├── components/
│   │   │   ├── Recorder.jsx      # MediaRecorder mic capture
│   │   │   └── ResultCard.jsx    # displays structured result
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## Pipeline Flow

1. **Browser** records audio via `MediaRecorder` → sends `.webm` blob to backend
2. **Backend** converts to 16kHz WAV (`pydub`)
3. **Whisper** (`faster-whisper`) transcribes → raw text + detected language
4. **Normalize** layer cleans code-mixed noise (fillers, common romanized terms)
5. **LLM** classifies into category/urgency/location/summary (JSON, schema-validated)
6. **SQLite** stores the structured complaint
7. **Frontend** displays the result card

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

First run downloads the Whisper model (`small` by default — swap to `base` in
`.env` if your machine is slow: `WHISPER_MODEL_SIZE=base`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens at `http://localhost:5173`. Make sure the backend is running on port 8000
(or update `VITE_API_BASE` in `.env`).

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/process-audio` | Upload audio file (+ `complainant_name`, `complainant_contact` form fields) → structured complaint, `source="voice"` |
| POST | `/register-complaint` | JSON body `{complainant_name, complainant_contact, description}` → structured complaint, `source="manual"` |
| GET | `/complaints` | List all stored complaints (both channels, newest first) |

## Demo Tips

- Test with a short, clear sentence first (e.g., "Water is not coming in Block A hostel") before trying full code-mixed sentences.
- If Whisper is slow on stage, pre-record 2-3 sample clips beforehand as backup.
- Use `ngrok http 8000` to expose the backend if judges want to test from their own phones.
- Keep the `/complaints` endpoint open in a second tab to show live data accumulating — good visual for judges.

## Fallback Options (if something breaks under time pressure)

- **Whisper too slow locally** → switch `asr.py` to call Google Cloud Speech-to-Text or AssemblyAI instead.
- **No Anthropic API key / rate limited** → swap `intent.py` to OpenAI's API (same JSON-schema approach).
- **Normalization too rough** → it's fine to demo with the rule-based version; mention `indic-nlp-library` as a stated next step.
