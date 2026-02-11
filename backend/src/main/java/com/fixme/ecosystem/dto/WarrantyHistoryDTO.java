package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarrantyHistoryDTO {
    private Long inventoryId;
    private String serialNumber;
    private String internalCode;
    private String productName;
    private String productSku;
    private String importProvider;
    private java.time.LocalDateTime importDate;
    private String customerName;
    private java.time.LocalDateTime saleDate;
    private BigDecimal unitPrice;
}
