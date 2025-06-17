
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'admin' | 'client';

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
  role: UserRole;
  status: UserStatus;
  createdAt?: number; // Timestamp for when user doc was created
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  generateWhatsAppMessage: () => string;
  isCartVisibleToUser: boolean;
}
