import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Copie as credenciais do Firebase Console e cole aqui:
const firebaseConfig = {
  apiKey: "AIzaSyA8dFAkjS5kRdUSKuLPkHd2Cy9LFkjre64",
  authDomain: "study-tracking-78f4f.firebaseapp.com",
  projectId: "study-tracking-78f4f",
  storageBucket: "study-tracking-78f4f.firebasestorage.app",
  messagingSenderId: "211806029615",
  appId: "1:211806029615:web:c4d99660fb60351d0a43da",
  measurementId: "G-JWWDL84H71"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };