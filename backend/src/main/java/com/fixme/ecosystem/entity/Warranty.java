package com.fixme.ecosystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "warranty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warranty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con InventoryItem
    @OneToOne(optional = false)
    @JoinColumn(name = "inventory_item_id", nullable = false, unique = true)
    private InventoryItem inventoryItem;

    // Cliente (opcional si no está registrado)
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    // Información del cliente (si no está registrado)
    @Column(length = 150)
    private String customerName;

    @Column(length = 150)
    private String customerEmail;

    @Column(length = 15)
    private String customerPhone;

    // Link único de garantía
    @Column(length = 36, unique = true)
    @Builder.Default
    private String warrantyCode = UUID.randomUUID().toString();

    // Token QR (legacy)
    @Column(length = 60, unique = true)
    private String qrToken;

    // Tipo de garantía
    @Column(length = 50)
    @Builder.Default
    private String warrantyType = "SIN_GARANTIA"; // SIN_GARANTIA, 1_MES, 6_MESES, 12_MESES

    // Fechas de garantía
    @Column
    private LocalDateTime warrantyStartDate; // Fecha real de inicio (cuando llega el producto si fue venta anticipada)

    @Column
    private LocalDateTime warrantyEndDate; // Fecha de vencimiento calculada

    @Column(nullable = false)
    private LocalDateTime startDate; // Legacy - fecha de venta

    @Column
    private LocalDateTime endDate; // Legacy

    // Estado
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDIENTE"; // PENDIENTE (en tránsito), ACTIVA, VENCIDA, CANCELADA

    // Tipo de venta
    @Column(length = 50)
    @Builder.Default
    private String saleType = "NORMAL"; // NORMAL, ANTICIPADA

    // Observaciones
    @Column(columnDefinition = "TEXT")
    private String notes;

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

    // Método helper para calcular fecha de vencimiento
    public void calculateWarrantyEndDate() {
        if (warrantyStartDate == null || "SIN_GARANTIA".equals(warrantyType)) {
            this.warrantyEndDate = null;
            this.endDate = null; // legacy
            return;
        }

        switch (warrantyType) {
            case "1_MES":
                this.warrantyEndDate = warrantyStartDate.plusMonths(1);
                this.endDate = warrantyStartDate.plusMonths(1); // legacy
                break;
            case "6_MESES":
                this.warrantyEndDate = warrantyStartDate.plusMonths(6);
                this.endDate = warrantyStartDate.plusMonths(6); // legacy
                break;
            case "12_MESES":
                this.warrantyEndDate = warrantyStartDate.plusMonths(12);
                this.endDate = warrantyStartDate.plusMonths(12); // legacy
                break;
            default:
                this.warrantyEndDate = null;
                this.endDate = null;
        }
    }

    // Activar garantía (cuando el producto llega al local)
    public void activateWarranty() {
        if ("PENDIENTE".equals(this.status)) {
            this.warrantyStartDate = LocalDateTime.now();
            this.status = "ACTIVA";
            calculateWarrantyEndDate();
        }
    }
}

