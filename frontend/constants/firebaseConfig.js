// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCMTFU99XqI5jolSXdK7j3gHejLttEyQwc",
  authDomain: "sportbuddies-data-821a9.firebaseapp.com",
  projectId: "sportbuddies-data-821a9",
  storageBucket: "sportbuddies-data-821a9.firebasestorage.app",
  messagingSenderId: "432172538825",
  appId: "1:432172538825:web:3ce8000619caf1cdbee618",
  measurementId: "G-74VLHGQSF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };