package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportItemDTO {
    private String sku;
    private BigDecimal costPrice; // FOB
    private Integer quantity;
    private List<InventorySNDTO> serialNumbers; // S/N para cada unidad
}
