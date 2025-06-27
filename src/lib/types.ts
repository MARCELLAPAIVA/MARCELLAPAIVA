
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'admin' | 'client';

export interface Product {
  id: string; // Firestore document ID
  description: string;
  storagePath: string; // Path in Firebase Storage, e.g., "products/xyz/image.jpg"
  imageUrl?: string; // Optional: will be populated on the client-side dynamically
  imageName?: string; // The simple name of the file in storage, e.g., "image.jpg"
  price: number; // Product price
  category: string; // Product category
  createdAt: number; // Timestamp for sorting
}

export interface User { // This type is used by AuthContext, represents the logged-in user state
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

// Interface para os dados como são armazenados no Firestore (usada em userService)
export interface UserDocument {
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue;
  updatedAt: import('firebase/firestore').Timestamp | import('firebase/firestore').FieldValue;
}

// Interface para os dados como são retornados e usados na UI (com Timestamps convertidos)
export interface UserData {
  uid: string; // Crucial for identifying user in lists/updates
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: number;
  updatedAt?: number;
}
