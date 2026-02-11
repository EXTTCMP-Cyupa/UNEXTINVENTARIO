package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.ImportItemDTO;
import com.fixme.ecosystem.dto.ImportRequestDTO;
import com.fixme.ecosystem.entity.*;
import com.fixme.ecosystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportService {

    private final ImportRepository importRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ProductRepository productRepository;

    /**
     * Procesa una importación calculando el factor de prorrateo
     * y aplicándolo a cada variante para obtener el costo real (landedCost)
     *
     * Fórmula: landedCost = unitFobCost * (1 + FactorProrrateo)
     * donde FactorProrrateo = (freightCost + customsCost + extrasCost) / totalFobSum
     */
    @Transactional
    public Import processImport(ImportRequestDTO request) {
        log.info("Iniciando procesamiento de importación desde: {}", request.getProvider());

        // 1. Validaciones iniciales
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("La importación debe contener al menos un ítem");
        }

        // 2. Crear registro de importación
        Import importRecord = Import.builder()
                .provider(request.getProvider())
                .importDate(LocalDateTime.now())
                .freightCost(request.getFreightCost())
                .customsCost(request.getCustomsCost())
                .extrasCost(request.getExtrasCost() != null ? request.getExtrasCost() : BigDecimal.ZERO)
                .status("PENDING")
                .build();

        // 3. Calcular suma total FOB y validar que todos los SKU existan
        BigDecimal totalFobSum = BigDecimal.ZERO;
        for (ImportItemDTO item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findBySku(item.getSku())
                    .orElseThrow(() -> new RuntimeException("SKU no encontrado: " + item.getSku()));

            BigDecimal itemTotal = item.getCostPrice().multiply(new BigDecimal(item.getQuantity()));
            totalFobSum = totalFobSum.add(itemTotal);
        }

        importRecord.setTotalFobSum(totalFobSum);
        log.info("Total FOB calculado: {}", totalFobSum);

        // 4. Calcular Factor de Prorrateo
        BigDecimal totalAdditionalCosts = importRecord.getFreightCost()
                .add(importRecord.getCustomsCost())
                .add(importRecord.getExtrasCost());

        BigDecimal prorationFactor;
        if (totalFobSum.compareTo(BigDecimal.ZERO) > 0) {
            prorationFactor = totalAdditionalCosts.divide(totalFobSum, 10, RoundingMode.HALF_UP);
        } else {
            prorationFactor = BigDecimal.ZERO;
        }

        importRecord.setProrationFactor(prorationFactor);
        log.info("Factor de prorrateo calculado: {}", prorationFactor);

        // 5. Guardar registro de importación
        importRecord = importRepository.save(importRecord);

        // 6. Procesar cada ítem: actualizar landedCost y crear InventoryItems
        for (ImportItemDTO item : request.getItems()) {
            ProcessImportItem processImportItem = new ProcessImportItem(
                    item,
                    importRecord,
                    prorationFactor,
                    productVariantRepository,
                    inventoryItemRepository
            );
            processImportItem.execute();
        }

        // 7. Marcar importación como PROCESSED
        importRecord.setStatus("PROCESSED");
        importRecord = importRepository.save(importRecord);

        log.info("Importación {} procesada exitosamente", importRecord.getId());
        return importRecord;
    }

    /**
     * Clase interna para procesar cada ítem de importación
     */
    @RequiredArgsConstructor
    private static class ProcessImportItem {
        private final ImportItemDTO item;
        private final Import importRecord;
        private final BigDecimal prorationFactor;
        private final ProductVariantRepository productVariantRepository;
        private final InventoryItemRepository inventoryItemRepository;

        public void execute() {
            ProductVariant variant = productVariantRepository.findBySku(item.getSku())
                    .orElseThrow(() -> new RuntimeException("SKU no encontrado: " + item.getSku()));

            // Calcular landedCost: unitFobCost * (1 + FactorProrrateo)
            BigDecimal landedCostPerUnit = item.getCostPrice()
                    .multiply(BigDecimal.ONE.add(prorationFactor))
                    .setScale(2, RoundingMode.HALF_UP);

            variant.setLandedCost(landedCostPerUnit);
            variant.setStock(variant.getStock() + item.getQuantity());
            productVariantRepository.save(variant);

            log.debug("Variante {} - Costo unitario FOB: {}, Costo real: {}",
                    item.getSku(), item.getCostPrice(), landedCostPerUnit);

            // Crear InventoryItems para cada Serie
            if (item.getSerialNumbers() != null) {
                for (var sn : item.getSerialNumbers()) {
                    InventoryItem inventoryItem = InventoryItem.builder()
                            .productVariant(variant)
                            .importRecord(importRecord)
                            .serialNumber(sn.getSerialNumber())
                            .internalCode(sn.getInternalCode())
                            .status("DISPONIBLE")
                            .build();
                    inventoryItemRepository.save(inventoryItem);
                }
            }
        }
    }

    /**
     * Obtiene el historial de garantía de un producto por número de serie
     */
    public Optional<WarrantyInfo> getWarrantyInfo(String serialNumber) {
        return inventoryItemRepository.findBySerialNumber(serialNumber)
                .map(inventoryItem -> {
                    ProductVariant variant = inventoryItem.getProductVariant();
                    Product product = variant.getProduct();
                    Import importRecord = inventoryItem.getImportRecord();

                    return WarrantyInfo.builder()
                            .serialNumber(inventoryItem.getSerialNumber())
                            .internalCode(inventoryItem.getInternalCode())
                            .productName(product.getName())
                            .productSku(variant.getSku())
                            .importProvider(importRecord.getProvider())
                            .importDate(importRecord.getImportDate())
                            .saleDate(inventoryItem.getSoldDate())
                            .customerName(inventoryItem.getSoldToCustomer())
                            .unitPrice(variant.getLandedCost())
                            .status(inventoryItem.getStatus())
                            .build();
                });
    }

    /**
     * DTO interno para información de garantía
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class WarrantyInfo {
        private String serialNumber;
        private String internalCode;
        private String productName;
        private String productSku;
        private String importProvider;
        private LocalDateTime importDate;
        private LocalDateTime saleDate;
        private String customerName;
        private BigDecimal unitPrice;
        private String status;
    }
}
