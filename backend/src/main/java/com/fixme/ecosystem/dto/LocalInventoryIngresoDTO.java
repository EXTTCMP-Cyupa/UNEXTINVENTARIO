package com.fixme.ecosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para ingresar compra LOCAL (distribuidores nacionales)
 * El producto sale como DISPONIBLE inmediatamente
 * Incluye Serial Number porque ya tienes el producto en la mano
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocalInventoryIngresoDTO {
    // Ficha Técnica
    private String productName;         // ej: "Laptop Dell Latitude 5420"
    private String brand;               // ej: "Dell"
    private String model;               // ej: "Latitude 5420"
    private String specs;               // ej: "i5-11400H, 16GB RAM, 512GB SSD"
    
    // Identidad del producto (ya lo tienes)
    private String serialNumber;        // Scanner: SN del producto físico
    
    // Finanzas
    private BigDecimal costInvoice;     // Lo que pagaste en la factura local
    private BigDecimal extraCosts;      // Gasto extra: envío Servientrega, etc
    private BigDecimal priceB2B;        // Precio B2B activado
    private BigDecimal pricePVP;        // Precio público activado
    
    // Proveedor
    private String supplier;            // ej: "Distribuidor XYZ"
}

