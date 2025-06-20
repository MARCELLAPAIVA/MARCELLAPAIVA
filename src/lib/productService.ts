
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc, getDoc } from 'firebase/firestore'; // Added getDoc here
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Função modificada para gerar um nome de arquivo seguro e padronizado para o Storage
const getImageNameForStorage = (originalFileName: string, productId: string) => {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  // Limpa caracteres problemáticos e trunca para segurança/consistência.
  // Mantém pontos e underscores, remove outros não alfanuméricos.
  const safeOriginalFileNameBase = originalFileName
    .substring(0, originalFileName.lastIndexOf('.')) // Remove extensão original
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Permite pontos e hífens no nome base
    .substring(0, 50);
  return `product_${productId}_${safeOriginalFileNameBase}_${Date.now()}.${extension}`;
};

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot add product. Check Firebase configuration and ensure services are enabled.");
      return null;
  }
  console.log("Firebase ProductService: addProductToFirebase called with productData:", productData, "and imageFile:", imageFile.name);

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id;

    const storageFileName = getImageNameForStorage(imageFile.name, productId);
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${storageFileName}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    console.log("Firebase ProductService: Uploading to storage path:", storageRefPath);
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);
    console.log("Firebase ProductService: Image uploaded. Download URL:", imageUrl);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl,
      imageName: imageFile.name, 
      storagePath: storageRefPath, 
      createdAt: serverTimestamp(),
    };

    await setDoc(productDocRef, newProductDataWithImage);
    console.log("Firebase ProductService: Product data saved to Firestore with ID:", productId, "Data:", newProductDataWithImage);

    return {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: imageUrl,
        imageName: imageFile.name,
        createdAt: Date.now(), 
    } as Product;

  } catch (error) {
    console.error("Firebase ProductService: Error adding product to Firebase: ", error);
    throw error; 
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
      // console.log("Firebase ProductService: Fetched product data from Firestore:", docSnapshot.id, data);
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
    // console.log("Firebase ProductService: All products fetched:", products);
    return products;
  } catch (error) {
    console.error("Firebase ProductService: Error getting products from Firebase: ", error);
    return [];
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl?: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot delete product. Check Firebase configuration.");
      return false;
  }
  console.log("Firebase ProductService: Attempting to delete product:", productId, "with imageUrl:", imageUrl);

  try {
    // Buscar o documento do produto para obter o storagePath, se não tivermos imageUrl confiável
    const productDocRef = doc(db, PRODUCTS_COLLECTION, productId); // Define productDocRef here
    const productDocSnap = await getDoc(productDocRef); // Use getDoc correctly
    const productData = productDocSnap.data();
    const storagePathToDelete = productData?.storagePath || (imageUrl ? ref(storage, imageUrl).fullPath : null);


    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    console.log("Firebase ProductService: Product deleted from Firestore:", productId);

    if (storagePathToDelete) {
      try {
        const imageRef = ref(storage, storagePathToDelete); 
        await deleteObject(imageRef);
        console.log("Firebase ProductService: Image deleted from Storage using path:", storagePathToDelete);
      } catch (storageError: any) {
        console.warn(`Firebase ProductService: Failed to delete image from Storage at ${storagePathToDelete}. Error: ${storageError.message}`);
        if (storageError.code !== 'storage/object-not-found') {
           // Lidar com outros erros de storage se necessário
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

