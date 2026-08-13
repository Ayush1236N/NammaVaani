import TiltCard from "./TiltCard";

const URGENCY_COLORS = {
  high: "bg-red-500/20 text-red-300 border-red-400/40",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
  low: "bg-green-500/20 text-green-300 border-green-400/40",
};

const SOURCE_LABELS = {
  voice: "🎙 Voice",
  manual: "📝 Manual",
};

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <TiltCard className="w-full max-w-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
          {SOURCE_LABELS[result.source] || "Complaint"}
        </span>
        <span className="text-xs text-white/40">#{result.id}</span>
      </div>

      {(result.complainant_name || result.complainant_contact) && (
        <div className="pb-3 border-b border-white/10">
          <span className="text-xs uppercase tracking-wide text-white/40">Filed by</span>
          <p className="text-white/90 text-sm mt-0.5">
            {result.complainant_name || "—"}
            {result.complainant_contact && (
              <span className="text-white/50"> · {result.complainant_contact}</span>
            )}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-white/40">Category</span>
        <span className="font-medium capitalize text-white">{result.category.replace("_", " ")}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-white/40">Urgency</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${URGENCY_COLORS[result.urgency]}`}>
          {result.urgency}
        </span>
      </div>

      {result.location && (
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-white/40">Location</span>
          <span className="text-white/90">{result.location}</span>
        </div>
      )}

      <div>
        <span className="text-xs uppercase tracking-wide text-white/40">Summary</span>
        <p className="mt-1 text-white/90">{result.summary}</p>
      </div>

      <details className="text-xs text-white/40 pt-2 border-t border-white/10">
        <summary className="cursor-pointer hover:text-white/60">Raw transcript</summary>
        <p className="mt-1">{result.raw_text}</p>
      </details>
    </TiltCard>
  );
}
