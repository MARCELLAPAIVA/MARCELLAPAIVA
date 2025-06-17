
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
      console.error("Firebase services (Firestore/Storage) are not properly initialized. Check Firebase configuration in src/lib/firebase.ts and ensure services are enabled in the Firebase console. Cannot add product.");
      return null;
  }

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id;

    const imageNameForStorage = getImageNameForStorage(imageFile.name, productId);
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${imageNameForStorage}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl,
      imageName: imageFile.name, 
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
        createdAt: Date.now(), 
    };

  } catch (error) {
    console.error("Error adding product to Firebase: ", error);
    throw error;
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  if (!db) {
      console.error("Firestore 'db' is not properly initialized. Check Firebase configuration in src/lib/firebase.ts and ensure Firestore is enabled in the Firebase console. Returning empty product list.");
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
        createdAt: data.createdAt?.toDate?.().getTime() || data.createdAt || Date.now(),
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Error getting products from Firebase: ", error);
    return []; 
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("Firebase services (Firestore/Storage) are not properly initialized. Check Firebase configuration in src/lib/firebase.ts and ensure services are enabled in the Firebase console. Cannot delete product.");
      return false;
  }

  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl); 
        await deleteObject(imageRef);
      } catch (storageError: any) {
        console.warn(`Attempt to delete image by full URL ${imageUrl} failed (this is common if not a direct gs:// path). Error: ${storageError.message}. Ensure storage rules allow deletion and path is correct.`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error deleting product from Firebase: ", error);
    return false;
  }
};
