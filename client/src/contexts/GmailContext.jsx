import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchGmailStatus,
  fetchGmailMessages,
  syncGmailMessages,
} from "../api";
import { useAuth } from "./AuthContext";

// ---------- Gmail Context ----------
export const GmailContext = createContext(null);

export function GmailProvider({ children }) {
  const { authenticated, checking } = useAuth();

  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ---- Status ----
  const refreshStatus = async () => {
    try {
      const res = await fetchGmailStatus();
      setConnected(res.connected);
      setEmail(res.email || null);
    } catch {
      setConnected(false);
      setEmail(null);
    }
  };

  // ---- Fetch stored messages ----
  const loadMessages = async ({ limit = 50, offset = 0 } = {}) => {
    setLoading(true);
    try {
      const data = await fetchGmailMessages({ limit, offset });
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  // ---- Sync Gmail inbox ----
  const syncMessages = async () => {
    setSyncing(true);
    try {
      await syncGmailMessages();
      await loadMessages(); // refresh after sync
    } finally {
      setSyncing(false);
    }
  };

  // ---- Reset on logout ----
  useEffect(() => {
    if (!checking && !authenticated) {
      setConnected(false);
      setEmail(null);
      setMessages([]);
    }
  }, [authenticated, checking]);

  // ---- Load Gmail status after auth ----
  useEffect(() => {
    if (!checking && authenticated) {
      refreshStatus();
    }
  }, [authenticated, checking]);

  return (
    <GmailContext.Provider
      value={{
        connected,
        email,
        messages,
        loading,
        syncing,
        refreshStatus,
        loadMessages,
        syncMessages,
      }}
    >
      {children}
    </GmailContext.Provider>
  );
}

// ---------- Hook ----------
export function useGmail() {
  const ctx = useContext(GmailContext);
  if (!ctx) {
    throw new Error("useGmail must be used inside GmailProvider");
  }
  return ctx;
}

