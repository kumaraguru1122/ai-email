import { useEffect } from "react";

import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";

import { useAuth } from "../contexts/AuthContext";
import { useGmail } from "../contexts/GmailContext";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    connected,
    messages,
    loading,
    syncing,
    loadMessages,
    syncMessages,
  } = useGmail();

  // Load stored emails when Gmail is connected
  useEffect(() => {
    if (connected) {
      loadMessages();
    }
  }, [connected]);

  // Log raw backend data whenever it changes
  useEffect(() => {
    if (messages && messages.length > 0) {
      console.log("📨 Gmail messages from backend:", messages);
    }
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <TopBar username={user?.name} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-64 border-r border-neutral-200 bg-white">
          <SideBar />
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {!connected && (
            <div className="h-full flex items-center justify-center text-neutral-500">
              Connect your Gmail account to see emails.
            </div>
          )}

          {connected && loading && (
            <div className="h-full flex items-center justify-center">
              Loading emails…
            </div>
          )}

          {connected && !loading && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <p className="text-neutral-500">No emails stored.</p>
              <button
                onClick={syncMessages}
                disabled={syncing}
                className="px-4 py-2 bg-black text-white rounded"
              >
                {syncing ? "Syncing…" : "Sync Gmail"}
              </button>
            </div>
          )}

          {connected && messages.length > 0 && (
            <div className="h-full flex items-center justify-center text-neutral-500">
              Emails fetched. Check the console.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

