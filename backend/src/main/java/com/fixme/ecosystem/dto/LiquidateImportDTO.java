package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para "Confirmar Envío Internacional"
 * Paso donde se ingresan costos de importación y precios de venta
 * Estado: COMPRADO → EN_TRANSITO (con ENVIADO como shippingStatus)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiquidateImportDTO {
    private Long inventoryItemId;       // El registro COMPRADO
    
    // Gastos de importación
    private BigDecimal aduanaCost;      // Costo de aduana
    private BigDecimal fleteCourrierCost; // Costo de flete courier/DHL/Fedex
    
    // Precios de venta referenciales
    private BigDecimal priceB2B;        // Precio B2B sugerido
    private BigDecimal pricePVP;        // Precio PVP sugerido
    
    // Notas del envío
    private String trackingNumber;      // Número de seguimiento
    private String notes;               // Notas adicionales del envío
}

