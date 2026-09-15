// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// development
// const firebaseConfig = {
//   apiKey: "AIzaSyCkp2TSlgsF9RFHuqxNDfs8YX5u-PGTq7o",
//   authDomain: "apartment-management-6d1d1.firebaseapp.com",
//   projectId: "apartment-management-6d1d1",
//   storageBucket: "apartment-management-6d1d1.appspot.com",
//   messagingSenderId: "251397483225",
//   appId: "1:251397483225:web:09a40d95f6397f0fee6cc8",
//   measurementId: "G-CW4F7DRJMQ",
// };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
