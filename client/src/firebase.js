// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your NEW Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-P4YMlS4U3nvPvKOF1LOBi0qzr4xjxmU",
  authDomain: "collage-trail.firebaseapp.com",
  projectId: "collage-trail",
  storageBucket: "collage-trail.firebasestorage.app",
  messagingSenderId: "70273205946",
  appId: "1:70273205946:web:b5a9dad42d590098d36483",
  measurementId: "G-T4W1ZZZ1GV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const analytics = getAnalytics(app);
export const auth = getAuth(app);                // Used for Login
export const googleProvider = new GoogleAuthProvider(); // Used for Google Sign-In