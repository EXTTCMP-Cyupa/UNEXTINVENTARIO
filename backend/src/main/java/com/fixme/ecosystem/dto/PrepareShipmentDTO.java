package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transición: COMPRADO → PREPARACION_ENVIO
 * Ingresa datos de preparación de envío
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrepareShipmentDTO {
    private Long inventoryItemId;
    private Double costShipping;        // Costo de envío internacional estimado
    private Double costCustoms;         // Costo de aduana estimado
    private Double priceReferential;    // Precio referencial de venta
    private Double priceProvider;       // Precio del proveedor
    private Double priceB2B;            // Precio mayorista - ingresado UNA VEZ aquí
    private Double pricePVP;            // Precio público - ingresado UNA VEZ aquí
    private String notes;               // Notas opcionales
}
