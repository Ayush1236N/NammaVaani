export default function ComplainantForm({ complainant, setComplainant }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-white/60">Your name</label>
        <input
          type="text"
          value={complainant.name}
          onChange={(e) => setComplainant({ ...complainant, name: e.target.value })}
          placeholder="e.g. Aditi Sharma"
          className="input-glass"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-white/60">Email or phone</label>
        <input
          type="text"
          value={complainant.contact}
          onChange={(e) => setComplainant({ ...complainant, contact: e.target.value })}
          placeholder="e.g. aditi@campus.edu"
          className="input-glass"
        />
      </div>
    </div>
  );
}
