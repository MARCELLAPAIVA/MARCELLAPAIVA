export interface Product {
  id: string;
  description: string;
  imageBase64: string; // Store image as base64 string
  imageName?: string; // Optional: store original image name
  price: number; // Product price
  createdAt: number; // Timestamp for sorting
}
