
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// IMPORTANT: Replace with your app's Firebase project configuration
// Go to your Firebase project settings, find "Your apps", and copy the config object.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your API key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your Auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your Storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your App ID
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional: for Google Analytics
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
