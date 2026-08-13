"""
Lightweight normalization layer for code-mixed Kannada/Hindi/English transcripts.
Whisper output on code-switched speech is often noisy — this cleans common
patterns before it reaches the intent classifier.

This is a rule-based fallback (fast to build, no extra model download).
If time allows, swap in indic-nlp-library for proper script normalization.
"""
import re

# Common filler/hesitation words across languages that add noise to intent parsing
FILLERS = ["um", "uh", "matlab", "yenappa", "andre", "aa", "so", "like"]

# Simple romanized-Kannada/Hindi -> canonical spelling map (extend as needed)
SPELLING_MAP = {
    "nalli": "in",
    "beku": "want",
    "illa": "no",
    "hostel na": "hostel",
    "paani": "water",
    "current": "electricity",
    "kharab": "broken",
}


def normalize(text: str) -> str:
    cleaned = text.lower().strip()

    # Remove filler words
    for filler in FILLERS:
        cleaned = re.sub(rf"\b{re.escape(filler)}\b", "", cleaned)

    # Apply canonical spelling substitutions
    for src, tgt in SPELLING_MAP.items():
        cleaned = re.sub(rf"\b{re.escape(src)}\b", tgt, cleaned)

    # Collapse repeated whitespace left behind by removals
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned
