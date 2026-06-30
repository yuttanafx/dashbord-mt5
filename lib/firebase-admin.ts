import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin SDK ใช้เฉพาะฝั่งเซิร์ฟเวอร์ (API routes) เท่านั้น
// ต่างจาก lib/firebase.ts (Client SDK) ที่ใช้ในหน้าเว็บฝั่งผู้ใช้
// Admin SDK มีสิทธิ์เต็ม ข้าม Security Rules ได้ จึงต้องเก็บคีย์เป็นความลับสูงสุด
// และห้าม import ไฟล์นี้ในไฟล์ที่มี "use client" เด็ดขาด

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // private key เก็บใน env var เป็น string ที่มี \n คั่นบรรทัด ต้องแปลงกลับเป็น newline จริง
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials missing. ตรวจสอบ Environment Variables: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
