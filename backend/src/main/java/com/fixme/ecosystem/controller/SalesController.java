package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.SaleConfirmDTO;
import com.fixme.ecosystem.dto.SaleReserveDTO;
import com.fixme.ecosystem.dto.SaleResponseDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.service.SalesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
@Slf4j
public class SalesController {

    private final SalesService salesService;

    @PostMapping("/reserve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryItem> reserveItem(@RequestBody SaleReserveDTO dto) {
        log.info("Reservando producto - ID: {}", dto.getInventoryItemId());
        InventoryItem item = salesService.reserveItem(dto);
        return ResponseEntity.ok(item);
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SaleResponseDTO> confirmSale(@RequestBody SaleConfirmDTO dto) {
        log.info("Confirmando venta - ID: {}", dto.getInventoryItemId());
        SaleResponseDTO response = salesService.confirmSale(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getPriceForCustomer(
            @RequestParam Long inventoryItemId,
            @RequestParam(required = false) Long customerId) {
        BigDecimal price = salesService.getPriceForCustomer(inventoryItemId, customerId);
        return ResponseEntity.ok(price);
    }
}
