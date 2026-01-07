import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { isValidEmail } from "../utils/validation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = () => {
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setSuccess("If the email exists, a reset link has been sent.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto pt-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
      </div>
      <div className="flex items-center justify-center mt-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mb-6">We’ll email you a link to reset your password</p>

          <div className="mb-4">
            <label className="text-sm text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
              {success}
            </div>
          )}

          <button
            onClick={submit}
            className="w-full bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-900 transition"
          >
            Send reset link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
