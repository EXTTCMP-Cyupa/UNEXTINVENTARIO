package com.fixme.ecosystem.dto;

import java.math.BigDecimal;

public class SalesSummaryDTO {
    private Long totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal averageSalePrice;
    private String topPaymentMethod;
    private String topWarrantyType;
    private Long warrantiesCreated;

    public SalesSummaryDTO() {
    }

    public SalesSummaryDTO(Long totalSales, BigDecimal totalRevenue, BigDecimal averageSalePrice,
                          String topPaymentMethod, String topWarrantyType, Long warrantiesCreated) {
        this.totalSales = totalSales;
        this.totalRevenue = totalRevenue;
        this.averageSalePrice = averageSalePrice;
        this.topPaymentMethod = topPaymentMethod;
        this.topWarrantyType = topWarrantyType;
        this.warrantiesCreated = warrantiesCreated;
    }

    // Getters y Setters
    public Long getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Long totalSales) {
        this.totalSales = totalSales;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getAverageSalePrice() {
        return averageSalePrice;
    }

    public void setAverageSalePrice(BigDecimal averageSalePrice) {
        this.averageSalePrice = averageSalePrice;
    }

    public String getTopPaymentMethod() {
        return topPaymentMethod;
    }

    public void setTopPaymentMethod(String topPaymentMethod) {
        this.topPaymentMethod = topPaymentMethod;
    }

    public String getTopWarrantyType() {
        return topWarrantyType;
    }

    public void setTopWarrantyType(String topWarrantyType) {
        this.topWarrantyType = topWarrantyType;
    }

    public Long getWarrantiesCreated() {
        return warrantiesCreated;
    }

    public void setWarrantiesCreated(Long warrantiesCreated) {
        this.warrantiesCreated = warrantiesCreated;
    }
}
