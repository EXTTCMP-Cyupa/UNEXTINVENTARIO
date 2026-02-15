package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transición final: STOCK_LOCAL → VENDIDO
 * Registra venta final del producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalSaleDTO {
    private Long inventoryItemId;
    private String customerName;        // Cliente final (puede ser el que reservó o nuevo)
    private String customerEmail;       // Email del cliente
    private Double salePrice;           // Precio de venta final
    private String paymentMethod;       // CASH, TRANSFER, CREDIT
    private String notes;
}
