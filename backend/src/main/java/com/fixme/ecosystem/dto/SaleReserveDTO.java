package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleReserveDTO {
    private Long inventoryItemId;
    private Long customerId;
    private String customerName; // Venta en mostrador
    private BigDecimal overridePrice; // Precio manual opcional
}
