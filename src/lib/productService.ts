
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Função modificada para gerar um nome de arquivo seguro e padronizado para o Storage
const getImageNameForStorage = (originalFileName: string, productId: string) => {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  // Cria um nome de arquivo mais simples e seguro, usando o ID do produto e um timestamp
  return `product_image_${productId}_${Date.now()}.${extension}`;
};

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot add product. Check Firebase configuration and ensure services are enabled.");
      return null;
  }

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION));
    const productId = productDocRef.id;

    // Usa a função getImageNameForStorage para criar o nome do arquivo que será salvo no Storage
    const storageFileName = getImageNameForStorage(imageFile.name, productId);
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${storageFileName}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl,
      imageName: imageFile.name, // Salva o nome original do arquivo para referência
      // Opcional: você poderia salvar storageFileName aqui também se quisesse ter referência a ele no Firestore
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
    console.error("Firebase ProductService: Error getting products from Firebase: ", error);
    return [];
  }
};

export const deleteProductFromFirebase = async (productId: string, imageUrl: string): Promise<boolean> => {
   if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot delete product. Check Firebase configuration.");
      return false;
  }

  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (storageError: any) {
        console.warn(`Firebase ProductService: Failed to delete image from Storage at ${imageUrl}. It might have already been deleted or path is incorrect. Error: ${storageError.message}`);
        if (storageError.code !== 'storage/object-not-found') {
           // Handle other storage errors if necessary
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Firebase ProductService: Error deleting product from Firebase: ", error);
    return false;
  }
};
