import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_EMAILS =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

export async function isAdmin(uid: string, email?: string | null) {
  // ✅ 1. Allow via email (fast + primary)
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // ✅ 2. Fallback to Firestore (optional)
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.role === "admin";
  } catch {
    return false;
  }
}