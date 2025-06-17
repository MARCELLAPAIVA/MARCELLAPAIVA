
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
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

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
storage = getStorage(app);

export { app, db, storage };
