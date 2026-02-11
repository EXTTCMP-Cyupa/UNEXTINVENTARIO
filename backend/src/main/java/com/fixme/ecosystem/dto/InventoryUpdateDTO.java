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
public class InventoryUpdateDTO {
    private String productName;
    private String brand;
    private String model;
    private String specs;
    private String supplier;
    private String serialNumber;
    private BigDecimal estimatedPrice;
    private BigDecimal priceB2B;
    private BigDecimal pricePVP;
}
