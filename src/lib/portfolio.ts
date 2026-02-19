import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export type PortfolioItem = {
  id: string;
  title?: string;
  type?: "mural" | "carpentry";
  category?: "indoor" | "outdoor";
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  imageUrls?: string[];
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

// SAFEST LIST FETCH:
// 1) Try ordered by createdAt
// 2) If that fails (missing index / missing field / bad docs), fall back to simple getDocs
export async function getPortfolioItems(max = 50): Promise<PortfolioItem[]> {
  const colRef = collection(db, "portfolioItems");

  try {
    const q = query(colRef, orderBy("createdAt", "desc"), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.warn("Ordered query failed, falling back to unordered getDocs:", err);
    const snap = await getDocs(colRef);
    return snap.docs.slice(0, max).map((d) => ({ id: d.id, ...(d.data() as any) }));
  }
}

export async function getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
  if (!id || typeof id !== "string") return null;
  const snap = await getDoc(doc(db, "portfolioItems", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}
