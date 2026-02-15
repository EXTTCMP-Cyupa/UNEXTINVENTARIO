package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar sub-estado logístico mientras EN_TRANSITO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLogisticsStageDTO {
    private Long inventoryItemId;
    private String logisticsStage;      // ENVIADO_AL_PAIS, EN_ADUANA, EN_CAMINO_AL_LOCAL
    private String notes;
}
