package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.*;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final SaleRepository saleRepository;
    private final WarrantyRepository warrantyRepository;
    private final TransitionValidator transitionValidator;

    // =================== PASO 1: COMPRADO ===================

    @Transactional
    public InventoryItem registerInternationalPurchase(InternationalInventoryIngresoDTO dto) {
        log.info("📦 [COMPRADO] Registrando compra internacional - {}", dto.getProductName());

        String internalCode = generateInternalCode();

        InventoryItem item = InventoryItem.builder()
            .productName(dto.getProductName())
            .brand(dto.getBrand())
            .model(dto.getModel())
            .specs(dto.getSpecs())
            .internalCode(internalCode)
            .purchaseType("INTERNATIONAL")
            .status("COMPRADO")
            .costFob(dto.getCostFob())
            .supplier(dto.getSupplier())
            .isReserved(false)
            .build();

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("✅ Compra INTERNACIONAL creada - {} - Costo FOB: ${}", internalCode, dto.getCostFob());
        return saved;
    }

    @Transactional
    public InventoryItem registerLocalPurchase(LocalInventoryIngresoDTO dto) {
        log.info("📦 [STOCK_LOCAL] Registrando compra LOCAL - {} - Serial: {}", dto.getProductName(), dto.getSerialNumber());

        String internalCode = generateInternalCode();

        BigDecimal landedCost = dto.getCostInvoice()
            .add(dto.getExtraCosts() != null ? dto.getExtraCosts() : BigDecimal.ZERO);

        InventoryItem item = InventoryItem.builder()
            .productName(dto.getProductName())
            .brand(dto.getBrand())
            .model(dto.getModel())
            .specs(dto.getSpecs())
            .serialNumber(dto.getSerialNumber())
            .internalCode(internalCode)
            .purchaseType("LOCAL")
            .status("STOCK_LOCAL")
            .costLocal(dto.getCostInvoice())
            .extraCosts(dto.getExtraCosts())
            .landedCost(landedCost)
            .priceB2B(dto.getPriceB2B())
            .pricePVP(dto.getPricePVP())
            .supplier(dto.getSupplier())
            .isReserved(false)
            .build();

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("✅ Compra LOCAL creada - {} - Estado: STOCK_LOCAL - Listo para vender", internalCode);
        return saved;
    }

    // =================== PASO 2: PREPARACION_ENVIO ===================

    @Transactional
    public InventoryItem prepareShipment(PrepareShipmentDTO dto) {
        log.info("📋 [PREPARACION_ENVIO] Preparando envío - ID: {}", dto.getInventoryItemId());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        transitionValidator.validateTransition(item.getStatus(), "PREPARACION_ENVIO");

        item.setCostShipping(new BigDecimal(dto.getCostShipping() != null ? dto.getCostShipping() : 0));
        item.setCostCustoms(new BigDecimal(dto.getCostCustoms() != null ? dto.getCostCustoms() : 0));
        item.setPriceReferential(new BigDecimal(dto.getPriceReferential() != null ? dto.getPriceReferential() : 0));
        item.setPriceProvider(new BigDecimal(dto.getPriceProvider() != null ? dto.getPriceProvider() : 0));
        
        // Ingresar precios de venta UNA SOLA VEZ en PREPARACION
        if (dto.getPriceB2B() != null && dto.getPriceB2B() > 0) {
            item.setPriceB2B(new BigDecimal(dto.getPriceB2B()));
        }
        if (dto.getPricePVP() != null && dto.getPricePVP() > 0) {
            item.setPricePVP(new BigDecimal(dto.getPricePVP()));
        }

        BigDecimal extraCosts = item.getCostShipping().add(item.getCostCustoms());
        item.setExtraCosts(extraCosts);
        BigDecimal landedCost = item.getCostFob().add(extraCosts);
        item.setLandedCost(landedCost);

        item.setStatus("PREPARACION_ENVIO");
        InventoryItem saved = inventoryItemRepository.save(item);
        
        log.info("✅ [PREPARACION_ENVIO] - {} | FOB: ${} + Envío: ${} + Aduana: ${} = Total: ${} | B2B: ${} / PVP: ${}", 
            item.getInternalCode(), item.getCostFob(), item.getCostShipping(), item.getCostCustoms(), landedCost,
            item.getPriceB2B(), item.getPricePVP());
        return saved;
    }

    // =================== PASO 3: EN_TRANSITO ===================

    @Transactional
    public InventoryItem sendToTransit(SendToTransitDTO dto) {
        log.info("✈️ [EN_TRANSITO] Enviando a tránsito - ID: {}", dto.getInventoryItemId());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        transitionValidator.validateTransition(item.getStatus(), "EN_TRANSITO");

        if (dto.getCostShippingFinal() != null) {
            item.setCostShipping(new BigDecimal(dto.getCostShippingFinal()));
        }
        if (dto.getCostCustomsFinal() != null) {
            item.setCostCustoms(new BigDecimal(dto.getCostCustomsFinal()));
        }

        BigDecimal extraCosts = item.getCostShipping().add(item.getCostCustoms());
        item.setExtraCosts(extraCosts);
        BigDecimal landedCost = item.getCostFob().add(extraCosts);
        item.setLandedCost(landedCost);

        item.setStatus("EN_TRANSITO");
        item.setLogisticsStage("ENVIADO_AL_PAIS");

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("✅ [EN_TRANSITO] - {} | Tracking: {} | Costo Total: ${}", 
            item.getInternalCode(), dto.getTrackingNumber(), landedCost);
        return saved;
    }

    @Transactional
    public InventoryItem updateLogisticsStage(UpdateLogisticsStageDTO dto) {
        log.info("📍 [EN_TRANSITO] Actualizando etapa logística - ID: {}", dto.getInventoryItemId());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!"EN_TRANSITO".equals(item.getStatus())) {
            throw new IllegalArgumentException("Solo se puede actualizar etapa en EN_TRANSITO");
        }

        String validStages = "ENVIADO_AL_PAIS,EN_ADUANA,EN_CAMINO_AL_LOCAL";
        if (!validStages.contains(dto.getLogisticsStage())) {
            throw new IllegalArgumentException("Etapa logística inválida: " + dto.getLogisticsStage());
        }

        item.setLogisticsStage(dto.getLogisticsStage());
        
        // AUTO-TRANSICION: Cuando llega a EN_CAMINO_AL_LOCAL, pasar automáticamente a STOCK_LOCAL
        if ("EN_CAMINO_AL_LOCAL".equals(dto.getLogisticsStage())) {
            item.setStatus("STOCK_LOCAL");
            item.setLogisticsStage(null);  // Limpiar sub-estado al cambiar de estado
            log.info("✅ [AUTO-TRANSICION] EN_TRANSITO → STOCK_LOCAL - Producto {} ahora en local", item.getInternalCode());
        }
        
        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("✅ [EN_TRANSITO] Etapa actualizada - {} - Nueva etapa: {}", item.getInternalCode(), dto.getLogisticsStage());
        return saved;
    }

    @Transactional
    public InventoryItem reserveProduct(ReserveProductDTO dto) {
        log.info("🔒 [EN_TRANSITO/STOCK_LOCAL] Reservando producto - ID: {} - Cliente: {}", dto.getInventoryItemId(), dto.getCustomerName());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!("EN_TRANSITO".equals(item.getStatus()) || "STOCK_LOCAL".equals(item.getStatus()))) {
            throw new IllegalArgumentException("Solo se puede reservar en EN_TRANSITO o STOCK_LOCAL");
        }

        if (item.getIsReserved() != null && item.getIsReserved()) {
            throw new IllegalArgumentException("Este producto ya está reservado");
        }

        item.setIsReserved(true);
        item.setReservedCustomer(dto.getCustomerName());
        item.setReservedDate(LocalDateTime.now());
        item.setReservedPrice(new BigDecimal(dto.getReservedPrice() != null ? dto.getReservedPrice() : 0));
        item.setReservationAmount(new BigDecimal(dto.getReservationAmount() != null ? dto.getReservationAmount() : 0));

        InventoryItem saved = inventoryItemRepository.save(item);
        log.info("✅ RESERVADO - {} - Cliente: {} - Anticipo: ${}", item.getInternalCode(), dto.getCustomerName(), dto.getReservationAmount());
        return saved;
    }

    // =================== PASO 4: STOCK_LOCAL ===================

    @Transactional
    public InventoryItem confirmLocalReceipt(ConfirmLocalReceiptDTO dto) {
        log.info("📦 [STOCK_LOCAL] Confirmando recepción en local - ID: {}", dto.getInventoryItemId());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (!"STOCK_LOCAL".equals(item.getStatus())) {
            transitionValidator.validateTransition(item.getStatus(), "STOCK_LOCAL");
        }

        // Solo guardar serial number y product owner (datos de verificación, no precios)
        if (dto.getSerialNumber() != null && !dto.getSerialNumber().isEmpty()) {
            item.setSerialNumber(dto.getSerialNumber());
        }

        if (dto.getProductOwner() != null && !dto.getProductOwner().isEmpty()) {
            item.setProductOwner(dto.getProductOwner());
        }

        // Los precios ya fueron ingresados en PREPARACION_ENVIO - NO se editan aquí
        // Solo se verifica que existan
        if (item.getPriceB2B() == null || item.getPriceB2B().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Precios no fueron ingresados en PREPARACION. Revisar preparación del envío");
        }

        // DETECTAR SI TIENE VENTA ANTICIPADA
        Optional<Sale> anticipatedSale = saleRepository.findByInventoryItemId(item.getId());
        
        if (anticipatedSale.isPresent() && "ANTICIPADA".equals(anticipatedSale.get().getSaleType())) {
            log.info("🎯 Producto tiene VENTA ANTICIPADA - Cliente: {}", anticipatedSale.get().getCustomerName());
            
            // Marcar fecha de entrega en la venta
            Sale sale = anticipatedSale.get();
            sale.setDeliveryDate(LocalDateTime.now());
            saleRepository.save(sale);
            
            // Activar garantía
            Optional<Warranty> warranty = warrantyRepository.findByInventoryItemId(item.getId());
            if (warranty.isPresent() && "PENDIENTE".equals(warranty.get().getStatus())) {
                Warranty w = warranty.get();
                w.setWarrantyStartDate(LocalDateTime.now());
                w.setStatus("ACTIVA");
                w.calculateWarrantyEndDate();
                warrantyRepository.save(w);
                log.info("✅ Garantía ACTIVADA - Code: {} - Inicia: {} - Vence: {}", 
                    w.getWarrantyCode(), w.getWarrantyStartDate(), w.getWarrantyEndDate());
            }
            
            // AUTO-TRANSICION: Venta anticipada entregada → VENDIDO directo
            transitionValidator.validateTransition("STOCK_LOCAL", "VENDIDO");
            item.setStatus("VENDIDO");
            InventoryItem saved = inventoryItemRepository.save(item);
            log.info("✅ [VENTA ANTICIPADA ENTREGADA] STOCK_LOCAL → VENDIDO - {} - Cliente: {}", 
                item.getInternalCode(), sale.getCustomerName());
            return saved;
            
        } else {
            // AUTO-TRANSICION: Sin venta anticipada, pasar a DISPONIBLE para venta normal
            item.setStatus("DISPONIBLE");
            InventoryItem saved = inventoryItemRepository.save(item);
            log.info("✅ [AUTO-TRANSICION] STOCK_LOCAL → DISPONIBLE - {} - Serial: {} - B2B: ${} / PVP: ${} - Owner: {}", 
                item.getInternalCode(), item.getSerialNumber(), item.getPriceB2B(), item.getPricePVP(), 
                item.getProductOwner() != null ? item.getProductOwner() : "N/A");
            return saved;
        }
    }

    // =================== PASO 5: VENDIDO ===================

    @Transactional
    public FinalSaleResponseDTO finalSale(FinalSaleDTO dto) {
        log.info("💰 [VENDIDO] Registrando venta final - ID: {} - Cliente: {}", dto.getInventoryItemId(), dto.getCustomerName());

        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        transitionValidator.validateTransition(item.getStatus(), "VENDIDO");

        String statusAtSale = item.getStatus();

        if (dto.getSalePrice() == null || dto.getSalePrice() <= 0) {
            throw new IllegalArgumentException("Precio de venta debe ser mayor a 0");
        }

        BigDecimal salePrice = new BigDecimal(dto.getSalePrice());
        BigDecimal landedCost = item.getLandedCost() != null ? item.getLandedCost() : BigDecimal.ZERO;
        BigDecimal profit = salePrice.subtract(landedCost);

        Sale sale = saleRepository.findByInventoryItemId(item.getId()).orElseGet(() -> {
            Sale newSale = Sale.builder()
                    .inventoryItem(item)
                    .customerName(dto.getCustomerName())
                    .customerEmail(dto.getCustomerEmail())
                    .customerPhone(null)
                    .customerAddress(null)
                    .saleDate(LocalDateTime.now())
                    .salePrice(salePrice)
                    .paymentMethod(dto.getPaymentMethod() != null && !dto.getPaymentMethod().isBlank()
                            ? dto.getPaymentMethod()
                            : "EFECTIVO")
                    .notes(dto.getNotes())
                    .saleType("NORMAL")
                    .statusAtSale(statusAtSale)
                    .profit(profit)
                    .build();
            return saleRepository.save(newSale);
        });

        Warranty warranty = warrantyRepository.findByInventoryItemId(item.getId()).orElseGet(() -> {
            Warranty newWarranty = Warranty.builder()
                    .inventoryItem(item)
                    .customerName(dto.getCustomerName())
                    .customerEmail(dto.getCustomerEmail())
                    .customerPhone(null)
                    .warrantyCode(UUID.randomUUID().toString())
                    .qrToken(UUID.randomUUID().toString())
                    .warrantyType("6_MESES")
                    .warrantyStartDate(LocalDateTime.now())
                    .saleType("NORMAL")
                    .notes(null)
                    .startDate(LocalDateTime.now())
                    .status("ACTIVA")
                    .build();
            newWarranty.calculateWarrantyEndDate();
            return warrantyRepository.save(newWarranty);
        });

        item.setStatus("VENDIDO");
        item.setSoldToCustomer(dto.getCustomerName());
        item.setSoldDate(LocalDateTime.now());
        item.setSalePrice(salePrice);
        item.setProfit(profit);

        inventoryItemRepository.save(item);
        log.info("✅ [VENDIDO] - {} - Cliente: {} - Costo: ${} - Venta: ${} - UTILIDAD: ${}", 
            item.getInternalCode(), dto.getCustomerName(), landedCost, dto.getSalePrice(), profit);

        return FinalSaleResponseDTO.builder()
                .inventoryItemId(item.getId())
                .saleId(sale.getId())
                .customerName(dto.getCustomerName())
                .salePrice(salePrice)
                .saleDate(sale.getSaleDate())
                .warrantyCode(warranty.getWarrantyCode())
                .warrantyType(warranty.getWarrantyType())
                .build();
    }

    // =================== BÚSQUEDAS Y UTILIDADES ===================

    public Optional<InventoryItem> findBySerialNumber(String serialNumber) {
        return inventoryItemRepository.findBySerialNumber(serialNumber);
    }

    public List<InventoryItem> findByStatus(String status) {
        return inventoryItemRepository.findByStatus(status);
    }

    public List<InventoryItem> findAll(String status) {
        if (status == null || status.isBlank()) {
            return inventoryItemRepository.findAll();
        }
        return inventoryItemRepository.findByStatus(status);
    }

    public List<InventoryItem> findPurchased() {
        return inventoryItemRepository.findByStatus("COMPRADO");
    }

    public List<InventoryItem> findInPreparation() {
        return inventoryItemRepository.findByStatus("PREPARACION_ENVIO");
    }

    public List<InventoryItem> findInTransit() {
        return inventoryItemRepository.findByStatus("EN_TRANSITO");
    }

    public List<InventoryItem> findInLocalStock() {
        return inventoryItemRepository.findByStatus("STOCK_LOCAL");
    }

    public List<InventoryItem> findSold() {
        return inventoryItemRepository.findByStatus("VENDIDO");
    }

    // =================== PASO 4.5: DISPONIBLE (Antes de Vendido) ===================

    public List<InventoryItem> findAvailable() {
        return inventoryItemRepository.findByStatus("DISPONIBLE");
    }

    @Transactional
    public InventoryItem markAvailable(Long inventoryItemId) {
        log.info("📦 [DISPONIBLE] Marcando producto como disponible - ID: {}", inventoryItemId);

        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        transitionValidator.validateTransition(item.getStatus(), "DISPONIBLE");
        item.setStatus("DISPONIBLE");
        InventoryItem saved = inventoryItemRepository.save(item);
        
        log.info("✅ [DISPONIBLE] - {} - Serial: {} - Disponible para venta", 
            item.getInternalCode(), item.getSerialNumber());
        return saved;
    }

    @Transactional
    public void deleteItem(Long itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if ("VENDIDO".equals(item.getStatus())) {
            throw new IllegalArgumentException("No se puede eliminar un producto que ya fue vendido");
        }

        inventoryItemRepository.delete(item);
        log.info("🗑️ Producto eliminado - {} - Serial: {}", item.getInternalCode(), item.getSerialNumber());
    }

    private String generateInternalCode() {
        return "FIX-" + String.format("%05d", (int)(System.currentTimeMillis() % 100000)) 
            + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}
