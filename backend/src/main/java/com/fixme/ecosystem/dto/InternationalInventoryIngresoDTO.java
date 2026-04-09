package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para ingresar compra INTERNACIONAL (eBay, Amazon, China)
 * Paso 1: Solo ficha técnica + costo FOB + precio estimado
 * El Serial Number se añade después en la liquidación
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternationalInventoryIngresoDTO {
    // Ficha Técnica
    private String productName;          // ej: "Laptop Dell Latitude 5420"
    private String category;             // ej: "Laptops"
    private String brand;                // ej: "Dell"
    private String model;                // ej: "Latitude 5420"
    private String specs;                // ej: "i5-11400H, 16GB RAM, 512GB SSD"
    
    // Finanzas
    private BigDecimal costFob;          // Lo que pagaste en eBay/Amazon
    private BigDecimal estimatedPrice;   // Precio tentativo para la web
    
    // Proveedor
    private String purchasePlace;        // eBay, Amazon, Otros
    private String supplier;             // ej: "eBay Seller", "Amazon.com"
}

