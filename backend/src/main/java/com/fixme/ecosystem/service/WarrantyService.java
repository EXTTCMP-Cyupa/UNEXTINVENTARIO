package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.PublicWarrantyDTO;
import com.fixme.ecosystem.dto.WarrantyHistoryDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.Transaction;
import com.fixme.ecosystem.entity.Warranty;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import com.fixme.ecosystem.repository.SaleRepository;
import com.fixme.ecosystem.repository.TransactionRepository;
import com.fixme.ecosystem.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final TransactionRepository transactionRepository;
    private final SaleRepository saleRepository;

        public Optional<WarrantyHistoryDTO> getWarrantyBySerial(String serialOrCode) {
        return findInventoryItem(serialOrCode)
            .flatMap(item -> warrantyRepository.findByInventoryItemId(item.getId())
                .map(warranty -> mapToDto(item, warranty)));
    }

    public Optional<WarrantyHistoryDTO> getWarrantyByQrToken(String qrToken) {
        return warrantyRepository.findByQrToken(qrToken)
                .map(warranty -> mapToDto(warranty.getInventoryItem(), warranty));
    }

    private Optional<InventoryItem> findInventoryItem(String serialOrCode) {
        Optional<InventoryItem> bySerial = inventoryItemRepository.findBySerialNumber(serialOrCode);
        if (bySerial.isPresent()) {
            return bySerial;
        }
        return inventoryItemRepository.findByInternalCode(serialOrCode);
    }

    private WarrantyHistoryDTO mapToDto(InventoryItem item, Warranty warranty) {
        Transaction transaction = transactionRepository
            .findTopByInventoryItemIdOrderByCreatedAtDesc(item.getId())
            .orElse(null);

        return WarrantyHistoryDTO.builder()
            .inventoryId(item.getId())
                .serialNumber(item.getSerialNumber())
                .internalCode(item.getInternalCode())
                .productName(item.getProductName())
                .brand(item.getBrand())
                .model(item.getModel())
                .status(item.getStatus())
                .customerName(item.getSoldToCustomer())
                .saleDate(item.getSoldDate())
                .warrantyEndDate(warranty.getEndDate())
                .warrantyStatus(warranty.getStatus())
                .qrToken(warranty.getQrToken())
            .salePrice(transaction != null ? transaction.getAmount() : item.getPricePVP())
                .landedCost(item.getLandedCost())
                .build();
    }

    /**
     * Obtiene información pública de garantía por código único
     * Este endpoint es público y muestra información dinámica según el estado
     */
    public Optional<PublicWarrantyDTO> getPublicWarrantyByCode(String warrantyCode) {
        return warrantyRepository.findByWarrantyCode(warrantyCode)
                .map(warranty -> {
                    InventoryItem item = warranty.getInventoryItem();
                    
                    // Buscar información de venta
                    var sale = saleRepository.findByInventoryItemId(item.getId()).orElse(null);
                    
                    // Construir mensaje dinámico según estado
                    String message = buildWarrantyMessage(warranty);
                    
                    return PublicWarrantyDTO.builder()
                            .productName(item.getProductName())
                            .brand(item.getBrand())
                            .model(item.getModel())
                            .serialNumber(item.getSerialNumber())
                            .internalCode(item.getInternalCode())
                            .customerName(warranty.getCustomerName())
                            .customerEmail(warranty.getCustomerEmail())
                            .warrantyCode(warranty.getWarrantyCode())
                            .warrantyType(warranty.getWarrantyType())
                            .status(warranty.getStatus())
                            .warrantyStartDate(warranty.getWarrantyStartDate())
                            .warrantyEndDate(warranty.getWarrantyEndDate())
                            .saleType(warranty.getSaleType())
                            .saleDate(sale != null ? sale.getSaleDate() : warranty.getStartDate())
                            .salePrice(sale != null ? sale.getSalePrice() : item.getSalePrice())
                            .message(message)
                            .build();
                });
    }
    
    private String buildWarrantyMessage(Warranty warranty) {
        if ("PENDIENTE".equals(warranty.getStatus())) {
            return "⏳ Este producto se encuentra en tránsito. La garantía comenzará cuando el equipo sea entregado en el local.";
        } else if ("ACTIVA".equals(warranty.getStatus())) {
            return "✅ Garantía activa. Puedes hacer válida tu garantía presentando este documento.";
        } else if ("VENCIDA".equals(warranty.getStatus())) {
            return "❌ Esta garantía ha vencido. Para renovaciones o extensiones, contacta con nosotros.";
        } else if ("SIN_GARANTIA".equals(warranty.getWarrantyType())) {
            return "ℹ️ Este producto fue vendido sin garantía.";
        }
        return "ℹ️ Para más información sobre tu garantía, contacta con nosotros.";
    }
}
