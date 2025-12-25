import { loginWithGoogle } from "../api";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-4">AI Email Client</h1>
        <p className="text-gray-600 mb-6">
          Connect your Gmail account to continue
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Connect Gmail
        </button>
      </div>
    </div>
  );
}
