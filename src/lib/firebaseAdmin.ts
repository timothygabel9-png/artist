import admin from "firebase-admin";
import fs from "fs";
import path from "path";

function getServiceAccount() {
  const localPath = path.join(process.cwd(), "serviceAccountKey.json");

  // Local dev: use JSON file directly if present
  if (fs.existsSync(localPath)) {
    const raw = fs.readFileSync(localPath, "utf8");
    return JSON.parse(raw);
  }

  // Production / Netlify fallback: env vars
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Use serviceAccountKey.json locally or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const serviceAccount = getServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getAdminDb() {
  return getAdminApp().firestore();
}