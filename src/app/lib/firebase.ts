
import { initializeApp, getApps, getApp } from "firebase/app";

/**
 * @fileOverview Firebase Initialization for Varban Markets.
 * 
 * Provides the initialized Firebase app instance for use throughout the application.
 */

const firebaseConfig = {
  apiKey: "AIzaSyC9XLWHL73NMtkpyHyoHgHdJy1_Ou6fxIc",
  authDomain: "studio-4710165847-c7c96.firebaseapp.com",
  projectId: "studio-4710165847-c7c96",
  storageBucket: "studio-4710165847-c7c96.firebasestorage.app",
  messagingSenderId: "861002428467",
  appId: "1:861002428467:web:07b9d5d465596859be7346"
};

// Initialize Firebase for Next.js environment compatibility
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };
