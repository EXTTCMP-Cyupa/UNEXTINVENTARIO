package com.fixme.ecosystem.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SalesReportDTO {
    private Long saleId;
    private String customerName;
    private String customerEmail;
    private String productName;
    private String internalCode;
    private BigDecimal salePrice;
    private String paymentMethod;
    private String warrantyType;
    private LocalDateTime saleDate;
    private String status;

    public SalesReportDTO() {
    }

    public SalesReportDTO(Long saleId, String customerName, String customerEmail,
                        String productName, String internalCode, BigDecimal salePrice,
                        String paymentMethod, String warrantyType, LocalDateTime saleDate, String status) {
        this.saleId = saleId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.productName = productName;
        this.internalCode = internalCode;
        this.salePrice = salePrice;
        this.paymentMethod = paymentMethod;
        this.warrantyType = warrantyType;
        this.saleDate = saleDate;
        this.status = status;
    }

    // Getters y Setters
    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getInternalCode() {
        return internalCode;
    }

    public void setInternalCode(String internalCode) {
        this.internalCode = internalCode;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getWarrantyType() {
        return warrantyType;
    }

    public void setWarrantyType(String warrantyType) {
        this.warrantyType = warrantyType;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
