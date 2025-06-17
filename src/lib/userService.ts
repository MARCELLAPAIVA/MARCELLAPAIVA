
'use server';

import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, type Timestamp, type FieldValue, collection, getDocs, query, where, updateDoc, type Query, type DocumentData, orderBy } from 'firebase/firestore';
import type { UserRole, UserStatus, UserDocument, UserData } from './types';


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
        uid: docSnap.id, // Ensure UID is part of the returned UserData
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        status: data.status,
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

export const getUsers = async (filter?: { status?: UserStatus }): Promise<UserData[]> => {
  if (!db) {
    console.error("UserService: Firestore 'db' is not initialized when trying to get users.");
    return [];
  }
  try {
    let usersQuery: Query<DocumentData, DocumentData> = collection(db, 'users');

    if (filter?.status) {
      usersQuery = query(usersQuery, where('status', '==', filter.status));
    }
    // Order by creation time to see newest pending users first, for example
    usersQuery = query(usersQuery, orderBy('createdAt', 'desc'));


    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() as UserDocument; // Cast to UserDocument
      return {
        uid: docSnapshot.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        status: data.status,
        createdAt: (data.createdAt as Timestamp)?.toMillis?.() || undefined, // Convert Firestore Timestamp
        updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() || undefined, // Convert Firestore Timestamp
      };
    });
    return users;
  } catch (error) {
    console.error("UserService: Error fetching list of users:", error);
    return [];
  }
};

export const updateUserStatus = async (uid: string, newStatus: UserStatus): Promise<boolean> => {
  if (!db) {
    console.error("UserService: Firestore 'db' is not initialized. Cannot update user status.");
    return false;
  }
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    console.log(`UserService: User ${uid} status updated to ${newStatus}.`);
    return true;
  } catch (error) {
    console.error(`UserService: Error updating status for user ${uid} to ${newStatus}:`, error);
    return false;
  }
};
