// Ubicación: src/firebaseConfig.js

// Importa las funciones necesarias del SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database'; // Importa Realtime Database
import { getAuth } from 'firebase/auth';     // Importa Authentication
import { getFirestore } from 'firebase/firestore'; // 🚨 IMPORTAR FIRESTORE

// Tu objeto de configuración de Firebase (sin cambios)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Inicializa los servicios que necesitas y expórtalos
export const auth = getAuth(app);
export const database = getDatabase(app); // Realtime Database
export const analytics = getAnalytics(app);

// 🚨 INICIALIZAR Y EXPORTAR FIRESTORE COMO 'db'
export const db = getFirestore(app);

// Exporta la instancia principal de la app si la necesitas en otros lugares
export default app;

console.log("Firebase ha sido inicializado correctamente:", app);