import { useState } from "react";
import Recorder from "./components/Recorder";
import ManualComplaint from "./components/ManualComplaint";
import ComplainantForm from "./components/ComplainantForm";
import ResultCard from "./components/ResultCard";
import ComplaintsList from "./components/ComplaintsList";
import TiltCard from "./components/TiltCard";

export default function App() {
  const [mode, setMode] = useState("voice"); // "voice" | "manual"
  const [complainant, setComplainant] = useState({ name: "", contact: "" });
  const [result, setResult] = useState(null);
  const [showList, setShowList] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isComplainantValid = complainant.name.trim().length > 0 && complainant.contact.trim().length > 0;

  const handleResult = (r) => {
    setResult(r);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-scene flex flex-col items-center pt-16 px-4 pb-20">
      {/* animated background blobs */}
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

      <div className="relative z-10 flex flex-col items-center w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight text-center">
          Campus Complaint Portal
        </h1>
        <p className="text-white/60 mb-10 text-center max-w-md">
          Speak it or type it — in Kannada, Hindi, or English — we'll turn it into a structured complaint automatically.
        </p>

        {/* Complainant details, shared across both intake modes */}
        <TiltCard className="w-full max-w-md p-5 mb-6">
          <span className="text-xs uppercase tracking-wide text-white/40">Complainant details</span>
          <div className="mt-3">
            <ComplainantForm complainant={complainant} setComplainant={setComplainant} />
          </div>
        </TiltCard>

        {/* Mode switcher: voice vs manual, kept as separate intake paths */}
        <div className="flex gap-2 mb-8 p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setMode("voice")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "voice" ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            🎙 Speak Complaint
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "manual" ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            📝 Type Complaint
          </button>
        </div>

        <TiltCard className="w-full max-w-md p-8 flex items-center justify-center">
          {mode === "voice" ? (
            <Recorder onResult={handleResult} complainant={complainant} isComplainantValid={isComplainantValid} />
          ) : (
            <ManualComplaint onResult={handleResult} complainant={complainant} isComplainantValid={isComplainantValid} />
          )}
        </TiltCard>

        <div className="mt-10 w-full flex justify-center">
          <ResultCard result={result} />
        </div>

        <button
          onClick={() => setShowList((v) => !v)}
          className="mt-10 text-sm text-white/50 hover:text-white/80 underline underline-offset-4"
        >
          {showList ? "Hide all complaints" : "View all complaints"}
        </button>

        {showList && (
          <div className="mt-6 w-full flex justify-center">
            <ComplaintsList refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}
