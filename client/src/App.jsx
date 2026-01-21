import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {GmailProvider} from "./contexts/GmailContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ children }) => {
  const { authenticated, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Checking authentication…</span>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
       <GmailProvider>
        <AppRoutes />
       </GmailProvider> 
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
