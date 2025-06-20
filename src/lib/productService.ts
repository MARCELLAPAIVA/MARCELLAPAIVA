
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc, getDoc, type Timestamp } from 'firebase/firestore'; // Added Timestamp
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Função para gerar um nome de arquivo seguro e padronizado para o Storage
const getImageNameForStorage = (originalFileName: string, productId: string) => {
  console.log("Firebase ProductService: getImageNameForStorage - Original filename for sanitization:", originalFileName);
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.') > 0 ? originalFileName.lastIndexOf('.') : originalFileName.length);
  
  const safeOriginalFileNameBase = baseName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace unsafe characters with _ (allows ., -)
    .replace(/_{2,}/g, '_') // Replace multiple underscores with a single one
    .substring(0, 50); // Truncate for safety/consistency

  const finalSanitizedName = `product_${productId}_${safeOriginalFileNameBase}_${Date.now()}.${extension}`;
  console.log("Firebase ProductService: getImageNameForStorage - Sanitized filename for storage:", finalSanitizedName);
  return finalSanitizedName;
};

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot add product. Check Firebase configuration and ensure services are enabled.");
      return null;
  }
  console.warn("Firebase ProductService: addProductToFirebase CALLED with productData description:", productData.description, "and original imageFile name:", imageFile.name);

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION)); 
    const productId = productDocRef.id;

    const storageFileName = getImageNameForStorage(imageFile.name, productId); 
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${storageFileName}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    console.warn("Firebase ProductService: Uploading to storage path:", storageRefPath, "using sanitized filename:", storageFileName);
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);
    console.warn("Firebase ProductService: Image uploaded. Sanitized storageFileName used:", storageFileName, "Final Download URL:", imageUrl);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl, 
      imageName: imageFile.name, // Store original name for reference if needed
      storagePath: storageRefPath, // Store the full storage path for easier deletion if structure changes
      createdAt: serverTimestamp(),
    };

    await setDoc(productDocRef, newProductDataWithImage); 
    console.warn("Firebase ProductService: Product data saved to Firestore with ID:", productId, "Data:", JSON.stringify(newProductDataWithImage, null, 2));

    // Construct the product object as it would be returned/used in the app
    const createdProduct: Product = {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: imageUrl, 
        imageName: imageFile.name, 
        createdAt: Date.now(), // Approximate, Firestore timestamp is more accurate
    };
    console.warn("Firebase ProductService: addProductToFirebase RETURNING product object:", createdProduct);
    return createdProduct;

  } catch (error) {
    console.error("Firebase ProductService: Error adding product to Firebase: ", error);
    return null; 
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  if (!db) {
      console.error("Firebase ProductService: Firestore 'db' is not properly initialized in getProductsFromFirebase. Returning empty product list.");
      return [];
  }
  console.warn("useProducts: getProductsFromFirebase - Attempting to fetch products.");
  try {
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(productsQuery);
    const products = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      const createdAtTimestamp = data.createdAt as Timestamp; // Explicitly type data.createdAt
      const productItem: Product = {
        id: docSnapshot.id,
        description: data.description || "Descrição Indisponível",
        imageUrl: data.imageUrl || "", 
        imageName: data.imageName || "", // Ensure imageName is fetched
        price: typeof data.price === 'number' ? data.price : 0, // Ensure price is a number
        category: data.category || "Sem Categoria", // Ensure category exists
        createdAt: createdAtTimestamp?.toDate?.().getTime() || data.createdAt || Date.now(), // Handle potential undefined or already number
      };
      if (!productItem.imageUrl) {
        console.warn(`useProducts: getProductsFromFirebase - Product ID ${productItem.id} has EMPTY imageUrl in Firestore.`);
      } else if (typeof productItem.imageUrl !== 'string' || !productItem.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        console.warn(`useProducts: getProductsFromFirebase - Product ID ${productItem.id} has INVALID imageUrl in Firestore:`, productItem.imageUrl);
      }
      return productItem;
    });
    console.warn("useProducts: getProductsFromFirebase - All products fetched. Count:", products.length);
    return products;
  } catch (error) {
    console.error("Firebase ProductService: Error getting products from Firebase: ", error);
    return [];
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl?: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot delete product.");
      return false;
  }
  console.warn("Firebase ProductService: Attempting to delete product:", productId, "with imageUrl hint:", imageUrl);

  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productDocSnap = await getDoc(productDocRef);
    
    if (!productDocSnap.exists()) {
      console.warn("Firebase ProductService: Product document not found for deletion, ID:", productId);
      // Attempt to delete image from storage if direct URL is provided and it looks like a Firebase Storage URL
      if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        try {
            const imageRefToDelete = ref(storage, imageUrl); // Create ref from full URL
            await deleteObject(imageRefToDelete);
            console.warn("Firebase ProductService: Image deleted from Storage using direct imageUrl (doc didn't exist):", imageUrl);
        } catch (storageError: any) {
            // It's okay if object-not-found, means it might have been deleted already or path was wrong
            if (storageError.code !== 'storage/object-not-found') {
                console.warn(`Firebase ProductService: Failed to delete image from Storage at ${imageUrl} (doc didn't exist). Error: ${storageError.message}`);
            } else {
                console.log("Firebase ProductService: Image not found at direct imageUrl (doc didn't exist, this is okay):", imageUrl);
            }
        }
      }
      return true; // Document didn't exist, so considered 'successfully' deleted from Firestore perspective
    }

    const productData = productDocSnap.data();
    // Prefer storagePath if available, otherwise try to derive from imageUrl
    const storagePathToDelete = productData?.storagePath || (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com') ? ref(storage, imageUrl).fullPath : null);

    await deleteDoc(productDocRef);
    console.warn("Firebase ProductService: Product deleted from Firestore:", productId);

    if (storagePathToDelete) {
      try {
        const imageRef = ref(storage, storagePathToDelete); // Create ref from path
        await deleteObject(imageRef);
        console.warn("Firebase ProductService: Image deleted from Storage using path:", storagePathToDelete);
      } catch (storageError: any) {
        if (storageError.code !== 'storage/object-not-found') { // Don't error if already deleted
           console.warn(`Firebase ProductService: Failed to delete image from Storage at ${storagePathToDelete}. Error: ${storageError.message}`);
        } else {
           console.log("Firebase ProductService: Image not found at path for deletion (this might be okay if already deleted or path was wrong):", storagePathToDelete);
        }
      }
    } else {
        console.warn(`Firebase ProductService: No valid imageUrl or storagePath found for product ${productId} to delete from Storage.`);
    }
    return true;
  } catch (error) {
    console.error("Firebase ProductService: Error deleting product from Firebase: ", error);
    return false;
  }
};
