import { useRef, useState } from "react";

export default function Recorder({ onResult, complainant, isComplainantValid }) {
  const [status, setStatus] = useState("idle"); // idle | recording | processing | error
  const [errorMsg, setErrorMsg] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    if (!isComplainantValid) {
      setErrorMsg("Please add your name and contact info first");
      setStatus("error");
      return;
    }
    setErrorMsg("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = handleStop;

    recorder.start();
    mediaRecorderRef.current = recorder;
    setStatus("recording");
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  };

  const handleStop = async () => {
    setStatus("processing");
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });

    try {
      const { processAudio } = await import("../api");
      const result = await processAudio(blob, complainant);
      onResult(result);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={status === "recording" ? stopRecording : startRecording}
        disabled={status === "processing"}
        className={`mic-button w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300
          ${status === "recording" ? "bg-gradient-to-br from-red-500 to-rose-600 animate-pulse scale-105" : "bg-gradient-to-br from-indigo-500 to-violet-600 hover:scale-105"}
          ${status === "processing" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {status === "recording" ? "Stop" : "Speak"}
      </button>

      <p className="text-sm text-white/70 text-center max-w-xs">
        {status === "idle" && "Tap to record your complaint (Kannada / Hindi / English)"}
        {status === "recording" && "Listening… tap to stop"}
        {status === "processing" && "Processing your complaint…"}
        {status === "error" && `⚠ ${errorMsg}`}
      </p>
    </div>
  );
}
