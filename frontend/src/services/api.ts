import apiClient from '@/lib/apiClient';
import { ProductVariant, WarrantyHistory, Product, CreateProductDTO, CreateProductVariantDTO, AdminWarrantyRecord, SalesReportDTO, SalesSummaryDTO, InventoryReportDTO } from '@/types';

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
  getAdminWarranties: async (): Promise<AdminWarrantyRecord[]> => {
    const response = await apiClient.get('/admin/warranty/list');
    return response.data || [];
  },
};
export const reportService = {
  getSalesSummary: async (): Promise<SalesSummaryDTO> => {
    const response = await apiClient.get('/admin/reports/sales/summary');
    return response.data;
  },

  getSalesReport: async (customerName?: string, paymentMethod?: string, warrantyType?: string): Promise<SalesReportDTO[]> => {
    const params = new URLSearchParams();
    if (customerName) params.append('customerName', customerName);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    if (warrantyType) params.append('warrantyType', warrantyType);
    
    const response = await apiClient.get(`/admin/reports/sales/list?${params.toString()}`);
    return response.data || [];
  },

  getInventorySummary: async (): Promise<InventoryReportDTO> => {
    const response = await apiClient.get('/admin/reports/inventory/summary');
    return response.data;
  },

  getSalesByDateRange: async (startDate?: string, endDate?: string): Promise<SalesReportDTO[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/admin/reports/sales/by-date?${params.toString()}`);
    return response.data || [];
  },

  getPaymentMethodsDistribution: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get('/admin/reports/sales/payment-methods');
    return response.data || {};
  },
};