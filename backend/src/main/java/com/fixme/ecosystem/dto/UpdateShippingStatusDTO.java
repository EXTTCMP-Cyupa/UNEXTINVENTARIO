package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el sub-estado de un producto en tránsito
 * Estados: ENVIADO, EN_ADUANA, EN_CAMINO, LISTO_LOCAL, RECIBIDO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShippingStatusDTO {
    private Long inventoryItemId;
    private String shippingStatus;  // ENVIADO, EN_ADUANA, EN_CAMINO, LISTO_LOCAL, RECIBIDO
    private String notes;            // Notas opcionales sobre el cambio
}
