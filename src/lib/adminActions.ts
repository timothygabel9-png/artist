import { db, storage } from "@/lib/firebase";
import {
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

/** Soft delete (recommended for portfolio) */
export async function softDeletePortfolioItem(id: string) {
  await updateDoc(doc(db, "portfolioItems", id), {
    active: false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hard delete Firestore doc
 */
async function hardDeleteDoc(collectionName: string, id: string) {
  await deleteDoc(doc(db, collectionName, id));
}

/**
 * If your doc stores storage paths (recommended), delete those files too.
 * Works for studioProjects + mediaItems if you store `...Path` fields.
 */
async function deleteStoragePaths(paths: (string | undefined)[]) {
  const valid = paths.filter(Boolean) as string[];
  await Promise.allSettled(valid.map((p) => deleteObject(ref(storage, p))));
}

/** Hard delete for Tees (if you store images with paths) */
export async function hardDeleteTeeProduct(id: string) {
  const snap = await getDoc(doc(db, "teeProducts", id));
  if (snap.exists()) {
    const data = snap.data() as any;
    // Optional if you have images stored with paths
    await deleteStoragePaths([
      data.imagePath,
      data.thumbnailPath,
      // add more if you store them
    ]);
  }
  await hardDeleteDoc("teeProducts", id);
}

/** Hard delete for Media (audio/video) */
export async function hardDeleteMediaItem(id: string) {
  const snap = await getDoc(doc(db, "mediaItems", id));
  if (snap.exists()) {
    const data = snap.data() as any;

    // Best practice: store audioPath/videoPath in the doc.
    await deleteStoragePaths([
      data.audioPath,
      data.videoPath,
      data.coverImagePath,
    ]);
  }
  await hardDeleteDoc("mediaItems", id);
}

/** Hard delete for Studio projects (cover + media array paths) */
export async function hardDeleteStudioProject(id: string) {
  const snap = await getDoc(doc(db, "studioProjects", id));
  if (snap.exists()) {
    const data = snap.data() as any;

    const mediaPaths: string[] =
      Array.isArray(data.media) ? data.media.map((m: any) => m?.path) : [];

    await deleteStoragePaths([data.coverImagePath, ...mediaPaths]);
  }
  await hardDeleteDoc("studioProjects", id);
}