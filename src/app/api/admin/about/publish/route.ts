import { NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST() {
  try {
    const ref = doc(db, "siteContent", "about");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ ok: false, error: "No draft found to publish" }, { status: 400 });
    }

    const data = snap.data() as any;
    const draft = data?.draft;

    if (!draft) {
      return NextResponse.json({ ok: false, error: "No draft found to publish" }, { status: 400 });
    }

    await setDoc(
      ref,
      {
        published: draft,
        publishedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}