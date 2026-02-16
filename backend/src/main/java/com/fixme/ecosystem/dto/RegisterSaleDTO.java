package com.fixme.ecosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para registrar una venta (anticipada en EN_TRANSITO o normal en DISPONIBLE)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterSaleDTO {
    
    @NotNull(message = "El ID del item de inventario es requerido")
    private Long inventoryItemId;
    
    @NotBlank(message = "El nombre del cliente es requerido")
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
    
    private String customerAddress;
    
    @NotNull(message = "El precio de venta es requerido")
    @Positive(message = "El precio de venta debe ser mayor a cero")
    private BigDecimal salePrice;
    
    @NotBlank(message = "El método de pago es requerido")
    private String paymentMethod; // EFECTIVO, TRANSFERENCIA, TARJETA, CREDITO
    
    private String notes;
    
    @NotBlank(message = "El tipo de garantía es requerido")
    private String warrantyType; // SIN_GARANTIA, 1_MES, 6_MESES, 12_MESES
    
    private String warrantyNotes;
}
