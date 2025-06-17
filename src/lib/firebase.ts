
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2OaJq8Psvj3mCLDBCrcv-7d24eINCSPs",
  authDomain: "whisk-51712.firebaseapp.com",
  projectId: "whisk-51712",
  storageBucket: "whisk-51712.firebasestorage.app",
  messagingSenderId: "880868191941",
  appId: "1:880868191941:web:847167a98ae595c9420aac",
  measurementId: "G-55KD657X9H"
};

let app: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;
let storage: FirebaseStorage | undefined = undefined;
let auth: Auth | undefined = undefined;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase: Main app initialized successfully.");
  } else {
    app = getApp();
    console.log("Firebase: Existing main app retrieved.");
  }
} catch (error) {
  console.error("Firebase: CRITICAL - Failed to initialize Firebase app. Ensure firebaseConfig is correct and an app with this name hasn't been initialized elsewhere with different config. Error:", error);
  // app remains undefined
}

if (app) {
  try {
    db = getFirestore(app);
    console.log("Firebase: Firestore service initialized successfully.");
  } catch (error) {
    console.error("Firebase: Failed to initialize Firestore. Is it enabled in your Firebase project console? Error:", error);
    // db remains undefined
  }

  try {
    storage = getStorage(app);
    console.log("Firebase: Storage service initialized successfully.");
  } catch (error) {
    console.error("Firebase: Failed to initialize Firebase Storage. Is it enabled in your Firebase project console? Error:", error);
    // storage remains undefined
  }

  try {
    auth = getAuth(app);
    console.log("Firebase: Auth service initialized successfully.");
  } catch (error) {
    console.error("Firebase: Failed to initialize Firebase Auth. Is it enabled (Email/Password provider) in your Firebase project console? Error:", error);
    // auth remains undefined
  }
} else {
  // This message is critical if 'app' itself failed to initialize.
  console.error("Firebase: Main Firebase app was NOT initialized. Consequently, services (Firestore, Storage, Auth) will NOT be available. Check previous critical errors.");
}

export { app, db, storage, auth };
