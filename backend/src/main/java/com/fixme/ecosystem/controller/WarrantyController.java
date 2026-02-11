package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.service.ImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warranty")
@RequiredArgsConstructor
@Slf4j
public class WarrantyController {

    private final ImportService importService;

    /**
     * Obtiene el historial completo de garantía por número de serie
     * Devuelve: Fecha de importación, Proveedor, Fecha de venta, Cliente
     */
    @GetMapping("/{serialNumber}")
    public ResponseEntity<?> getWarrantyHistory(@PathVariable String serialNumber) {
        log.info("Buscando información de garantía para S/N: {}", serialNumber);
        return importService.getWarrantyInfo(serialNumber)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
