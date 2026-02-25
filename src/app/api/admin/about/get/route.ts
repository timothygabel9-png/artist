import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const ref = doc(db, "siteContent", "about");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ ok: true, draft: null, published: null });
    }

    const data = snap.data() as any;
    return NextResponse.json({
      ok: true,
      draft: data?.draft ?? null,
      published: data?.published ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}