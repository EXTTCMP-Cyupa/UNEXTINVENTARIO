package com.fixme.ecosystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con InventoryItem
    @ManyToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    // Relación con Order (opcional, para órdenes de compra)
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Cliente
    @Column(nullable = false, length = 150)
    private String customerName;

    @Column(length = 150)
    private String customerEmail;

    @Column(length = 15)
    private String customerPhone;

    @Column(columnDefinition = "TEXT")
    private String customerAddress;

    // Información de venta
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime saleDate = LocalDateTime.now();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String paymentMethod = "EFECTIVO"; // EFECTIVO, TRANSFERENCIA, TARJETA, CREDITO

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Tipo de venta
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String saleType = "NORMAL"; // NORMAL, ANTICIPADA (venta en tránsito)

    @Column(nullable = false, length = 50)
    private String statusAtSale; // EN_TRANSITO, DISPONIBLE

    // Fecha en que el producto fue entregado físicamente (si fue venta anticipada)
    @Column
    private LocalDateTime deliveryDate;

    // Ganancia
    @Column(precision = 10, scale = 2)
    private BigDecimal profit; // salePrice - landedCost

    // Auditoría
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
