import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

/* ============================================================
   TYPES
============================================================ */

export type ItemType = "mural" | "carpentry" | "graphic-design" | "signage";

export type IndoorOutdoor = "indoor" | "outdoor";

export type GraphicDesignCategory =
  | "logos"
  | "tshirts"
  | "album-covers"
  | "show-posters"
  | "events";

export type Category = IndoorOutdoor | GraphicDesignCategory;

export type PortfolioItem = {
  id: string;

  title?: string;
  clientName?: string;
  location?: string;

  type?: ItemType;
  category?: Category;

  description?: string;
  tags?: string[];

  coverImageUrl?: string;
  imageUrls?: string[];

  featured?: boolean;
  active?: boolean;

  createdAt?: any;
  updatedAt?: any;

  // derived
  sortTime?: number;
};

export type PortfolioFilters = {
  // Public page should typically set active:true, but we support both.
  active?: boolean;
  featured?: boolean;

  type?: ItemType;
  category?: Category;

  // tag filter uses array-contains
  tag?: string;

  // exact-match filters (good for dropdowns)
  location?: string;
  clientName?: string;
};

export type PortfolioPageResult = {
  items: PortfolioItem[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  usedOrdering: "createdAt" | "updatedAt" | "none";
};

/* ============================================================
   SINGLE ITEM
============================================================ */

export async function getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
  if (!id) return null;

  const ref = doc(db, "portfolioItems", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...(snap.data() as any) } as PortfolioItem;
}

/* ============================================================
   HELPERS
============================================================ */

function toMillis(ts: any): number | undefined {
  if (!ts) return undefined;
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  const d = ts instanceof Date ? ts : new Date(ts);
  const t = d.getTime();
  return Number.isFinite(t) ? t : undefined;
}

function normalizeDoc(d: QueryDocumentSnapshot<DocumentData>): PortfolioItem {
  const data = d.data() as any;
  const created = toMillis(data.createdAt);
  const updated = toMillis(data.updatedAt);

  return {
    id: d.id,
    ...data,
    sortTime: created ?? updated ?? 0,
  };
}

/* ============================================================
   SIMPLE LIST FETCH (compat helper)
   Keeps older pages working: getPortfolioItems(max)
============================================================ */

export async function getPortfolioItems(max = 50): Promise<PortfolioItem[]> {
  const res = await getPortfolioItemsPaged({
    pageSize: max,
    cursor: null,
    filters: {}, // caller can use paged if they want filtering
  });
  return res.items;
}

/* ============================================================
   PAGED QUERY
============================================================ */

export async function getPortfolioItemsPaged(opts?: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  filters?: PortfolioFilters;
}): Promise<PortfolioPageResult> {
  const pageSize = opts?.pageSize ?? 24;
  const cursor = opts?.cursor ?? null;
  const filters = opts?.filters ?? {};

  const colRef = collection(db, "portfolioItems");

  const wheres: any[] = [];

  if (filters.active === true) {
    wheres.push(where("active", "==", true));
  }

  if (filters.featured === true) {
    wheres.push(where("featured", "==", true));
  }

  if (filters.type) {
    wheres.push(where("type", "==", filters.type));
  }

  if (filters.category) {
    wheres.push(where("category", "==", filters.category));
  }

  if (filters.tag) {
    wheres.push(where("tags", "array-contains", filters.tag));
  }

  if (filters.location) {
    wheres.push(where("location", "==", filters.location));
  }

  if (filters.clientName) {
    wheres.push(where("clientName", "==", filters.clientName));
  }

  const tryQuery = async (field: "createdAt" | "updatedAt") => {
    const constraints: any[] = [...wheres, orderBy(field, "desc"), limit(pageSize)];

    if (cursor) {
      // insert startAfter before limit
      constraints.splice(constraints.length - 1, 0, startAfter(cursor));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    const docs = snap.docs;
    const items = docs.map(normalizeDoc);

    const nextCursor = docs.length === pageSize ? docs[docs.length - 1] : null;

    return { items, nextCursor, usedOrdering: field as const };
  };

  try {
    return await tryQuery("createdAt");
  } catch {
    try {
      return await tryQuery("updatedAt");
    } catch {
      // Last resort: unordered fetch + local sort
      const constraints: any[] = [...wheres, limit(pageSize)];
      if (cursor) constraints.splice(constraints.length - 1, 0, startAfter(cursor));

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);

      const docs = snap.docs;
      let items = docs.map(normalizeDoc);

      items = items.sort((a, b) => (b.sortTime ?? 0) - (a.sortTime ?? 0));

      const nextCursor = docs.length === pageSize ? docs[docs.length - 1] : null;

      return { items, nextCursor, usedOrdering: "none" as const };
    }
  }
}