package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.RegisterSaleDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.Sale;
import com.fixme.ecosystem.entity.Warranty;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import com.fixme.ecosystem.repository.SaleRepository;
import com.fixme.ecosystem.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SaleService {

    private final InventoryItemRepository inventoryItemRepository;
    private final SaleRepository saleRepository;
    private final WarrantyRepository warrantyRepository;
    private final TransitionValidator transitionValidator;

    /**
     * Registra una venta de producto (anticipada o normal)
     * 
     * REGLAS:
     * - Si producto está en EN_TRANSITO: Venta anticipada, producto sigue EN_TRANSITO hasta llegar
     * - Si producto está en DISPONIBLE: Venta normal, producto pasa a VENDIDO
     * - Crear registro de venta
     * - Crear registro de garantía (PENDIENTE si anticipada, ACTIVA si normal)
     */
    @Transactional
    public Sale registerSale(RegisterSaleDTO dto) {
        log.info("💰 Registrando venta - Item ID: {} - Cliente: {}", dto.getInventoryItemId(), dto.getCustomerName());

        // 1. Validar que el producto existe
        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // 2. Validar estado del producto
        String currentStatus = item.getStatus();
        if (!"EN_TRANSITO".equals(currentStatus) && !"DISPONIBLE".equals(currentStatus)) {
            throw new IllegalStateException(
                String.format("Solo se puede vender en EN_TRANSITO (venta anticipada) o DISPONIBLE. Estado actual: %s", currentStatus)
            );
        }

        // 3. Validar que no esté ya vendido
        if ("VENDIDO".equals(currentStatus)) {
            throw new IllegalStateException("Este producto ya fue vendido");
        }

        // 4. Validar que no tenga ya una venta registrada
        saleRepository.findByInventoryItemId(item.getId()).ifPresent(existingSale -> {
            throw new IllegalStateException("Este producto ya tiene una venta registrada");
        });

        // 5. Validar precio de venta
        if (dto.getSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio de venta debe ser mayor a cero");
        }

        // 6. Determinar tipo de venta
        String saleType = "EN_TRANSITO".equals(currentStatus) ? "ANTICIPADA" : "NORMAL";
        log.info("📋 Tipo de venta: {} - Estado actual: {}", saleType, currentStatus);

        // 7. Calcular ganancia
        BigDecimal landedCost = (item.getCostFob() != null ? item.getCostFob() : BigDecimal.ZERO)
                .add(item.getCostShipping() != null ? item.getCostShipping() : BigDecimal.ZERO)
                .add(item.getCostCustoms() != null ? item.getCostCustoms() : BigDecimal.ZERO);
        BigDecimal profit = dto.getSalePrice().subtract(landedCost);

        // 8. Crear registro de venta
        Sale sale = Sale.builder()
                .inventoryItem(item)
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .customerAddress(dto.getCustomerAddress())
                .saleDate(LocalDateTime.now())
                .salePrice(dto.getSalePrice())
                .paymentMethod(dto.getPaymentMethod())
                .notes(dto.getNotes())
                .saleType(saleType)
                .statusAtSale(currentStatus)
                .profit(profit)
                .build();

        sale = saleRepository.save(sale);
        log.info("✅ Venta registrada - ID: {} - Tipo: {} - Precio: ${}", sale.getId(), saleType, dto.getSalePrice());

        // 9. Crear registro de garantía
        try {
            // Verificar si ya existe una garantía para este producto
            java.util.Optional<Warranty> existingWarranty = warrantyRepository.findByInventoryItemId(item.getId());
            if (existingWarranty.isPresent()) {
                log.warn("⚠️ Garantía ya existe para este producto - ID: {}", item.getId());
                return sale; // Si ya existe, retornamos la venta sin crear duplicada
            }
            
            LocalDateTime now = LocalDateTime.now();
            
            // Determinar estado de la garantía
            String warrantyStatus = "ANTICIPADA".equals(saleType) ? "PENDIENTE" : "ACTIVA";
            
            Warranty warranty = Warranty.builder()
                    .inventoryItem(item)
                    .customerName(dto.getCustomerName())
                    .customerEmail(dto.getCustomerEmail())
                    .customerPhone(dto.getCustomerPhone())
                    .warrantyCode(UUID.randomUUID().toString())
                    .qrToken(UUID.randomUUID().toString())
                    .warrantyType(dto.getWarrantyType() != null ? dto.getWarrantyType() : "SIN_GARANTIA")
                    .warrantyStartDate(now)
                    .saleType(saleType)
                    .notes(dto.getWarrantyNotes())
                    .startDate(now)
                    .status(warrantyStatus)
                    .build();

            // Calcular fecha de vencimiento
            warranty.calculateWarrantyEndDate();

            warranty = warrantyRepository.save(warranty);
            log.info("✅ Garantía registrada - ID: {} - Código: {} - Tipo: {} - Vencimiento: {}", 
                warranty.getId(), warranty.getWarrantyCode(), warranty.getWarrantyType(), warranty.getWarrantyEndDate());
        } catch (Exception e) {
            log.error("❌ Error al crear garantía: {}", e.getMessage(), e);
            // No lanzamos excepción - la venta ya se guardó, solo falla la garantía
            log.warn("⚠️ Continuando sin garantía...");
        }

        // 10. Actualizar InventoryItem
        item.setSoldToCustomer(dto.getCustomerName());
        item.setSoldDate(LocalDateTime.now());
        item.setSalePrice(dto.getSalePrice());
        item.setProfit(profit);

        // 11. Si es venta normal (DISPONIBLE), cambiar estado a VENDIDO
        if ("NORMAL".equals(saleType)) {
            transitionValidator.validateTransition(currentStatus, "VENDIDO");
            item.setStatus("VENDIDO");
            log.info("✅ Producto → VENDIDO (venta normal)");
        } else {
            log.info("⏳ Producto sigue EN_TRANSITO (venta anticipada) - Pasará a VENDIDO al llegar");
        }

        inventoryItemRepository.save(item);

        log.info("💰 VENTA COMPLETADA - Item: {} - Cliente: {} - Tipo: {}", 
            item.getInternalCode(), dto.getCustomerName(), saleType);

        return sale;
    }

    /**
     * Obtiene todas las ventas
     */
    public java.util.List<Sale> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc();
    }

    /**
     * Obtiene ventas por tipo
     */
    public java.util.List<Sale> getSalesByType(String saleType) {
        return saleRepository.findBySaleType(saleType);
    }
}
