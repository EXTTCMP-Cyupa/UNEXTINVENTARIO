package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.*;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.Product;
import com.fixme.ecosystem.entity.ProductVariant;
import com.fixme.ecosystem.service.ProductService;
import com.fixme.ecosystem.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;

    // ============== CATÁLOGOS ==============

    @GetMapping("/public")
    public ResponseEntity<List<ProductVariantDTO>> getPublicCatalog() {
        log.info("Acceso al catálogo público");
        return ResponseEntity.ok(productService.getPublicCatalog());
    }

    @GetMapping("/b2b")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductVariantDTO>> getB2BCatalog() {
        log.info("Acceso al catálogo B2B");
        return ResponseEntity.ok(productService.getB2BCatalog());
    }

    @GetMapping("/{sku}")
    public ResponseEntity<ProductVariantDTO> getVariantBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getVariantBySku(sku));
    }

    // ============== GESTIÓN DE PRODUCTOS ==============

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CreateProductDTO dto) {
        log.info("Creando producto: {} {}", dto.getBrand(), dto.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(dto));
    }

    @PostMapping("/variants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariant> createProductVariant(@Valid @RequestBody CreateProductVariantDTO dto) {
        log.info("Creando variante: {}", dto.getSku());
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProductVariant(dto));
    }

    // ============== GESTIÓN DE INVENTARIO ==============

    // Paso 1: COMPRADO - Registro de Compra

    @PostMapping("/inventory/ingreso/international")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> registerInternationalPurchase(
            @Valid @RequestBody InternationalInventoryIngresoDTO dto) {
        log.info("📦 Registrando compra INTERNACIONAL");
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.registerInternationalPurchase(dto));
    }

    @PostMapping("/inventory/ingreso/local")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> registerLocalPurchase(
            @Valid @RequestBody LocalInventoryIngresoDTO dto) {
        log.info("📦 Registrando compra LOCAL");
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.registerLocalPurchase(dto));
    }

    // Paso 2: PREPARACION_ENVIO - Preparar Envío

    @PostMapping("/inventory/prepare-shipment/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> prepareShipment(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody PrepareShipmentDTO dto) {
        log.info("📋 Preparando envío - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.prepareShipment(dto));
    }

    // Paso 3: EN_TRANSITO - Envío y Seguimiento

    @PostMapping("/inventory/send-transit/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> sendToTransit(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody SendToTransitDTO dto) {
        log.info("✈️ Enviando a tránsito - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.sendToTransit(dto));
    }

    @PostMapping("/inventory/update-logistics/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> updateLogistics(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody UpdateLogisticsStageDTO dto) {
        log.info("📍 Actualizando etapa logística - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.updateLogisticsStage(dto));
    }

    @PostMapping("/inventory/reserve/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> reserveProduct(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody ReserveProductDTO dto) {
        log.info("🔒 Reservando producto - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.reserveProduct(dto));
    }

    // Paso 4: STOCK_LOCAL - Recepción en Local

    @PostMapping("/inventory/confirm-local-receipt/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> confirmLocalReceipt(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody ConfirmLocalReceiptDTO dto) {
        log.info("📦 Confirmando recepción en local - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.confirmLocalReceipt(dto));
    }

    @PostMapping("/inventory/mark-available/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> markAvailable(@PathVariable Long inventoryItemId) {
        return ResponseEntity.ok(inventoryService.markAvailable(inventoryItemId));
    }

    // Paso 5: VENDIDO - Venta Final

    @PostMapping("/inventory/final-sale/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> finalSale(
            @PathVariable Long inventoryItemId,
            @Valid @RequestBody FinalSaleDTO dto) {
        log.info("💰 Registrando venta final - ID: {}", inventoryItemId);
        dto.setInventoryItemId(inventoryItemId);
        return ResponseEntity.ok(inventoryService.finalSale(dto));
    }

    // ============== BÚSQUEDAS Y LISTADOS ==============

    @GetMapping("/inventory/search/{serialNumber}")
    public ResponseEntity<InventoryItem> searchBySerialNumber(@PathVariable String serialNumber) {
        log.info("Buscando por Serial: {}", serialNumber);
        return inventoryService.findBySerialNumber(serialNumber)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/inventory/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getInventory(
            @RequestParam(required = false) String status) {
        log.info("Obteniendo inventario - Estado: {}", status != null ? status : "TODOS");
        return ResponseEntity.ok(inventoryService.findAll(status));
    }

    @GetMapping("/inventory/comprado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getPurchased() {
        return ResponseEntity.ok(inventoryService.findPurchased());
    }

    @GetMapping("/inventory/preparacion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getInPreparation() {
        return ResponseEntity.ok(inventoryService.findInPreparation());
    }

    @GetMapping("/inventory/transito")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getInTransit() {
        return ResponseEntity.ok(inventoryService.findInTransit());
    }

    @GetMapping("/inventory/stock-local")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getLocalStock() {
        return ResponseEntity.ok(inventoryService.findInLocalStock());
    }

    @GetMapping("/inventory/disponible")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getAvailable() {
        return ResponseEntity.ok(inventoryService.findAvailable());
    }

    @GetMapping("/inventory/vendido")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getSold() {
        return ResponseEntity.ok(inventoryService.findSold());
    }

    @DeleteMapping("/inventory/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long inventoryItemId) {
        log.info("Eliminando producto - ID: {}", inventoryItemId);
        inventoryService.deleteItem(inventoryItemId);
        return ResponseEntity.noContent().build();
    }
}
