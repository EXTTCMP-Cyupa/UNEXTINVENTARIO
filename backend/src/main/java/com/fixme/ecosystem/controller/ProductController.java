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
import java.util.Optional;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;

    /**
     * Catálogo público - Visible para todos
     * Muestra precios PVP
     */
    @GetMapping("/public")
    public ResponseEntity<List<ProductVariantDTO>> getPublicCatalog() {
        log.info("Acceso al catálogo público");
        List<ProductVariantDTO> catalog = productService.getPublicCatalog();
        return ResponseEntity.ok(catalog);
    }

    /**
     * Catálogo B2B - Solo para partners con JWT
     * Muestra precios especiales para negocios
     */
    @GetMapping("/b2b")
    @PreAuthorize("hasRole('PARTNER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProductVariantDTO>> getB2BCatalog() {
        log.info("Acceso al catálogo B2B");
        List<ProductVariantDTO> catalog = productService.getB2BCatalog();
        return ResponseEntity.ok(catalog);
    }

    /**
     * Obtener una variante específica por SKU
     */
    @GetMapping("/{sku}")
    public ResponseEntity<ProductVariantDTO> getVariantBySku(@PathVariable String sku) {
        log.info("Buscando variante con SKU: {}", sku);
        return ResponseEntity.ok(productService.getVariantBySku(sku));
    }

    /**
     * Crear un nuevo producto - SOLO ADMIN
     * POST /api/products
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CreateProductDTO dto) {
        log.info("Creando nuevo producto: {} {}", dto.getBrand(), dto.getName());
        Product product = productService.createProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * Crear una variante de producto - SOLO ADMIN
     * POST /api/products/variants
     */
    @PostMapping("/variants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariant> createProductVariant(@Valid @RequestBody CreateProductVariantDTO dto) {
        log.info("Creando variante - SKU: {}", dto.getSku());
        ProductVariant variant = productService.createProductVariant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(variant);
    }

    // ======================== INVENTORY ENDPOINTS ========================

    /**
     * Registrar ingreso de producto INTERNACIONAL
     * Estado inicial: EN_TRANSITO
     */
    @PostMapping("/inventory/ingreso/international")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> registerInternational(
            @Valid @RequestBody InternationalInventoryIngresoDTO dto) {
        log.info("Registrando compra internacional - Producto: {}", dto.getProductName());
        InventoryItem item = inventoryService.registerInternationalPurchase(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    /**
     * Registrar ingreso de producto LOCAL
     * Estado inicial: DISPONIBLE
     */
    @PostMapping("/inventory/ingreso/local")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> registerLocal(
            @Valid @RequestBody LocalInventoryIngresoDTO dto) {
        log.info("Registrando compra local - Serial: {}", dto.getSerialNumber());
        InventoryItem item = inventoryService.registerLocalPurchase(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    /**
     * Liquidar importación (pagar aduanas/flete)
     * Cambia estado de EN_TRANSITO a DISPONIBLE
     */
    @PostMapping("/inventory/liquidate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> liquidateImport(
            @Valid @RequestBody LiquidateImportDTO dto) {
        log.info("Liquidando importación - ID: {}", dto.getInventoryItemId());
        InventoryItem item = inventoryService.liquidateImport(dto);
        return ResponseEntity.ok(item);
    }

    /**
     * Listar todos los productos en tránsito esperando liquidación
     */
    @GetMapping("/inventory/transit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getInTransit() {
        log.info("Obteniendo productos en tránsito");
        List<InventoryItem> items = inventoryService.findInTransit();
        return ResponseEntity.ok(items);
    }

    /**
     * Buscar producto por Serial Number
     * Trazabilidad: Muestra origen, proveedor, costo final y cliente
     */
    @GetMapping("/inventory/search/{serialNumber}")
    public ResponseEntity<InventoryItem> searchBySerialNumber(@PathVariable String serialNumber) {
        log.info("Buscando producto - Serial: {}", serialNumber);
        Optional<InventoryItem> item = inventoryService.findBySerialNumber(serialNumber);
        return item.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Listar todos los productos disponibles
     */
    @GetMapping("/inventory/available")
    public ResponseEntity<List<InventoryItem>> getAvailable() {
        log.info("Obteniendo productos disponibles");
        List<InventoryItem> items = inventoryService.findAvailable();
        return ResponseEntity.ok(items);
    }

    /**
     * Listar inventario completo o filtrado por estado
     */
    @GetMapping("/inventory/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InventoryItem>> getInventoryList(
            @RequestParam(required = false) String status) {
        log.info("Obteniendo inventario - Estado: {}", status);
        List<InventoryItem> items = inventoryService.findAll(status);
        return ResponseEntity.ok(items);
    }

    /**
     * Editar datos de un producto en inventario
     */
    @PutMapping("/inventory/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> updateInventoryItem(
            @PathVariable Long inventoryItemId,
            @RequestBody InventoryUpdateDTO dto) {
        log.info("Actualizando inventario - ID: {}", inventoryItemId);
        InventoryItem item = inventoryService.updateInventoryItem(inventoryItemId, dto);
        return ResponseEntity.ok(item);
    }

    /**
     * Marcar un producto como vendido
     */
    @PutMapping("/inventory/sold/{inventoryItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> markAsSold(
            @PathVariable Long inventoryItemId,
            @RequestParam String customerName) {
        log.info("Marcando como vendido - ID: {} - Cliente: {}", inventoryItemId, customerName);
        InventoryItem item = inventoryService.markAsSold(inventoryItemId, customerName);
        return ResponseEntity.ok(item);
    }
}
