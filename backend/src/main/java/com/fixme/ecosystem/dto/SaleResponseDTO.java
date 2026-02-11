package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleResponseDTO {
    private Long inventoryItemId;
    private String status;
    private String soldToCustomer;
    private LocalDateTime soldDate;
    private Long transactionId;
    private Long warrantyId;
    private LocalDateTime warrantyEndDate;
    private String qrToken;
}
