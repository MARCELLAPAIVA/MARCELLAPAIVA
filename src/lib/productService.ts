
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Function to get image name for storage path
const getImageNameForStorage = (imageName: string | undefined, productId: string) => {
  const extension = imageName?.split('.').pop() || 'jpg';
  // Ensure a unique element even if imageName is undefined or very short
  const uniquePart = Date.now();
  const baseName = imageName ? imageName.substring(0, imageName.lastIndexOf('.')) || `image_${uniquePart}` : `image_${uniquePart}`;
  return `product_${productId}_${baseName}.${extension}`;
}

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot add product. Check Firebase configuration and ensure services are enabled.");
      return null;
  }

  try {
    // Use Firestore's ability to generate an ID upfront by creating a new doc reference
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id; // Get the auto-generated ID

    // Use a more robust image name for storage, incorporating the product ID
    const imageNameForStorage = getImageNameForStorage(imageFile.name, productId);
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${imageNameForStorage}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl,
      imageName: imageFile.name, // Storing original name for reference, if needed
      createdAt: serverTimestamp(), // Use server timestamp
    };

    // Set the document with the specific ID
    await setDoc(productDocRef, newProductDataWithImage);

    // For the return value, we might not have the exact server timestamp immediately
    // So, we'll use client's current time as a fallback for the immediate return object
    return {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: imageUrl,
        imageName: imageFile.name,
        createdAt: Date.now(), // Fallback for local state update
    };

  } catch (error) {
    console.error("Firebase ProductService: Error adding product to Firebase: ", error);
    throw error; // Re-throw to be caught by calling function for UI feedback
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  if (!db) {
      console.error("Firebase ProductService: Firestore 'db' is not properly initialized in getProductsFromFirebase. Check Firebase configuration and ensure Firestore is enabled. Returning empty product list.");
      return [];
  }

  try {
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(productsQuery);
    const products = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        description: data.description,
        imageUrl: data.imageUrl,
        imageName: data.imageName,
        price: data.price,
        category: data.category,
        // Ensure createdAt is handled correctly, whether it's a Firestore Timestamp or already a number
        createdAt: data.createdAt?.toDate?.().getTime() || data.createdAt || Date.now(),
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Firebase ProductService: Error getting products from Firebase: ", error);
    return []; // Return empty list on error to prevent app crash
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot delete product. Check Firebase configuration.");
      return false;
  }

  try {
    // Delete Firestore document
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    // Delete image from Storage
    // It's safer to construct the ref from the known path structure if possible,
    // but if only imageUrl is available, Firebase SDK can parse gs:// or https:// URLs.
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl); // This works for gs:// and https:// Firebase Storage URLs
        await deleteObject(imageRef);
      } catch (storageError: any) {
        // Log a warning if image deletion fails, but don't let it block product deletion
        console.warn(`Firebase ProductService: Failed to delete image from Storage at ${imageUrl}. It might have already been deleted or path is incorrect. Error: ${storageError.message}`);
        // Check if the error is 'storage/object-not-found', which can be ignored if we expect it might be missing
        if (storageError.code !== 'storage/object-not-found') {
           // For other storage errors, you might want to log more verbosely or handle differently
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Firebase ProductService: Error deleting product from Firebase: ", error);
    return false; // Indicate failure
  }
};
