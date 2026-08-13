"""
Intent classification + entity extraction using Google Gemini (free tier).
Output is validated against the ComplaintIntent Pydantic schema so the
backend never breaks on malformed model output.
"""
import os
import json
from google import genai
from models import ComplaintIntent

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are a classifier for a campus complaint system.
Given a (possibly noisy, code-mixed Kannada/Hindi/English) transcript,
return ONLY a JSON object with these exact fields, nothing else:

{
  "category": one of ["water_issue", "electricity_issue", "hostel_complaint", "academic_query", "safety_concern", "other"],
  "location": string or null (building/block/room if mentioned),
  "urgency": one of ["low", "medium", "high"],
  "summary": a short one-line plain-language summary in English
}

No markdown, no backticks, no preamble. Just the JSON object.
"""


def classify_intent(normalized_text: str) -> ComplaintIntent:
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=f"{SYSTEM_PROMPT}\n\nTranscript: {normalized_text}",
    )
    raw = response.text.strip()

    # Defensive cleanup in case the model wraps output in fences anyway
    raw = raw.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(raw)
    return ComplaintIntent(**parsed)