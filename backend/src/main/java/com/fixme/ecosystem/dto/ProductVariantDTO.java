package com.fixme.ecosystem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private BigDecimal costPrice;
    private BigDecimal landedCost;
    private BigDecimal priceB2B;
    private BigDecimal pricePVP;
    private Integer stock;
    private JsonNode attributes;
    private Boolean active;
}
