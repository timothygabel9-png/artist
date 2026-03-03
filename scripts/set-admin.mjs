import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serviceAccountKey.json is one level up from /scripts
const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node scripts/set-admin.mjs <UID_or_EMAIL>");
    process.exit(1);
  }

  let uid = arg;

  // If it looks like an email, resolve to UID
  if (arg.includes("@")) {
    const user = await admin.auth().getUserByEmail(arg);
    uid = user.uid;
    console.log(`Resolved email ${arg} -> uid ${uid}`);
  }

  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ Set admin=true for uid: ${uid}`);

  // Optional: show claims (server-side only)
  const updated = await admin.auth().getUser(uid);
  console.log("Custom claims now:", updated.customClaims);

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});