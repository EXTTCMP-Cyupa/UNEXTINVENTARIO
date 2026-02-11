export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  category: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  name: string;
  brand: string;
  model: string;
  category: string;
  description?: string;
}

export interface CreateProductVariantDTO {
  productId: number;
  sku: string;
  costPrice: number;
  priceB2B: number;
  pricePVP: number;
  attributes?: any;
}

export interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  costPrice: number;
  landedCost?: number;
  priceB2B: number;
  pricePVP: number;
  stock: number;
  attributes?: any;
  active: boolean;
}

export interface Import {
  id: number;
  provider: string;
  importDate: string;
  freightCost: number;
  customsCost: number;
  extrasCost: number;
  totalFobSum: number;
  prorationFactor?: number;
  status: string;
}

export interface ImportItem {
  sku: string;
  costPrice: number;
  quantity: number;
  serialNumbers: InventorySN[];
}

export interface InventorySN {
  serialNumber: string;
  internalCode: string;
}

export interface InventoryItem {
  id: number;
  serialNumber: string;
  internalCode: string;
  productName?: string;
  brand?: string;
  model?: string;
  specs?: string;
  purchaseType?: string;
  supplier?: string;
  estimatedPrice?: number;
  priceB2B?: number;
  pricePVP?: number;
  landedCost?: number;
  status: string;
  reservedToCustomer?: string;
  reservedDate?: string;
  reservedPrice?: number;
  soldToCustomer?: string;
  soldDate?: string;
}

export interface WarrantyHistory {
  serialNumber: string;
  internalCode: string;
  productName: string;
  brand?: string;
  model?: string;
  customerName?: string;
  saleDate?: string;
  warrantyEndDate?: string;
  warrantyStatus?: string;
  qrToken?: string;
  salePrice?: number;
  landedCost?: number;
  status: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}
