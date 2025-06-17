
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp, type FieldValue } from 'firebase/firestore';
import type { UserRole, UserStatus } from './types';

// Interface para os dados como são armazenados no Firestore
export interface UserDocument {
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp | FieldValue; // Usar FieldValue para serverTimestamp na escrita
  updatedAt: Timestamp | FieldValue; // Usar FieldValue para serverTimestamp na escrita
}

// Interface para os dados como são retornados (com Timestamps convertidos para numbers)
export interface UserData {
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: number;
  updatedAt?: number;
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  if (!db) {
    console.error("UserService: Firestore 'db' is not initialized.");
    return null;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserDocument;
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toMillis?.() || undefined,
        updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() || undefined,
      };
    }
    console.log(`UserService: No document found for user UID: ${uid}`);
    return null;
  } catch (error) {
    console.error("UserService: Error fetching user data for UID:", uid, error);
    return null;
  }
};

export const setUserData = async (uid: string, data: Partial<Omit<UserDocument, 'createdAt' | 'updatedAt'> & { createdAt?: FieldValue, updatedAt?: FieldValue }>): Promise<boolean> => {
  if (!db) {
    console.error("UserService: Firestore 'db' is not initialized.");
    return false;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    const dataToSet: Partial<UserDocument> = { ...data };

    // Define createdAt apenas se não estiver sendo passado (geralmente na criação)
    if (!data.createdAt && Object.keys(data).some(key => !['updatedAt'].includes(key))) {
        dataToSet.createdAt = serverTimestamp();
    }
    dataToSet.updatedAt = serverTimestamp();

    await setDoc(userDocRef, dataToSet, { merge: true });
    return true;
  } catch (error) {
    console.error("UserService: Error setting user data for UID:", uid, error);
    return false;
  }
};

