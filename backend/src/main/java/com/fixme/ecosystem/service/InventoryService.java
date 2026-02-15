package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.InternationalInventoryIngresoDTO;
import com.fixme.ecosystem.dto.LocalInventoryIngresoDTO;
import com.fixme.ecosystem.dto.LiquidateImportDTO;
import com.fixme.ecosystem.dto.InventoryUpdateDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.ProductVariant;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import com.fixme.ecosystem.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Paso 1: Crear un registro de compra INTERNACIONAL
     * Estado: COMPRADO
     * Sin Serial Number aún (llegará después)
     * Sin ProductVariant aún (se asignará después)
     * 
     * Resultado: Orden confirmada, esperando envío
     */
    @Transactional
    public InventoryItem registerInternationalPurchase(InternationalInventoryIngresoDTO dto) {
        log.info("Registrando compra internacional - {}", dto.getProductName());

        // Generar código interno
        String internalCode = generateInternalCode();

        InventoryItem item = InventoryItem.builder()
            .productName(dto.getProductName())       // Guardamos la ficha técnica directamente
            .brand(dto.getBrand())
            .model(dto.getModel())
            .specs(dto.getSpecs())
            .internalCode(internalCode)
            .purchaseType("INTERNATIONAL")
            .status("COMPRADO")                      // 🟡 COMPRADO (orden confirmada)
            .costFob(dto.getCostFob())
            .estimatedPrice(dto.getEstimatedPrice()) // Precio tentativo para la web
            .supplier(dto.getSupplier())
            // Serial Number: null por ahora
            // ProductVariant: null por ahora
            .build();

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Compra internacional creada - Código: {} - Estado: COMPRADO", internalCode);
        return saved;
    }

    /**
     * Paso 1: Crear un registro de compra LOCAL
     * Estado: DISPONIBLE (inmediatamente)
     * Con Serial Number (porque ya lo tienes)
     * Costo final = costInvoice + extraCosts
     * 
     * Resultado: El producto ya está disponible en el catálogo
     */
    @Transactional
    public InventoryItem registerLocalPurchase(LocalInventoryIngresoDTO dto) {
        log.info("Registrando compra local - {} - Serial: {}", dto.getProductName(), dto.getSerialNumber());

        // Generar código interno
        String internalCode = generateInternalCode();

        // Calcular costo final
        BigDecimal landedCost = dto.getCostInvoice()
            .add(dto.getExtraCosts() != null ? dto.getExtraCosts() : BigDecimal.ZERO);

        InventoryItem item = InventoryItem.builder()
            .productName(dto.getProductName())
            .brand(dto.getBrand())
            .model(dto.getModel())
            .specs(dto.getSpecs())
            .serialNumber(dto.getSerialNumber())     // 📌 Ya lo tienes
            .internalCode(internalCode)
            .purchaseType("LOCAL")
            .status("DISPONIBLE")                    // 🟢 DISPONIBLE inmediatamente
            .costLocal(dto.getCostInvoice())
            .extraCosts(dto.getExtraCosts())
            .landedCost(landedCost)
            .priceB2B(dto.getPriceB2B())             // Precios activados
            .pricePVP(dto.getPricePVP())
            .supplier(dto.getSupplier())
            .build();

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Compra local creada - Código: {} - Estado: DISPONIBLE - Costo Real: {}", 
                 internalCode, landedCost);
        return saved;
    }

    /**
     * Paso 2 (INTERNACIONAL): Marcar como "En Tránsito"
     * Estado: COMPRADO → EN_TRANSITO
     */
    @Transactional
    public InventoryItem moveToTransit(Long inventoryItemId) {
        log.info("Moviendo a EN_TRANSITO - ID: {}", inventoryItemId);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if (!"COMPRADO".equals(item.getStatus())) {
            throw new IllegalArgumentException("El producto debe estar en estado COMPRADO");
        }

        item.setStatus("EN_TRANSITO");                   // 🔵 EN TRÁNSITO
        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Producto movido a EN_TRANSITO - Código: {}", item.getInternalCode());
        return saved;
    }

    /**
     * Paso 3 (INTERNACIONAL): "Llegó al Local"
     * El paquete llegó físicamente, pagas aduana/flete, asignas Serial Number
     * Matemática: FOB + Aduana + Flete = Costo Real Final
     * Estado: EN_TRANSITO → STOCK_EN_LOCAL
     * 
     * Resultado: Producto físicamente en el local, esperando configuración de precios
     */
    @Transactional
    public InventoryItem liquidateImport(LiquidateImportDTO dto) {
        log.info("Liquidando importación - ID: {}", dto.getInventoryItemId());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if (!"INTERNATIONAL".equals(item.getPurchaseType())) {
            throw new IllegalArgumentException("Solo se pueden liquidar compras internacionales");
        }

        if (!"EN_TRANSITO".equals(item.getStatus())) {
            throw new IllegalArgumentException("El producto no está en estado EN_TRANSITO");
        }

        // Validar que el serial number no esté duplicado
        if (inventoryItemRepository.findBySerialNumber(dto.getSerialNumber()).isPresent()) {
            throw new IllegalArgumentException("Este Serial Number ya existe en el sistema");
        }

        // 💰 Matemática final: FOB + Aduana + Flete
        BigDecimal totalExtraCosts = dto.getAduanaCost()
            .add(dto.getFleteCourrierCost() != null ? dto.getFleteCourrierCost() : BigDecimal.ZERO);
        BigDecimal landedCost = item.getCostFob().add(totalExtraCosts);

        // Actualizar el registro
        item.setSerialNumber(dto.getSerialNumber());     // 📌 Ahora asignamos el S/N
        item.setExtraCosts(totalExtraCosts);
        item.setLandedCost(landedCost);
        item.setPriceB2B(dto.getPriceB2B());             // Precios sugeridos (se pueden ajustar)
        item.setPricePVP(dto.getPricePVP());
        item.setStatus("STOCK_EN_LOCAL");                // 🟠 En stock físico

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Importación liquidada - Código: {} - S/N: {} - Costo Real: {} - Estado: STOCK_EN_LOCAL", 
                 item.getInternalCode(), dto.getSerialNumber(), landedCost);
        return saved;
    }

    /**
     * Paso 4 (INTERNACIONAL): Activar para Venta
     * Confirmar/ajustar precios finales de venta
     * Estado: STOCK_EN_LOCAL → DISPONIBLE
     * 
     * Resultado: El producto se activa en la web con stock
     */
    @Transactional
    public InventoryItem setAvailableForSale(Long inventoryItemId, BigDecimal priceB2B, BigDecimal pricePVP) {
        log.info("Activando para venta - ID: {}", inventoryItemId);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if (!"STOCK_EN_LOCAL".equals(item.getStatus())) {
            throw new IllegalArgumentException("El producto debe estar en estado STOCK_EN_LOCAL");
        }

        if (priceB2B == null || pricePVP == null) {
            throw new IllegalArgumentException("Debe especificar precios B2B y PVP");
        }

        item.setPriceB2B(priceB2B);
        item.setPricePVP(pricePVP);
        item.setStatus("DISPONIBLE");                    // 🟢 Ahora está disponible para venta

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("Producto activado para venta - Código: {} - B2B: {} - PVP: {}", 
                 item.getInternalCode(), priceB2B, pricePVP);
        return saved;
    }

    /**
     * Busca un producto por Serial Number
     * Muestra: origen, proveedor, costo real final, cliente
     */
    public Optional<InventoryItem> findBySerialNumber(String serialNumber) {
        return inventoryItemRepository.findBySerialNumber(serialNumber);
    }

    /**
     * Lista todos los productos COMPRADOS (esperando envío)
     */
    public List<InventoryItem> findPurchased() {
        return inventoryItemRepository.findByStatus("COMPRADO");
    }

    /**
     * Lista todos los productos EN_TRANSITO (en camino)
     */
    public List<InventoryItem> findInTransit() {
        return inventoryItemRepository.findByStatus("EN_TRANSITO");
    }

    /**
     * Lista todos los productos en STOCK_EN_LOCAL (esperando configuración de precios)
     */
    public List<InventoryItem> findInLocalStock() {
        return inventoryItemRepository.findByStatus("STOCK_EN_LOCAL");
    }

    /**
     * Lista todos los productos DISPONIBLES
     */
    public List<InventoryItem> findAvailable() {
        return inventoryItemRepository.findByStatus("DISPONIBLE");
    }

    /**
     * Lista inventario completo o por estado
     */
    public List<InventoryItem> findAll(String status) {
        if (status == null || status.isBlank()) {
            return inventoryItemRepository.findAll();
        }
        return inventoryItemRepository.findByStatus(status);
    }

    /**
     * Edita datos del inventario (ficha tecnica/precios)
     */
    @Transactional
    public InventoryItem updateInventoryItem(Long inventoryItemId, InventoryUpdateDTO dto) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if ("VENDIDO".equals(item.getStatus())) {
            throw new IllegalArgumentException("No se puede editar un producto vendido");
        }

        if (dto.getSerialNumber() != null && !dto.getSerialNumber().equals(item.getSerialNumber())) {
            if (inventoryItemRepository.findBySerialNumber(dto.getSerialNumber()).isPresent()) {
                throw new IllegalArgumentException("Este Serial Number ya existe en el sistema");
            }
            item.setSerialNumber(dto.getSerialNumber());
        }

        if (dto.getProductName() != null) {
            item.setProductName(dto.getProductName());
        }
        if (dto.getBrand() != null) {
            item.setBrand(dto.getBrand());
        }
        if (dto.getModel() != null) {
            item.setModel(dto.getModel());
        }
        if (dto.getSpecs() != null) {
            item.setSpecs(dto.getSpecs());
        }
        if (dto.getSupplier() != null) {
            item.setSupplier(dto.getSupplier());
        }
        if (dto.getEstimatedPrice() != null) {
            item.setEstimatedPrice(dto.getEstimatedPrice());
        }
        if (dto.getPriceB2B() != null) {
            item.setPriceB2B(dto.getPriceB2B());
        }
        if (dto.getPricePVP() != null) {
            item.setPricePVP(dto.getPricePVP());
        }

        return inventoryItemRepository.save(item);
    }

    /**
     * Marca un producto como VENDIDO
     */
    @Transactional
    public InventoryItem markAsSold(Long inventoryItemId, String customerName) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        item.setStatus("VENDIDO");
        item.setSoldToCustomer(customerName);
        item.setSoldDate(LocalDateTime.now());

        return inventoryItemRepository.save(item);
    }

    /**
     * Genera un código interno único: FIX-XXXXX
     */
    private String generateInternalCode() {
        return "FIX-" + String.format("%05d", 
            (int)(System.currentTimeMillis() % 100000)) + 
            UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}
