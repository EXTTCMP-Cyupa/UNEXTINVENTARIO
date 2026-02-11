package com.fixme.ecosystem.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variant")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false)
    private BigDecimal costPrice; // FOB Cost

    @Column
    private BigDecimal landedCost; // Costo Real después de prorrateo

    @Column(nullable = false)
    private BigDecimal priceB2B; // Precio para Gremio/Socios

    @Column(nullable = false)
    private BigDecimal pricePVP; // Precio Público

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    // Atributos dinámicos en JSONB (RAM, CPU, etc.)
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode attributes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

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
