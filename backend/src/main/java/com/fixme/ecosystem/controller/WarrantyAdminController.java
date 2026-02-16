package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.entity.Warranty;
import com.fixme.ecosystem.repository.WarrantyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/warranty")
@Slf4j
public class WarrantyAdminController {

    @Autowired
    private WarrantyRepository warrantyRepository;

    @GetMapping("/list")
    public ResponseEntity<List<WarrantyAdminDTO>> listAllWarranties() {
        List<Warranty> warranties = warrantyRepository.findAll();
        List<WarrantyAdminDTO> result = warranties.stream()
            .map(WarrantyAdminDTO::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint temporal para actualizar valores NULL en warranty_code y warranty_type
     * Este endpoint se debe ejecutar una sola vez después de la migración
     */
    @PostMapping("/fix-null-values")
    public ResponseEntity<?> fixNullValues() {
        try {
            log.info("Iniciando actualización de valores NULL en warranty...");
            
            List<Warranty> warranties = warrantyRepository.findAll();
            int updated = 0;
            
            for (Warranty warranty : warranties) {
                boolean needsUpdate = false;
                
                if (warranty.getWarrantyCode() == null || warranty.getWarrantyCode().isEmpty()) {
                    warranty.setWarrantyCode(UUID.randomUUID().toString());
                    needsUpdate = true;
                    log.debug("Generando warranty_code para warranty ID: {}", warranty.getId());
                }
                
                if (warranty.getWarrantyType() == null || warranty.getWarrantyType().isEmpty()) {
                    warranty.setWarrantyType("SIN_GARANTIA");
                    needsUpdate = true;
                    log.debug("Estableciendo warranty_type para warranty ID: {}", warranty.getId());
                }
                
                if (warranty.getStatus() == null || warranty.getStatus().isEmpty()) {
                    warranty.setStatus("ACTIVA");
                    needsUpdate = true;
                }
                
                if (warranty.getSaleType() == null || warranty.getSaleType().isEmpty()) {
                    warranty.setSaleType("NORMAL");
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    warrantyRepository.save(warranty);
                    updated++;
                }
            }
            
            log.info("Actualización completada. {} garantías actualizadas.", updated);
            
            return ResponseEntity.ok(String.format(
                "Actualización exitosa. %d garantías actualizadas de %d totales.",
                updated, warranties.size()
            ));
            
        } catch (Exception e) {
            log.error("Error actualizando valores NULL: ", e);
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/count-nulls")
    public ResponseEntity<?> countNulls() {
        try {
            List<Warranty> warranties = warrantyRepository.findAll();
            
            long nullCodes = warranties.stream()
                .filter(w -> w.getWarrantyCode() == null || w.getWarrantyCode().isEmpty())
                .count();
            
            long nullTypes = warranties.stream()
                .filter(w -> w.getWarrantyType() == null || w.getWarrantyType().isEmpty())
                .count();
            
            return ResponseEntity.ok(String.format(
                "Total warranties: %d, NULL warranty_code: %d, NULL warranty_type: %d",
                warranties.size(), nullCodes, nullTypes
            ));
            
        } catch (Exception e) {
            log.error("Error contando NULLs: ", e);
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }

    public static class WarrantyAdminDTO {
        public Long id;
        public String warrantyCode;
        public String qrToken;
        public String warrantyType;
        public String status;
        public String saleType;
        public String customerName;
        public String customerEmail;
        public String customerPhone;
        public java.time.LocalDateTime startDate;
        public java.time.LocalDateTime warrantyStartDate;
        public java.time.LocalDateTime warrantyEndDate;
        public Long inventoryItemId;
        public String serialNumber;
        public String internalCode;
        public String productName;
        public String brand;
        public String model;
        public java.math.BigDecimal salePrice;
        public java.time.LocalDateTime soldDate;

        public static WarrantyAdminDTO fromEntity(Warranty warranty) {
            WarrantyAdminDTO dto = new WarrantyAdminDTO();
            dto.id = warranty.getId();
            dto.warrantyCode = warranty.getWarrantyCode();
            dto.qrToken = warranty.getQrToken();
            dto.warrantyType = warranty.getWarrantyType();
            dto.status = warranty.getStatus();
            dto.saleType = warranty.getSaleType();
            dto.customerName = warranty.getCustomerName();
            dto.customerEmail = warranty.getCustomerEmail();
            dto.customerPhone = warranty.getCustomerPhone();
            dto.startDate = warranty.getStartDate();
            dto.warrantyStartDate = warranty.getWarrantyStartDate();
            dto.warrantyEndDate = warranty.getWarrantyEndDate();

            if (warranty.getInventoryItem() != null) {
                dto.inventoryItemId = warranty.getInventoryItem().getId();
                dto.serialNumber = warranty.getInventoryItem().getSerialNumber();
                dto.internalCode = warranty.getInventoryItem().getInternalCode();
                dto.productName = warranty.getInventoryItem().getProductName();
                dto.brand = warranty.getInventoryItem().getBrand();
                dto.model = warranty.getInventoryItem().getModel();
                dto.salePrice = warranty.getInventoryItem().getSalePrice();
                dto.soldDate = warranty.getInventoryItem().getSoldDate();
            }

            return dto;
        }
    }
}
