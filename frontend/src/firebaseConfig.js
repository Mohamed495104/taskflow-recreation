import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB_NVEa-HwgzRscZmqnYJv6QoZR0w8EmWk",
  authDomain: "task-manager-recreation-app.firebaseapp.com",
  projectId: "task-manager-recreation-app",
  storageBucket: "task-manager-recreation-app.firebasestorage.app",
  messagingSenderId: "904889347133",
  appId: "1:904889347133:web:66904d3e5ea9e281d64e54"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Initialize Firebase
export { app, auth, db };
export default app;