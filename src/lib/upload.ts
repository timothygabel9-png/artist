import { getAuth } from "firebase/auth";

async function debugAuth() {
  const auth = getAuth();

  console.log("email:", auth.currentUser?.email);
  console.log("uid:", auth.currentUser?.uid);

  const tok = await auth.currentUser?.getIdTokenResult(true);
  console.log("claims:", tok?.claims);
}

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const ALLOWED_ROOTS = ["portfolio", "media", "teeProducts", "tees"] as const;
type AllowedRoot = (typeof ALLOWED_ROOTS)[number];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_BYTES = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg", // mp3
  "audio/mp4", // m4a (often)
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
]);

function sanitizeFilename(name: string) {
  const base = name.trim().toLowerCase();
  return base
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function getRoot(path: string): string {
  return (path || "").split("/")[0] || "";
}

function assertAllowedPath(path: string) {
  const root = getRoot(path);
  if (!ALLOWED_ROOTS.includes(root as AllowedRoot)) {
    throw new Error(
      `Upload blocked: path must start with one of: ${ALLOWED_ROOTS.join(", ")}`
    );
  }
}

function inferKindAndValidate(file: File, path: string) {
  const type = file.type || "application/octet-stream";
  const root = getRoot(path);

  const isImage = type.startsWith("image/");
  const isAudio = type.startsWith("audio/");

  // media can be image or audio; others should be images
  if (root === "media") {
    if (isImage) {
      if (!ALLOWED_IMAGE_TYPES.has(type)) throw new Error("Unsupported image type.");
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is too large (max 10MB).");
      return {
        kind: "image" as const,
        contentType: type,
        cacheControl: "public,max-age=31536000,immutable",
      };
    }
    if (isAudio) {
      if (!ALLOWED_AUDIO_TYPES.has(type)) throw new Error("Unsupported audio type.");
      if (file.size > MAX_AUDIO_BYTES) throw new Error("Audio is too large (max 100MB).");
      return {
        kind: "audio" as const,
        contentType: type,
        cacheControl: "public,max-age=86400",
      };
    }
    throw new Error("Media uploads must be an image or audio file.");
  }

  // portfolio / teeProducts / tees => images only
  if (!isImage) throw new Error("Only image uploads are allowed for this folder.");
  if (!ALLOWED_IMAGE_TYPES.has(type)) throw new Error("Unsupported image type.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is too large (max 10MB).");

  return {
    kind: "image" as const,
    contentType: type,
    cacheControl: "public,max-age=31536000,immutable",
  };
}

function ensureTrailingFilename(path: string, file: File, unique: boolean) {
  if (!path.endsWith("/")) return path;

  const safe = sanitizeFilename(file.name || "upload");
  if (!unique) return `${path}${safe}`;

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${path}${stamp}-${rand}-${safe}`;
}

/**
 * Upload a file to Firebase Storage and return its download URL.
 *
 * - path must start with: portfolio/, media/, teeProducts/, or tees/
 * - If path ends with "/", a unique sanitized filename is appended (default).
 */
export async function uploadFile(
  file: File,
  path: string,
  opts?: { uniqueName?: boolean }
) {
  if (!file) throw new Error("No file provided.");
  if (!path) throw new Error("No upload path provided.");

  assertAllowedPath(path);

  const uniqueName = opts?.uniqueName ?? true;
  const finalPath = ensureTrailingFilename(path, file, uniqueName);

  const meta = inferKindAndValidate(file, finalPath);

  const storageRef = ref(storage, finalPath);

  await uploadBytes(storageRef, file, {
    contentType: meta.contentType,
    cacheControl: meta.cacheControl,
  });

  return await getDownloadURL(storageRef);
}