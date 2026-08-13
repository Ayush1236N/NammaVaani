"""
Speech-to-text layer using faster-whisper.
Handles audio format conversion + transcription with language detection.
"""
import os
from faster_whisper import WhisperModel
from pydub import AudioSegment

MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "small")

# Loaded once at startup (module-level singleton) — avoid reloading per request
_model = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        # "cpu" + int8 compute type keeps this runnable without a GPU
        _model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    return _model


def convert_to_wav(input_path: str, output_path: str) -> str:
    """Browser audio (webm/ogg) -> 16kHz mono WAV, which Whisper expects."""
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")
    return output_path


def transcribe(audio_path: str) -> dict:
    """
    Returns: {"text": str, "language": str}
    faster-whisper auto-detects language (en/hi/kn etc.) and handles
    code-switching reasonably well within a single utterance.
    """
    model = get_model()
    segments, info = model.transcribe(audio_path, beam_size=5, vad_filter=False)
    segments = list(segments)
    if not segments:
        return {"text": "", "language": info.language if info else "unknown"}
    text = " ".join(seg.text.strip() for seg in segments)
    return {"text": text.strip(), "language": info.language}
