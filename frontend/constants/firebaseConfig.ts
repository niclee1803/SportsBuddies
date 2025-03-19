// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Optionally, if you need Analytics (you can remove if not)
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCMTFU99XqI5jolSXdK7j3gHejLttEyQwc",
  authDomain: "sportbuddies-data-821a9.firebaseapp.com",
  projectId: "sportbuddies-data-821a9",
  storageBucket: "sportbuddies-data-821a9.firebasestorage.app",
  messagingSenderId: "432172538825",
  appId: "1:432172538825:web:3ce8000619caf1cdbee618",
  measurementId: "G-74VLHGQSF0"
};

const app = initializeApp(firebaseConfig);
// Optional: Initialize Analytics if you want to use it
// const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };