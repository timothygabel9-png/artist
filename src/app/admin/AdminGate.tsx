"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

const ADMIN_EMAILS = [
  "joshuatschultz@gmail.com",
  "timothy.gabel9@gmail.com",
  "tim@watcherproducts.com",
].map((email) => email.toLowerCase());

export default function AdminGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("AdminGate auth state:", u?.email || null);
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  if (!user) {
    router.replace("/admin/login");
    return null;
  }

  const email = user.email?.toLowerCase() || "";
  const isAllowed = ADMIN_EMAILS.includes(email);

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

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Admin works</h1>
      <p>Signed in as {email}</p>
    </div>
  );
}