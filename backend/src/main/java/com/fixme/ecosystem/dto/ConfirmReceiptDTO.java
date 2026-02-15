package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmReceiptDTO {
    private Long inventoryItemId;          // ID del producto
    private Double aduanaCost;             // Costo de aduana
    private Double fleteCourrierCost;      // Costo de flete (DHL/FedEx)
    private Double priceB2B;               // Precio mayorista
    private Double pricePVP;               // Precio público
    private String trackingNumber;         // Número de seguimiento
    private String notes;                  // Notas adicionales
}
