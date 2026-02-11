package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para "Recibir Mercadería" - Liquidación de compra internacional
 * En este punto el paquete ya llegó y tienes los costos finales
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiquidateImportDTO {
    private Long inventoryItemId;       // El registro EN_TRANSITO
    
    // Gastos de importación
    private BigDecimal aduanaCost;      // Costo de aduana
    private BigDecimal fleteCourrierCost; // Costo de flete courier/DHL/Fedex
    
    // Identidad del producto (ahora lo tienes en mano)
    private String serialNumber;        // Scanner: SN del producto físico recibido
    
    // Precios finales (pueden cambiar después de ver el producto real)
    private BigDecimal priceB2B;        // Precio B2B ajustado
    private BigDecimal pricePVP;        // Precio PVP ajustado
}

