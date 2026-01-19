const API_URL = "http://localhost:8000";

// ------------------ Auth ------------------

export async function register(name, email, password) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

// ------------------ Gmail ------------------

/**
 * Start Gmail OAuth flow.
 * Returns: { auth_url: "https://..." }
 */
export async function connectGmail() {
  const res = await fetch(`${API_URL}/gmail/connect`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to initiate Gmail connection");
  return res.json();
}

/**
 * Disconnect / revoke Gmail access
 */
export async function disconnectGmail() {
  const res = await fetch(`${API_URL}/gmail/disconnect`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to disconnect Gmail");
  return res.json();
}

/**
 * Check if user has Gmail connected
 * Returns: { connected: true/false, email: "..." }
 */
export async function fetchGmailStatus() {
  const res = await fetch(`${API_URL}/gmail/status`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch Gmail status");
  return res.json();
}

