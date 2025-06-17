
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
): Promise<Product | null> => { // Return null on critical failure
  try {
    if (!db || !storage || typeof db.INTERNAL === 'undefined' || typeof storage.INTERNAL === 'undefined') {
        console.error("Firebase services (Firestore/Storage) are not initialized. Check Firebase config.");
        return null;
    }

    // 1. Create a document reference with a new ID for Firestore
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id;

    // 2. Upload image to Firebase Storage using the new product ID in the path
    const imageNameForStorage = getImageNameForStorage(imageFile.name, productId);
    const storageRef = ref(storage, `${PRODUCTS_COLLECTION}/${productId}/${imageNameForStorage}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // 3. Set the product document in Firestore with all data, including the image URL and original image name
    const newProductDataWithImage = {
      ...productData, // Contains description, price, category
      imageUrl: imageUrl,
      imageName: imageFile.name, // Store original image name
      createdAt: serverTimestamp(),
    };
    await setDoc(productDocRef, newProductDataWithImage);

    return {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: imageUrl,
        imageName: imageFile.name,
        createdAt: Date.now(), // Client-side timestamp for immediate UI use
    };

  } catch (error) {
    console.error("Error adding product to Firebase: ", error);
    // In a real app, you might want to differentiate errors (e.g., toast to user)
    // For now, re-throwing might be okay if the caller handles it, or return null
    throw error; // Or return null if you want the caller to handle it without crashing.
                 // For an ISE, if this function is called server-side, re-throwing can cause it.
                 // However, addProduct is more likely client-initiated.
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  try {
    if (!db || typeof db.INTERNAL === 'undefined') {
        console.error("Firestore 'db' is not initialized. Check Firebase config. Returning empty product list.");
        return [];
    }

    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(productsQuery);
    const products = querySnapshot.docs.map(docSnapshot => { // Renamed 'doc' to 'docSnapshot' to avoid conflict
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        description: data.description,
        imageUrl: data.imageUrl,
        imageName: data.imageName,
        price: data.price,
        category: data.category,
        createdAt: data.createdAt?.toDate?.().getTime() || data.createdAt || Date.now(),
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Error getting products from Firebase: ", error);
    // Return empty array to potentially prevent server crash if this is called server-side and unhandled.
    return [];
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl: string): Promise<boolean> => {
  try {
     if (!db || !storage || typeof db.INTERNAL === 'undefined' || typeof storage.INTERNAL === 'undefined') {
        console.error("Firebase services (Firestore/Storage) are not initialized. Check Firebase config.");
        return false;
    }
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl); 
        await deleteObject(imageRef);
      } catch (storageError: any) {
        // Log a warning if deleting by URL fails, as it sometimes does if not a direct gs:// path
        console.warn(`Attempt to delete image by URL ${imageUrl} failed (this is common). Error: ${storageError.message}`);
        // Attempt to delete using known path structure (if imageName was stored on product and path is consistent)
        // This requires fetching the product doc again to get imageName, or passing imageName to this function
        // For simplicity, this fallback is not fully implemented here but shows the idea.
        // Example: if product.imageName was 'myimage.jpg', path could be `products/${productId}/${product.imageName}`
        // console.log("Consider implementing a fallback deletion strategy if image name and path structure are known.");
      }
    }
    return true;
  } catch (error) {
    console.error("Error deleting product from Firebase: ", error);
    return false;
  }
};
