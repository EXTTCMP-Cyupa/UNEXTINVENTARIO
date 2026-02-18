package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {
    
    // Datos del cliente
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerCedula; // Cédula del cliente
    private String customerCity; // Ciudad
    private String customerAddress; // Dirección completa
    
    // Información de entrega
    private String deliveryType; // CONTRAENTREGA (si es Quito), PREPAID (pago anticipado)
    private String paymentMethod; // EFECTIVO, TRANSFERENCIA, TARJETA
    
    // Items del carrito - cada uno contiene inventoryItemId y cantidad
    private List<CartItemDTO> items;
    
    // Notas adicionales
    private String notes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDTO {
        private Long inventoryItemId;
        private Integer quantity;
        private java.math.BigDecimal unitPrice;
    }
}
