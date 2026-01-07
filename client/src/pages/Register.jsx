import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import { isValidEmail, isValidPassword } from "../utils/validation";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const submit = () => {
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address");
      return;
    }
    if (!isValidPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include upper, lower, and symbol"
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    console.log(form);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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
          <h1 className="text-2xl font-semibold text-gray-900">
            Create account
          </h1>
          <p className="text-sm text-gray-500 mb-6">Sign up to get started</p>

          <div className="mb-4">
            <label className="text-sm text-gray-700">Full name</label>
            <div className="relative mt-1">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-700">Email</label>
            <div className="relative mt-1">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-700">Confirm password</label>
            <div className="relative mt-1">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            className="w-full bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-900 transition"
          >
            Create account
          </button>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?
            <Link
              to="/login"
              className="text-black font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
