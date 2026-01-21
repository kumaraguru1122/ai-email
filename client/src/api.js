const API_URL = "http://localhost:8000";

// ------------------ Auth ------------------

export async function register(name, email, password, confirmPassword) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    }),
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

export async function updateUser(payload) {
  const res = await fetch(`${API_URL}/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update user");
  }

  return res.json();
}

// ------------------ Gmail OAuth ------------------

export async function connectGmail() {
  const res = await fetch(`${API_URL}/gmail/connect`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to initiate Gmail connection");
  return res.json(); // { auth_url }
}

export async function disconnectGmail() {
  const res = await fetch(`${API_URL}/gmail/disconnect`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to disconnect Gmail");
  return res.json();
}

export async function fetchGmailStatus() {
  const res = await fetch(`${API_URL}/gmail/status`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch Gmail status");
  return res.json();
}

// ------------------ Gmail Messages ------------------

export async function syncGmailMessages() {
  const res = await fetch(`${API_URL}/gmail/sync`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to sync Gmail messages");
  }

  return res.json(); 
}

export async function fetchGmailMessages({ limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset });

  const res = await fetch(
    `${API_URL}/gmail/messages?${params.toString()}`,
    { credentials: "include" }
  );

  if (!res.ok) throw new Error("Failed to fetch Gmail messages");
  return res.json();
}

