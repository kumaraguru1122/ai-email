import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Pencil,
  Save,
  Lock,
  LogOut,
  Trash2,
  MailCheck,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import { logout, fetchGmailStatus, connectGmail, disconnectGmail } from "../api";

const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const navigate = useNavigate();

  // Fetch Gmail connection status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetchGmailStatus(); // returns { connected: true/false, email: "..." }
        setGmailConnected(res.connected);
        if (res.connected) setGmailEmail(res.email);
      } catch (err) {
        console.error("Failed to fetch Gmail status", err);
      }
    };
    fetchStatus();
  }, []);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/login", { replace: true });
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    setLoading(true);
    try {
      const res = await connectGmail(); // { auth_url: "https://..." }
      // redirect user to Google consent screen
      window.location.href = res.auth_url;
    } catch (err) {
      console.error("Failed to start Gmail connect", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!gmailConnected) return;
    setLoading(true);
    try {
      await disconnectGmail(); // revoke tokens
      setGmailConnected(false);
      setGmailEmail("");
    } catch (err) {
      console.error("Failed to disconnect Gmail", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </NavLink>

        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Account Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your profile and connected services
          </p>
        </div>
      </header>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-800">Profile</h2>

          <button
            onClick={() => setIsEditing((v) => !v)}
            className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
          >
            {isEditing ? <Save size={16} /> : <Pencil size={16} />}
            {isEditing ? "Save changes" : "Edit profile"}
          </button>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
          <div className="flex items-start gap-3">
            <User size={18} className="text-neutral-500 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-neutral-500">Name</p>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              ) : (
                <p className="text-sm text-neutral-900">John Doe</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={18} className="text-neutral-500 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-neutral-500">Email</p>
              {isEditing ? (
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              ) : (
                <p className="text-sm text-neutral-900">john@example.com</p>
              )}
            </div>
          </div>

          <NavLink
            to="/change-password"
            className="inline-flex items-center gap-2 text-sm text-neutral-700 underline hover:text-neutral-900"
          >
            <Lock size={14} />
            Change password
          </NavLink>
        </div>
      </section>

      {/* Connected Accounts */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-800">Connected Accounts</h2>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
          {gmailConnected ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-700">Connected: {gmailEmail}</p>
              <button
                onClick={handleDisconnectGmail}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 text-red-700 text-sm hover:bg-red-200 transition disabled:opacity-50"
              >
                <XCircle size={16} />
                Revoke Gmail
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                Connect your Gmail account to fetch and organize your emails.
              </p>
              <button
                onClick={handleConnectGmail}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-900 text-neutral-50 text-sm hover:bg-neutral-800 transition disabled:opacity-50"
              >
                <MailCheck size={16} />
                Connect Gmail
              </button>
            </>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-neutral-800">Danger zone</h2>

        <div className="rounded-lg border border-red-200 bg-white p-4 space-y-2">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-neutral-900 hover:bg-neutral-100 transition disabled:opacity-50"
          >
            <LogOut size={16} />
            {loading ? "Logging out…" : "Log out"}
          </button>

          <NavLink
            to="/delete-account"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
            Delete account
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default Settings;

