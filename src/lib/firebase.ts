
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

console.log("Firebase: Attempting to load firebase.ts module...");

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
  console.log("Firebase: Inside main try block for initialization.");
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain || !firebaseConfig.storageBucket || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) {
    console.error("Firebase: CRITICAL - firebaseConfig is missing one or more required fields (apiKey, projectId, authDomain, storageBucket, messagingSenderId, appId). Firebase cannot be initialized. Please verify all keys are present and correct.");
  } else if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase: Main app initialized successfully via initializeApp(). Project ID:", firebaseConfig.projectId);
  } else {
    app = getApp();
    console.log("Firebase: Existing main app retrieved via getApp(). Project ID:", app.options.projectId);
  }

  if (app) {
    try {
      db = getFirestore(app);
      console.log("Firebase: Firestore service initialized successfully.");
    } catch (e) {
      console.error("Firebase: Failed to initialize Firestore. Is it enabled in your Firebase project console? Error:", e);
      // db remains undefined
    }

    try {
      storage = getStorage(app);
      console.log("Firebase: Storage service initialized successfully.");
    } catch (e) {
      console.error("Firebase: Failed to initialize Firebase Storage. Is it enabled in your Firebase project console? Error:", e);
      // storage remains undefined
    }

    try {
      auth = getAuth(app);
      console.log("Firebase: Auth service initialized successfully.");
    } catch (e) {
      console.error("Firebase: Failed to initialize Firebase Auth. Is it enabled (Email/Password provider) in your Firebase project console? Error:", e);
      // auth remains undefined
    }
  } else {
    // This log will now only appear if 'app' genuinely couldn't be initialized AND firebaseConfig wasn't missing keys.
    // This implies a more fundamental issue with initializeApp or getApp if config seemed okay.
    console.error("Firebase: Main Firebase app (app object) is undefined after initialization attempt, despite firebaseConfig seeming complete. Services (Firestore, Storage, Auth) will NOT be available.");
  }
} catch (error) {
  console.error("Firebase: CRITICAL - Uncaught error during Firebase app or service initialization process. This usually indicates a problem with the firebaseConfig object or the Firebase SDK itself. Error:", error);
  // app, db, storage, auth may remain undefined
}

console.log("Firebase: firebase.ts module loaded. Final status - app:", app ? `initialized (Project: ${app.options.projectId})` : 'undefined', "db:", db ? 'initialized' : 'undefined', "storage:", storage ? 'initialized' : 'undefined', "auth:", auth ? 'initialized' : 'undefined');

export { app, db, storage, auth };
