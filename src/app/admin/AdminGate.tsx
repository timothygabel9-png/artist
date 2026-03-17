"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginClient from "./login/LoginClient";
import AdminDashboard from "./AdminDashboard";

const ADMIN_EMAILS = [
  "joshuatschultz@gmail.com",
  "timothy.gabel9@gmail.com",
];

export default function AdminGate() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect login error:", err);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const email = user?.email?.toLowerCase?.() || "";
  const isAllowed = ADMIN_EMAILS.includes(email);

  if (!user) {
    return (
      <div className="p-6 text-white">
        <h2 className="mb-4 text-xl">Admin Login</h2>
        <LoginClient />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="p-6 text-white">
        <h2 className="mb-2 text-xl">Access denied</h2>
        <p className="text-white/70">
          Signed in as {email}, but this account is not authorized for admin access.
        </p>
      </div>
    );
  }

  return <AdminDashboard />;
}