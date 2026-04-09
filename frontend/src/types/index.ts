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
  category?: string;
  brand?: string;
  model?: string;
  specs?: string;
  purchaseType?: string;
  purchasePlace?: string;
  imageUrls?: string[];
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

export interface AdminWarrantyRecord {
  id: number;
  warrantyCode?: string;
  qrToken?: string;
  warrantyType?: string;
  status?: string;
  saleType?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  inventoryItemId?: number;
  serialNumber?: string;
  internalCode?: string;
  productName?: string;
  brand?: string;
  model?: string;
  salePrice?: number;
  soldDate?: string;
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
export interface SalesReportDTO {
  saleId: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  internalCode: string;
  salePrice: number;
  paymentMethod: string;
  warrantyType: string;
  saleDate: string;
  status: string;
}

export interface SalesSummaryDTO {
  totalSales: number;
  totalRevenue: number;
  averageSalePrice: number;
  topPaymentMethod: string;
  topWarrantyType: string;
  warrantiesCreated: number;
}

export interface InventoryReportDTO {
  totalProducts: number;
  productsAvailable: number;
  productsInTransit: number;
  lowStockCount: number;
  averageDaysInStock: number;
  totalInventoryValue: number;
}

export interface PublicWarrantyDTO {
  productName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  internalCode?: string;
  customerName?: string;
  customerEmail?: string;
  warrantyCode?: string;
  warrantyType: string;
  status: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  saleType?: string;
  saleDate?: string;
  salePrice?: number;
  message?: string;
}