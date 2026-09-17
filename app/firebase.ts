import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCshj69PliJ5sCQ9bIW1GkrXaXIOhMCYWg",
  authDomain: "rannadress.firebaseapp.com",
  projectId: "rannadress",
  storageBucket: "rannadress.firebasestorage.app",
  messagingSenderId: "963035839894",
  appId: "1:963035839894:web:8a9a2b96fa27a9ef4431b7",
  measurementId: "G-5CF16C3NLD"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
