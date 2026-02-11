package com.fixme.ecosystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "import")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Import {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String provider;

    @Column(nullable = false)
    private LocalDateTime importDate;

    @Column(nullable = false)
    private BigDecimal freightCost; // Costo de envío

    @Column(nullable = false)
    private BigDecimal customsCost; // Costo de aduanas

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal extrasCost = BigDecimal.ZERO; // Otros gastos

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal totalFobSum = BigDecimal.ZERO; // Suma total FOB

    @Column
    private BigDecimal prorationFactor; // Factor de prorrateo calculado

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PROCESSED, CANCELLED

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
