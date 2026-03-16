import { getAdminDb } from "@/lib/firebaseAdmin";

export type AboutBlock = {
  id: string;
  heading?: string;
  body: string;
  x: number;
  y: number;
  w?: number;
  align?: "left" | "center" | "right";
};

export type AboutDoc = {
  title?: string;
  subtitle?: string;
  blocks: AboutBlock[];
};

export async function getAboutDoc(): Promise<AboutDoc> {
  const db = getAdminDb();
  const snap = await db.doc("siteContent/about").get();

  if (!snap.exists) {
    return {
      title: "About",
      subtitle: "The story behind the work",
      blocks: [
        {
          id: "story-1",
          heading: "The Story",
          body: "Joshua Schultz is an Illinois mural artist specializing in custom murals, graphic design, and public art installations. Based in the Aurora Illinois and Chicago area, his work includes business murals, restaurant murals, and public art projects designed to bring character and storytelling to walls and spaces.",
          x: 8,
          y: 10,
          w: 420,
          align: "left",
        },
        {
          id: "story-2",
          heading: "The Process",
          body: "Joshua Schultz is an Illinois mural artist specializing in custom murals, graphic design, and public art installations. Based in the Aurora Illinois and Chicago area, his work includes business murals, restaurant murals, and public art projects designed to bring character and storytelling to walls and spaces.",
          x: 56,
          y: 58,
          w: 420,
          align: "left",
        },
      ],
    };
  }

  const data = snap.data() as any;
  return {
    title: data?.title ?? "About",
    subtitle: data?.subtitle ?? "The story behind the work",
    blocks: Array.isArray(data?.blocks) ? data.blocks : [],
  };
}

export async function getCollageImages(max = 18): Promise<string[]> {
  const db = getAdminDb();

  const snap = await db
    .collection("portfolioItems")
    .where("active", "==", true)
    .orderBy("createdAt", "desc")
    .limit(36)
    .get();

  const seen = new Set<string>();
  const out: string[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as any;
    const urls = [data.coverImageUrl, ...(Array.isArray(data.imageUrls) ? data.imageUrls : [])]
      .filter(Boolean)
      .map((x: any) => String(x).trim());

    for (const url of urls) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
      if (out.length >= max) return out;
    }
  }

  return out;
}