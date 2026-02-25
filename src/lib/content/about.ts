import "server-only";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ✅ uses your firebase.ts

export type AboutContent = {
  title: string;
  paragraphs: string[];
  cards: { title: string; body: string }[];
  ctaNote: string;
};

export async function getAboutPublished(): Promise<AboutContent | null> {
  const ref = doc(db, "siteContent", "about");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return (data?.published as AboutContent) ?? null;
}

export async function getAboutDraft(): Promise<AboutContent | null> {
  const ref = doc(db, "siteContent", "about");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return (data?.draft as AboutContent) ?? null;
}