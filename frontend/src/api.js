const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function processAudio(blob, complainant = {}) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  formData.append("complainant_name", complainant.name || "");
  formData.append("complainant_contact", complainant.contact || "");

  const res = await fetch(`${API_BASE}/process-audio`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to process audio");
  }

  return res.json();
}

export async function registerComplaint({ name, contact, description }) {
  const res = await fetch(`${API_BASE}/register-complaint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      complainant_name: name,
      complainant_contact: contact,
      description,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to register complaint");
  }

  return res.json();
}

export async function fetchComplaints() {
  const res = await fetch(`${API_BASE}/complaints`);
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}
