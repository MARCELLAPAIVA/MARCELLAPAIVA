
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Função modificada para gerar um nome de arquivo seguro e padronizado para o Storage
const getImageNameForStorage = (originalFileName: string, productId: string) => {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  // Cria um nome de arquivo mais simples e seguro, usando o ID do produto e um timestamp
  const safeOriginalFileName = originalFileName.replace(/[^a-zA-Z0-9_.]/g, '_').substring(0, 50); // Limpa e trunca o nome original
  return `product_${productId}_${safeOriginalFileName}_${Date.now()}.${extension}`;
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
      imageName: imageFile.name, // Salva o nome original do arquivo para referência
      storagePath: storageRefPath, // Opcional: Salvar o caminho do storage para referência/deleção
      createdAt: serverTimestamp(),
    };

    await setDoc(productDocRef, newProductDataWithImage);
    console.log("Firebase ProductService: Product data saved to Firestore with ID:", productId);

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
    throw error; // Re-throw para que o ProductForm possa tratar
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
  console.log("Firebase ProductService: Attempting to delete product:", productId, "with imageUrl:", imageUrl);

  try {
    // Primeiro deletar do Firestore
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    console.log("Firebase ProductService: Product deleted from Firestore:", productId);

    // Depois deletar do Storage
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl); // Tenta usar a URL de download diretamente
        await deleteObject(imageRef);
        console.log("Firebase ProductService: Image deleted from Storage using direct URL:", imageUrl);
      } catch (storageError: any) {
        // Se falhar (ex: imageUrl não é um caminho de storage ou permissões diferentes),
        // pode ser necessário buscar o storagePath do Firestore se você o salvou.
        // Por agora, logamos o aviso.
        console.warn(`Firebase ProductService: Failed to delete image from Storage at ${imageUrl}. It might have already been deleted, path is incorrect, or it's not a storage reference. Error: ${storageError.message}`);
        if (storageError.code !== 'storage/object-not-found') {
           // Lidar com outros erros de storage se necessário, ex: tentar deletar usando um storagePath se salvo.
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Firebase ProductService: Error deleting product from Firebase: ", error);
    return false;
  }
};

