package com.fixme.ecosystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Número único de referencia de la orden
    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;
    
    // Datos del cliente
    @Column(nullable = false, length = 150)
    private String customerName;
    
    @Column(length = 20)
    private String customerCedula;
    
    @Column(length = 100)
    private String customerCity;
    
    @Column(length = 15)
    private String customerPhone;
    
    @Column(columnDefinition = "TEXT")
    private String customerAddress;
    
    // Información de entrega
    @Column(length = 50)
    private String deliveryType; // CONTRAENTREGA, PREPAID
    
    // Información de pago
    @Column(nullable = false, length = 50)
    private String paymentMethod; // EFECTIVO, TRANSFERENCIA, TARJETA
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isPaid = false;
    
    @Column(columnDefinition = "TEXT")
    private String paymentNotes;
    
    // Totales
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    // Estado de la orden
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PRE_VENDIDA"; // PRE_VENDIDA, VENDIDA, CANCELADA, PENDIENTE_PAGO
    
    // Relación con Sales
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sale> sales;
    
    // Notas
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Auditoría
    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime paidAt; // Fecha de pago
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
