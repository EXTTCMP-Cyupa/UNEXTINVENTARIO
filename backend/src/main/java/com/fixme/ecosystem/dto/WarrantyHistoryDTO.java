package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyHistoryDTO {
    private Long inventoryId;
    private String serialNumber;
    private String internalCode;
    private String productName;
    private String brand;
    private String model;
    private String customerName;
    private LocalDateTime saleDate;
    private LocalDateTime warrantyEndDate;
    private String warrantyStatus;
    private String qrToken;
    private BigDecimal salePrice;
    private BigDecimal landedCost;
    private String status;
}
