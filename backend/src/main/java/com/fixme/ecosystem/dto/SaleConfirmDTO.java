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
public class SaleConfirmDTO {
    private Long inventoryItemId;
    private Long customerId;
    private String customerName;
    private String paymentMethod; // CASH, TRANSFER, DATAFAST, DEUNA
    private String paymentDestination; // Caja o Banco
    private String receiptUrl; // URL comprobante
    private BigDecimal salePrice;
    private Integer warrantyMonths; // opcional
}
