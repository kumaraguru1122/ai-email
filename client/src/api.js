const API_BASE = import.meta.env.VITE_BACKEND_URL;

console.log("API_BASE:", API_BASE); // should print http://localhost:8000


export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/api/emails`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}

export function loginWithGoogle() {
  window.location.href = `${API_BASE}/auth/google/login`;
}
