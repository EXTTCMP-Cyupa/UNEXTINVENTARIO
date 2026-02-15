package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transición: EN_TRANSITO → STOCK_LOCAL
 * Confirma recepción física en el local
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmLocalReceiptDTO {
    private Long inventoryItemId;
    private String serialNumber;        // Serial del producto (ya en local)
    private Double priceB2B;            // Precio mayorista oficial
    private Double pricePVP;            // Precio público oficial
    private String productOwner;        // Inversor/Dueño del producto
    private String notes;               // Notas de recepción
}
