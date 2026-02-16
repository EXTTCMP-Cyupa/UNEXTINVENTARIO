package com.fixme.ecosystem.dto;

public class InventoryReportDTO {
    private Long totalProducts;
    private Long productsAvailable;
    private Long productsInTransit;
    private Long lowStockCount;
    private Double averageDaysInStock;
    private Double totalInventoryValue;

    public InventoryReportDTO() {
    }

    public InventoryReportDTO(Long totalProducts, Long productsAvailable, Long productsInTransit,
                            Long lowStockCount, Double averageDaysInStock, Double totalInventoryValue) {
        this.totalProducts = totalProducts;
        this.productsAvailable = productsAvailable;
        this.productsInTransit = productsInTransit;
        this.lowStockCount = lowStockCount;
        this.averageDaysInStock = averageDaysInStock;
        this.totalInventoryValue = totalInventoryValue;
    }

    // Getters y Setters
    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getProductsAvailable() {
        return productsAvailable;
    }

    public void setProductsAvailable(Long productsAvailable) {
        this.productsAvailable = productsAvailable;
    }

    public Long getProductsInTransit() {
        return productsInTransit;
    }

    public void setProductsInTransit(Long productsInTransit) {
        this.productsInTransit = productsInTransit;
    }

    public Long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(Long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public Double getAverageDaysInStock() {
        return averageDaysInStock;
    }

    public void setAverageDaysInStock(Double averageDaysInStock) {
        this.averageDaysInStock = averageDaysInStock;
    }

    public Double getTotalInventoryValue() {
        return totalInventoryValue;
    }

    public void setTotalInventoryValue(Double totalInventoryValue) {
        this.totalInventoryValue = totalInventoryValue;
    }
}
