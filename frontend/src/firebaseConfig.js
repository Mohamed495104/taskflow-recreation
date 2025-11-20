import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_NVEa-HwgzRscZmqnYJv6QoZR0w8EmWk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "task-manager-recreation-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "task-manager-recreation-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "task-manager-recreation-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "904889347133",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:904889347133:web:66904d3e5ea9e281d64e54"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firebase (Auth only - no Firestore)
export { app, auth };
export default app;