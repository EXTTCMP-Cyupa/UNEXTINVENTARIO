package com.fixme.ecosystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn(name = "import_id")
    private Import importRecord;

    // FICHA TÉCNICA (aquí se guarda para compras sin ProductVariant aún)
    @Column(length = 200)
    private String productName;         // ej: "Laptop Dell Latitude 5420"

    @Column(length = 100)
    private String brand;               // ej: "Dell"

    @Column(length = 100)
    private String model;               // ej: "Latitude 5420"

    @Column(columnDefinition = "TEXT")
    private String specs;               // ej: "i5-11400H, 16GB RAM, 512GB SSD"

    // IDENTIDAD DEL PRODUCTO
    @Column(unique = true, length = 100)
    private String serialNumber;        // Puede ser NULL para compras internacionales en tránsito

    @Column(nullable = false, unique = true, length = 100)
    private String internalCode;        // FIX-XXXXX (generado por el sistema)

    // ESTADO Y TIPO
    @Column(nullable = false)
    @Builder.Default
    private String status = "DISPONIBLE"; // EN_TRANSITO, DISPONIBLE, VENDIDO, DEFECTUOSO

    @Column(nullable = false)
    @Builder.Default
    private String purchaseType = "LOCAL"; // LOCAL, INTERNATIONAL

    // COSTOS
    @Column(precision = 10, scale = 2)
    private BigDecimal costFob;         // FOB (compras internacionales)

    @Column(precision = 10, scale = 2)
    private BigDecimal costLocal;       // Factura local (compras locales)

    @Column(precision = 10, scale = 2)
    private BigDecimal extraCosts;      // Aduana + Flete + otros gastos

    @Column(precision = 10, scale = 2)
    private BigDecimal landedCost;      // Costo final = FOB + extras OR costLocal + extras

    // PRECIOS
    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedPrice;  // Precio tentativo para web (compras internacionales)

    @Column(precision = 10, scale = 2)
    private BigDecimal priceB2B;        // Precio B2B final

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePVP;        // Precio PVP (público) final

    // PROVEEDOR
    @Column(length = 150)
    private String supplier;            // eBay, Amazon, Distribuidor XYZ, etc

    // VENTA
    @Column(length = 100)
    private String soldToCustomer;      // Cliente que compró

    @Column
    private LocalDateTime soldDate;     // Fecha de venta

    // RESERVA (venta en proceso)
    @Column(length = 100)
    private String reservedToCustomer;

    @Column
    private LocalDateTime reservedDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal reservedPrice;

    // TRAZABILIDAD
    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
