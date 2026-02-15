package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para realizar una venta o reserva de un producto
 * El producto puede estar en EN_TRANSITO o en varios estados
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleDTO {
    private Long inventoryItemId;
    private String customerName;        // Nombre del cliente
    private String customerEmail;       // Email del cliente
    private BigDecimal salePrice;       // Precio de venta final
    private String action;              // "SALE" (venta) o "RESERVE" (reserva)
}
