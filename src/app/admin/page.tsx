"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdmin } from "@/lib/admin";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [uid, setUid] = useState<string | null>(null);
  const [adminOk, setAdminOk] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setAdminOk(false);
        return;
      }
      setUid(user.uid);
      setAdminOk(await isAdmin(user.uid));
    });
    return () => unsub();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const ok = await isAdmin(cred.user.uid);
      setAdminOk(ok);
      if (!ok) setStatus("Logged in, but not marked as admin in Firestore.");
    } catch (err: any) {
      setStatus(err?.message || "Login failed.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <main className="min-h-screen p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Admin Login</h1>

      {!uid ? (
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">Sign in</button>
          {status && <p className="text-sm">{status}</p>}
        </form>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm">Signed in. Admin: {adminOk ? "YES" : "NO"}</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded border" onClick={handleLogout}>Sign out</button>
            {adminOk && (
              <Link className="px-4 py-2 rounded bg-black text-white" href="/admin/portfolio">
                Portfolio Upload
              </Link>
            )}
          </div>
          {status && <p className="text-sm">{status}</p>}
        </div>
      )}
    </main>
  );
}
