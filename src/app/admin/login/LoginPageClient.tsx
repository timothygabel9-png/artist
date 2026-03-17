"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginClient from "./LoginClient";

const ADMIN_EMAILS = [
  "joshuatschultz@gmail.com",
  "timothy.gabel9@gmail.com",
].map((e) => e.toLowerCase());

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const error = useMemo(() => searchParams.get("error") || "", [searchParams]);

  useEffect(() => {
    if (error === "not-admin") {
      setMessage("This Google account is not authorized for admin access.");
    }
  }, [error]);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect login error:", err);
      setMessage(err?.message || "Login failed.");
    });

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const email = user.email?.toLowerCase() || "";
      const isAllowed = ADMIN_EMAILS.includes(email);

      if (isAllowed) {
        router.replace("/admin");
        return;
      }

      setMessage(`Signed in as ${email}, but this account is not authorized.`);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 p-6 text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mx-auto max-w-md pt-16">
        <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>

        {message ? (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        ) : null}

        <LoginClient />
      </div>
    </main>
  );
}