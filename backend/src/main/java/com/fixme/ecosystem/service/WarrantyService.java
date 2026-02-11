package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.WarrantyHistoryDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.Transaction;
import com.fixme.ecosystem.entity.Warranty;
import com.fixme.ecosystem.repository.InventoryItemRepository;
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
}
