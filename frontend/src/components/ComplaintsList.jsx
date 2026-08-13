import { useEffect, useState } from "react";
import TiltCard from "./TiltCard";

const URGENCY_DOT = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-green-400",
};

export default function ComplaintsList({ refreshKey }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { fetchComplaints } = await import("../api");
        const data = await fetchComplaints();
        if (!cancelled) setComplaints(data);
      } catch {
        // silent — dashboard is a nice-to-have, not critical path
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return <p className="text-white/50 text-sm text-center">Loading complaints…</p>;
  }

  if (complaints.length === 0) {
    return <p className="text-white/50 text-sm text-center">No complaints filed yet.</p>;
  }

  return (
    <TiltCard className="w-full max-w-2xl p-6">
      <h2 className="text-white/90 font-semibold mb-4">All Complaints ({complaints.length})</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${URGENCY_DOT[c.urgency] || "bg-white/40"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/90 text-sm font-medium capitalize truncate">
                  {c.category.replace("_", " ")}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/40 shrink-0">
                  {c.source === "manual" ? "📝 manual" : "🎙 voice"}
                </span>
              </div>
              <p className="text-white/60 text-xs mt-0.5 truncate">{c.summary}</p>
              {(c.complainant_name || c.location) && (
                <p className="text-white/30 text-[11px] mt-1">
                  {c.complainant_name}
                  {c.complainant_name && c.location ? " · " : ""}
                  {c.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </TiltCard>
  );
}
