import apiClient from '@/lib/apiClient';
import { ProductVariant, WarrantyHistory, Product, CreateProductDTO, CreateProductVariantDTO } from '@/types';

// Exportar apiClient como 'api' para compatibilidad
export const api = apiClient;

export const productService = {
  getPublicCatalog: async (): Promise<ProductVariant[]> => {
    const response = await apiClient.get('/products/public');
    return response.data.value || response.data;
  },

  getB2BCatalog: async (): Promise<ProductVariant[]> => {
    const response = await apiClient.get('/products/b2b');
    return response.data.value || response.data;
  },

  getVariantBySku: async (sku: string): Promise<ProductVariant> => {
    const response = await apiClient.get(`/products/${sku}`);
    return response.data;
  },

  createProduct: async (data: CreateProductDTO): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  createVariant: async (data: CreateProductVariantDTO): Promise<ProductVariant> => {
    const response = await apiClient.post('/products/variants', data);
    return response.data;
  },
};

export const importService = {
  processImport: async (data: any) => {
    const response = await apiClient.post('/imports/process', data);
    return response.data;
  },
};

export const warrantyService = {
  getWarrantyHistory: async (serialNumber: string): Promise<WarrantyHistory> => {
    const response = await apiClient.get(`/warranty/${serialNumber}`);
    return response.data;
  },
};
