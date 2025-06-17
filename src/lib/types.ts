
export interface Product {
  id: string; // Firestore document ID
  description: string;
  imageUrl: string; // URL from Firebase Storage
  imageName?: string; // Original image name, can be part of the storage path
  price: number; // Product price
  category: string; // Product category
  createdAt: number; // Timestamp for sorting
}

export interface User {
  uid: string; // Firebase Auth User ID
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'client';
}
