package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para mostrar información pública de garantía
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicWarrantyDTO {
    
    // Información del producto
    private String productName;
    private String brand;
    private String model;
    private String serialNumber;
    private String internalCode;
    
    // Información del cliente
    private String customerName;
    private String customerEmail;
    
    // Información de garantía
    private String warrantyCode;
    private String warrantyType; // SIN_GARANTIA, 1_MES, 6_MESES, 12_MESES
    private String status; // PENDIENTE, ACTIVA, VENCIDA
    private LocalDateTime warrantyStartDate;
    private LocalDateTime warrantyEndDate;
    
    // Información de venta
    private String saleType; // NORMAL, ANTICIPADA
    private LocalDateTime saleDate;
    private BigDecimal salePrice;
    
    // Mensajes
    private String message; // Mensaje dinámico para mostrar al usuario
}
