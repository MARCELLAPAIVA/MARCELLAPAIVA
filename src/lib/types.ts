
export interface Product {
  id: string; // Firestore document ID
  description: string;
  imageUrl: string; // URL from Firebase Storage
  imageName?: string; // Original image name, can be part of the storage path
  price: number; // Product price
  createdAt: number; // Timestamp for sorting
}
