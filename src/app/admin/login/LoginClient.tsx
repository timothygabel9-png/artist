"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const err = sp.get("error");
    if (err === "not-admin") setMsg("You’re signed in, but not an admin.");
    else if (err === "auth") setMsg("Could not verify admin access. Try again.");
    else setMsg("");
  }, [sp]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const role = snap.exists() ? (snap.data() as any)?.role : null;

      if (role === "admin") router.replace("/admin");
    });

    return () => unsub();
  }, [router]);

  async function loginGoogle() {
    setMsg("");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.replace("/admin");
  }

  async function logout() {
    await signOut(auth);
    router.replace("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Admin Login</h1>

        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <button
          onClick={loginGoogle}
          className="w-full rounded-md bg-black px-4 py-3 text-white font-semibold"
        >
          Sign in with Google
        </button>

        <button
          onClick={logout}
          className="w-full rounded-md border px-4 py-3 font-semibold"
        >
          Sign out
        </button>

        <p className="text-xs text-gray-500">
          Requires Firestore doc <code>users/&lt;uid&gt;</code> with <code>role: "admin"</code>.
        </p>
      </div>
    </main>
  );
}