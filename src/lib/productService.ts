import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc, getDoc, type Timestamp } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Simplified function to generate a clean, unique filename.
const generateStorageFileName = (originalFileName: string): string => {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  // Using a timestamp and a random element for uniqueness, avoiding complex sanitization.
  const uniqueName = `image_${Date.now()}_${Math.round(Math.random() * 1E9)}.${extension}`;
  console.log(`ProductService: Generated unique storage filename: ${uniqueName}`);
  return uniqueName;
}

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'storagePath' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("ProductService: Firestore 'db' or Storage 'storage' is not properly initialized.");
      return null;
  }
  console.log("ProductService: addProductToFirebase initiated for:", productData.description);

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id;

    const storageFileName = generateStorageFileName(imageFile.name);
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${storageFileName}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    console.log("ProductService: Uploading to storage path:", storageRefPath);
    await uploadBytes(fileStorageRef, imageFile);
    console.log("ProductService: Image uploaded successfully.");
    
    // IMPORTANT: We no longer save the download URL. We only save the path.
    const newProductFirestoreData = {
      ...productData,
      imageName: storageFileName, // The new, clean filename
      storagePath: storageRefPath, // The full path for easy reference
      createdAt: serverTimestamp(),
    };

    await setDoc(productDocRef, newProductFirestoreData);
    console.log("ProductService: Product data saved to Firestore with ID:", productId);

    const createdProduct: Product = {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        storagePath: storageRefPath,
        imageName: storageFileName,
        createdAt: Date.now(), // Approximate, Firestore timestamp is more accurate
    };
    return createdProduct;

  } catch (error) {
    console.error("ProductService: Error adding product to Firebase: ", error);
    return null;
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  if (!db) {
      console.error("ProductService: Firestore 'db' is not initialized. Returning empty product list.");
      return [];
  }
  try {
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(productsQuery);
    console.log(`ProductService: Found ${querySnapshot.docs.length} product documents.`);
    
    const products: Product[] = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      const createdAtTimestamp = data.createdAt as Timestamp;
      
      const productItem: Product = {
        id: docSnapshot.id,
        description: data.description || "Descrição Indisponível",
        storagePath: data.storagePath || "", // This is now the source of truth
        imageName: data.imageName || "",
        price: typeof data.price === 'number' ? data.price : 0,
        category: data.category || "Sem Categoria",
        createdAt: createdAtTimestamp?.toDate?.().getTime() || Date.now(),
      };
      
      if (!productItem.storagePath) {
        console.warn(`ProductService: Product ID ${productItem.id} has a MISSING storagePath in Firestore.`);
      }
      return productItem;
    });
    
    return products.filter(p => p.storagePath); // Ensure products without a path are filtered out
  } catch (error) {
    console.error("ProductService: CRITICAL error getting products from Firebase: ", error);
    return [];
  }
};

export const deleteProductFromFirebase = async (productId: string, storagePath: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("ProductService: Firestore or Storage is not initialized.");
      return false;
  }
  if (!storagePath) {
      console.error("ProductService: storagePath is missing. Cannot delete image from Storage.");
      // still attempt to delete firestore doc
  }
  console.log(`ProductService: Attempting to delete product: ${productId} with storagePath: ${storagePath}`);

  try {
    // Delete Firestore document
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productDocRef);
    console.log("ProductService: Product deleted from Firestore:", productId);

    // Delete image from Storage using the provided path
    if (storagePath) {
        const imageRef = ref(storage, storagePath);
        await deleteObject(imageRef);
        console.log("ProductService: Image deleted from Storage using path:", storagePath);
    }
    return true;

  } catch (error: any) {
    console.error("ProductService: Error deleting product from Firebase: ", error);
    if (error.code === 'storage/object-not-found') {
        console.warn("ProductService: Image not found in storage for deletion, but Firestore doc was deleted. This may be okay.");
        return true; // Consider it a success if the data is gone.
    }
    return false;
  }
};
