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
public class FinalSaleResponseDTO {
    private Long inventoryItemId;
    private Long saleId;
    private String customerName;
    private BigDecimal salePrice;
    private LocalDateTime saleDate;
    private String warrantyCode;
    private String warrantyType;
}
