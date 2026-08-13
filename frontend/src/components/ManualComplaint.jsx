import { useState } from "react";

export default function ManualComplaint({ onResult, complainant, isComplainantValid }) {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isComplainantValid) {
      setErrorMsg("Please add your name and contact info first");
      setStatus("error");
      return;
    }
    if (description.trim().length < 3) {
      setErrorMsg("Please describe your complaint in a sentence or two");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      const { registerComplaint } = await import("../api");
      const result = await registerComplaint({
        name: complainant.name,
        contact: complainant.contact,
        description,
      });
      onResult(result);
      setDescription("");
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Type your complaint here — e.g. 'Water has not been coming in Block A hostel since morning'"
        rows={4}
        className="input-glass w-full resize-none"
      />

      <button
        type="submit"
        disabled={status === "processing"}
        className={`px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-br from-indigo-500 to-violet-600 transition-all duration-300 hover:scale-105
          ${status === "processing" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {status === "processing" ? "Submitting…" : "Register Complaint"}
      </button>

      <p className="text-sm text-white/70 text-center max-w-xs min-h-[1.25rem]">
        {status === "error" && `⚠ ${errorMsg}`}
      </p>
    </form>
  );
}
