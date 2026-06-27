import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdGetJpCXbKIXtIrVMam7p4WMTF6DzX9g",
  authDomain: "bunchee-tve.firebaseapp.com",
  projectId: "bunchee-tve",
  storageBucket: "bunchee-tve.firebasestorage.app",
  messagingSenderId: "182306844704",
  appId: "1:182306844704:web:2a0397fdcf417e7911cc45",
};

// ป้องกันการ initialize ซ้ำตอน hot-reload ใน dev mode
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
