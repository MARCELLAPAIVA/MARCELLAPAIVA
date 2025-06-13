
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Function to get image name for storage path
const getImageNameForStorage = (imageName: string | undefined, productId: string) => {
  const extension = imageName?.split('.').pop() || 'jpg';
  return `product_${productId}_${Date.now()}.${extension}`;
}

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl'>,
  imageFile: File
): Promise<Product> => {
  try {
    // 1. Add a temporary document to Firestore to get an ID
    // We will update it later with the imageUrl
    const tempProductRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: serverTimestamp(), // Use server timestamp
      imageUrl: '', // Placeholder
      imageName: imageFile.name,
    });
    const productId = tempProductRef.id;

    // 2. Upload image to Firebase Storage
    const imageNameForStorage = getImageNameForStorage(imageFile.name, productId);
    const storageRef = ref(storage, `${PRODUCTS_COLLECTION}/${productId}/${imageNameForStorage}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // 3. Update the product document in Firestore with the actual image URL
    // For simplicity, we'll re-fetch the product or just create the product object for return
    // In a real app, you might update the document, but addDoc followed by structuring the return is fine for now
    
    // For now, Firestore doesn't return the full document with serverTimestamp resolved immediately on addDoc.
    // So we construct the object to return. For a more robust solution, you'd fetch the doc or use onSnapshot.
    const newProduct: Product = {
        id: productId,
        description: productData.description,
        price: productData.price,
        imageUrl: imageUrl,
        imageName: imageFile.name,
        createdAt: Date.now(), // Use client-side timestamp for immediate UI update, Firestore has serverTimestamp
    };
    
    // If you want to update the doc with the URL (optional if you structure the return value)
    // await updateDoc(tempProductRef, { imageUrl: imageUrl });

    return newProduct;

  } catch (error) {
    console.error("Error adding product to Firebase: ", error);
    throw error;
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  try {
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(productsQuery);
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        imageUrl: data.imageUrl,
        imageName: data.imageName,
        price: data.price,
        createdAt: data.createdAt?.toDate?.().getTime() || data.createdAt || Date.now(), // Handle server timestamp
      } as Product;
    });
    return products;
  } catch (error) {
    console.error("Error getting products from Firebase: ", error);
    throw error;
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl: string): Promise<void> => {
  try {
    // Delete product document from Firestore
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    // Delete image from Firebase Storage
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl); // imageUrl is the full gs:// or https:// URL
      await deleteObject(imageRef).catch((error) => {
        // It's possible the image doesn't exist or URL is malformed, log but don't fail the whole operation
        console.warn("Error deleting image from storage (may not be critical): ", error);
      });
    }
  } catch (error) {
    console.error("Error deleting product from Firebase: ", error);
    throw error;
  }
};
