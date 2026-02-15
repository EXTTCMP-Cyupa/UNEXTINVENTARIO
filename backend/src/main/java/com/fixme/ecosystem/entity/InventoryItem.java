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

    // ========== FICHA TÉCNICA ==========
    @Column(length = 200)
    private String productName;         // ej: "Laptop Dell Latitude 5420"

    @Column(length = 100)
    private String brand;               // ej: "Dell"

    @Column(length = 100)
    private String model;               // ej: "Latitude 5420"

    @Column(columnDefinition = "TEXT")
    private String specs;               // ej: "i5-11400H, 16GB RAM, 512GB SSD"

    // ========== IDENTIDAD ==========
    @Column(unique = true, length = 100)
    private String serialNumber;        // Puede ser NULL hasta que llegue al local

    @Column(nullable = false, unique = true, length = 100)
    private String internalCode;        // FIX-XXXXX (generado por el sistema)

    // ========== ESTADO PRINCIPAL (PIPELINE) ==========
    @Column(nullable = false)
    @Builder.Default
    private String status = "COMPRADO"; 
    // COMPRADO → PREPARACION_ENVIO → EN_TRANSITO → STOCK_LOCAL → VENDIDO

    @Column(nullable = false)
    @Builder.Default
    private String purchaseType = "LOCAL"; // LOCAL, INTERNATIONAL

    // ========== SUB-ESTADO LOGÍSTICO (Solo EN_TRANSITO) ==========
    @Column(length = 50)
    private String logisticsStage; 
    // ENVIADO_AL_PAIS, EN_ADUANA, EN_CAMINO_AL_LOCAL

    // ========== COSTOS ==========
    @Column(precision = 10, scale = 2)
    private BigDecimal costFob;         // Costo FOB (compras internacionales)

    @Column(precision = 10, scale = 2)
    private BigDecimal costLocal;       // Factura local (compras locales)

    @Column(precision = 10, scale = 2)
    private BigDecimal costShipping;    // Costo de envío internacional

    @Column(precision = 10, scale = 2)
    private BigDecimal costCustoms;     // Costo de aduana

    @Column(precision = 10, scale = 2)
    private BigDecimal extraCosts;      // Otros gastos

    @Column(precision = 10, scale = 2)
    private BigDecimal landedCost;      // Costo final total

    // ========== PRECIOS ==========
    @Column(precision = 10, scale = 2)
    private BigDecimal priceReferential; // Precio referencial en PREPARACION_ENVIO

    @Column(precision = 10, scale = 2)
    private BigDecimal priceProvider;   // Precio del proveedor

    @Column(precision = 10, scale = 2)
    private BigDecimal priceB2B;        // Precio mayorista oficial

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePVP;        // Precio público oficial

    // ========== PROVEEDOR Y ORIGEN ==========
    @Column(length = 150)
    private String supplier;            // eBay, Amazon, etc.

    @Column(length = 100)
    private String productOwner;        // Inversor/Dueño del producto (quién lo compró)

    // ========== RESERVA (disponible EN_TRANSITO y STOCK_LOCAL) ==========
    @Column
    @Builder.Default
    private Boolean isReserved = false; // ¿Producto reservado?

    @Column(length = 100)
    private String reservedCustomer;    // Nombre del cliente que reservó

    @Column
    private LocalDateTime reservedDate; // Fecha de reserva

    @Column(precision = 10, scale = 2)
    private BigDecimal reservationAmount; // Anticipo pagado en reserva

    @Column(precision = 10, scale = 2)
    private BigDecimal reservedPrice;   // Precio pactado en reserva

    // ========== VENTA FINAL ==========
    @Column(length = 100)
    private String soldToCustomer;      // Cliente final

    @Column
    private LocalDateTime soldDate;     // Fecha de venta

    @Column(precision = 10, scale = 2)
    private BigDecimal salePrice;       // Precio de venta final

    @Column(precision = 10, scale = 2)
    private BigDecimal profit;          // Utilidad = salePrice - landedCost

    // ========== TRAZABILIDAD ==========
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
