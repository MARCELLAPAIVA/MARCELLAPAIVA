
import { db, storage } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, setDoc, getDoc, type Timestamp } from 'firebase/firestore'; // Added Timestamp
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// Função para gerar um nome de arquivo seguro e padronizado para o Storage
const getImageNameForStorage = (originalFileName: string, productId: string) => {
  console.warn("Firebase ProductService: getImageNameForStorage - Original filename:", originalFileName);
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.') > 0 ? originalFileName.lastIndexOf('.') : originalFileName.length);
  
  const safeOriginalFileNameBase = baseName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Substitui caracteres não seguros por _ (permite ., -)
    .replace(/_{2,}/g, '_') // Substitui múltiplos underscores por um único
    .substring(0, 50); // Trunca para segurança/consistência

  const finalName = `product_${productId}_${safeOriginalFileNameBase}_${Date.now()}.${extension}`;
  console.warn("Firebase ProductService: getImageNameForStorage - Sanitized filename for storage:", finalName);
  return finalName;
};

export const addProductToFirebase = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'imageUrl' | 'imageName'>,
  imageFile: File
): Promise<Product | null> => {
  if (!db || !storage) {
      console.error("Firebase ProductService: Firestore 'db' or Storage 'storage' is not properly initialized. Cannot add product. Check Firebase configuration and ensure services are enabled.");
      return null;
  }
  console.warn("Firebase ProductService: addProductToFirebase CALLED with productData:", productData.description, "and original imageFile name:", imageFile.name);

  try {
    const productDocRef = doc(collection(db, PRODUCTS_COLLECTION)); // Gera ID antes para usar no nome do arquivo
    const productId = productDocRef.id;

    const storageFileName = getImageNameForStorage(imageFile.name, productId); // Usa o nome original do arquivo para sanitização
    const storageRefPath = `${PRODUCTS_COLLECTION}/${productId}/${storageFileName}`;
    const fileStorageRef = ref(storage, storageRefPath);
    
    console.warn("Firebase ProductService: Uploading to storage path:", storageRefPath);
    await uploadBytes(fileStorageRef, imageFile);
    const imageUrl = await getDownloadURL(fileStorageRef);
    console.warn("Firebase ProductService: Image uploaded. SANITIZED storageFileName:", storageFileName, "Download URL:", imageUrl);

    const newProductDataWithImage = {
      ...productData,
      imageUrl: imageUrl, // URL para o arquivo com nome SANITIZADO
      imageName: imageFile.name, // Nome original do arquivo enviado pelo usuário (para referência)
      storagePath: storageRefPath, // Caminho no storage para o arquivo com nome SANITIZADO
      createdAt: serverTimestamp(),
    };

    await setDoc(productDocRef, newProductDataWithImage); // Salva o novo produto com ID gerado
    console.warn("Firebase ProductService: Product data saved to Firestore with ID:", productId, "Data:", newProductDataWithImage);

    // Para retorno imediato, simulamos o timestamp. Firestore o terá corretamente.
    const createdProduct: Product = {
        id: productId,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: imageUrl, // URL para o arquivo sanitizado
        imageName: imageFile.name, // Nome original
        createdAt: Date.now(), // Simulação para retorno imediato
    };
    console.warn("Firebase ProductService: addProductToFirebase RETURNING product object:", createdProduct);
    return createdProduct;

  } catch (error) {
    console.error("Firebase ProductService: Error adding product to Firebase: ", error);
    // Considerar relançar o erro se o chamador precisar saber: throw error;
    return null; // Ou retornar null para indicar falha
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
      const createdAtTimestamp = data.createdAt as Timestamp; // Cast to Firebase Timestamp
      const productItem: Product = {
        id: docSnapshot.id,
        description: data.description || "Descrição Indisponível",
        imageUrl: data.imageUrl || "", // Fornecer um fallback
        imageName: data.imageName || "",
        price: typeof data.price === 'number' ? data.price : 0, // Fornecer um fallback
        category: data.category || "Sem Categoria",
        createdAt: createdAtTimestamp?.toDate?.().getTime() || data.createdAt || Date.now(),
      };
      // console.warn(`useProducts: getProductsFromFirebase - Fetched product ID: ${productItem.id}, Image URL: ${productItem.imageUrl}`);
      if (!productItem.imageUrl) {
        console.error(`useProducts: getProductsFromFirebase - Product ID ${productItem.id} has EMPTY imageUrl in Firestore.`);
      } else if (typeof productItem.imageUrl !== 'string' || !productItem.imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        console.error(`useProducts: getProductsFromFirebase - Product ID ${productItem.id} has INVALID imageUrl in Firestore:`, productItem.imageUrl);
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
      // Se o documento não existe, talvez a imagem também não.
      // Se houver uma imageUrl, tentamos excluir de qualquer maneira como fallback.
      if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        try {
            const imageRefToDelete = ref(storage, imageUrl); // Tenta derivar o caminho da URL completa
            await deleteObject(imageRefToDelete);
            console.warn("Firebase ProductService: Image deleted from Storage using direct imageUrl (doc didn't exist):", imageUrl);
        } catch (storageError: any) {
            if (storageError.code !== 'storage/object-not-found') {
                console.warn(`Firebase ProductService: Failed to delete image from Storage at ${imageUrl} (doc didn't exist). Error: ${storageError.message}`);
            } else {
                console.warn("Firebase ProductService: Image not found at direct imageUrl (doc didn't exist, this is okay):", imageUrl);
            }
        }
      }
      return true; // Considerar sucesso se o documento já não existia.
    }

    const productData = productDocSnap.data();
    // Priorizar storagePath se existir, senão tentar derivar da imageUrl.
    const storagePathToDelete = productData?.storagePath || (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com') ? ref(storage, imageUrl).fullPath : null);

    await deleteDoc(productDocRef);
    console.warn("Firebase ProductService: Product deleted from Firestore:", productId);

    if (storagePathToDelete) {
      try {
        const imageRef = ref(storage, storagePathToDelete); 
        await deleteObject(imageRef);
        console.warn("Firebase ProductService: Image deleted from Storage using path:", storagePathToDelete);
      } catch (storageError: any) {
        if (storageError.code !== 'storage/object-not-found') {
           console.warn(`Firebase ProductService: Failed to delete image from Storage at ${storagePathToDelete}. Error: ${storageError.message}`);
        } else {
           console.warn("Firebase ProductService: Image not found at path for deletion (this might be okay if already deleted or path was wrong):", storagePathToDelete);
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
