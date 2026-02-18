package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    
    private Long orderId;
    private String orderNumber; // Referencia única de la orden
    private LocalDateTime createdAt;
    
    // Datos del cliente
    private String customerName;
    private String customerCedula;
    private String customerCity;
    private String customerPhone;
    private String customerAddress;
    
    // Información de la orden
    private String orderStatus; // PRE_VENDIDA, VENDIDA, CANCELADA
    private String paymentMethod; // EFECTIVO, TRANSFERENCIA, TARJETA
    private String deliveryType; // CONTRAENTREGA, PREPAID
    
    // Totales
    private BigDecimal subtotal;
    private BigDecimal total;
    private Integer itemCount;
    
    // Items de la orden
    private List<OrderItemDTO> items;
    
    // Información de pago
    private Boolean isPaid;
    private String paymentNotes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private Long saleId;
        private String productName;
        private String brand;
        private String model;
        private BigDecimal price;
        private String warrantyCode;
    }
}
