"use client";

import { useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase"; // adjust if your export is different

export default function LoginClient() {
  const [busy, setBusy] = useState(false);

  const onGoogle = async () => {
    setBusy(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // success: you can route to /admin or refresh state
    } catch (e: any) {
      console.error("AUTH ERROR:", e?.code, e?.message, e);
      alert(`${e?.code || "auth/error"}: ${e?.message || "Unknown error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onGoogle}
      disabled={busy}
      className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-60"
    >
      {busy ? "Signing in…" : "Sign in with Google"}
    </button>
  );
}