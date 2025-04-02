import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA8dFAkjS5kRdUSKuLPkHd2Cy9LFkjre64",
    authDomain: "study-tracking-78f4f.firebaseapp.com",
    projectId: "study-tracking-78f4f",
    storageBucket: "study-tracking-78f4f.firebasestorage.app",
    messagingSenderId: "211806029615",
    appId: "1:211806029615:web:c4d99660fb60351d0a43da",
    measurementId: "G-JWWDL84H71"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

