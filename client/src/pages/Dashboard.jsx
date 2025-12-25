import { useEffect, useState } from "react";
import { fetchEmails } from "../api";
import EmailList from "../components/EmailList";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails()
      .then(setEmails)
      .catch(() => {
        setError("Not authenticated");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Loading emails…</div>;
  }

  if (error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-semibold">Inbox</h1>
      </header>

      <main className="p-4">
        <EmailList emails={emails} />
      </main>
    </div>
  );
}
