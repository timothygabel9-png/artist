"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === "/admin/login";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoginRoute) {
      setReady(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? (snap.data() as any)?.role : null;

        if (role !== "admin") {
          router.replace("/admin/login?error=not-admin");
          return;
        }

        setReady(true);
      } catch {
        router.replace("/admin/login?error=auth");
      }
    });

    return () => unsub();
  }, [router, isLoginRoute]);

  // Login page can keep its own styling
  if (isLoginRoute) return <>{children}</>;

  if (!ready) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center text-sm text-white/60">
        Checking admin access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {children}
    </div>
  );
}