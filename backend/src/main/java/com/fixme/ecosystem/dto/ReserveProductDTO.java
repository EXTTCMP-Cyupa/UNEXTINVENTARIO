package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para reservar producto mientras está EN_TRANSITO
 * El cliente paga anticipo y obtiene mejor precio
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReserveProductDTO {
    private Long inventoryItemId;
    private String customerName;        // Nombre del cliente que reserva
    private String customerEmail;       // Email del cliente
    private Double reservedPrice;       // Precio pactado (generalmente menor que PVP)
    private Double reservationAmount;   // Anticipo o monto pagado
    private String notes;
}
