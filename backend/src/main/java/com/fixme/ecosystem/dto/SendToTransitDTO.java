package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transición: PREPARACION_ENVIO → EN_TRANSITO
 * Confirma que el producto salió hacia el país destino
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendToTransitDTO {
    private Long inventoryItemId;
    private String trackingNumber;      // Número de seguimiento
    private Double costShippingFinal;   // Costo final confirmado
    private Double costCustomsFinal;    // Costo de aduana confirmado
    private String notes;               // Notas del envío
}
