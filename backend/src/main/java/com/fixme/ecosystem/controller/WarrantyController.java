package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.service.WarrantyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warranty")
@RequiredArgsConstructor
@Slf4j
public class WarrantyController {

    private final WarrantyService warrantyService;

    /**
     * Obtiene el historial completo de garantía por serial o código interno
     */
    @GetMapping("/{serialOrCode}")
    public ResponseEntity<?> getWarrantyHistory(@PathVariable String serialOrCode) {
        log.info("Buscando información de garantía para: {}", serialOrCode);
        return warrantyService.getWarrantyBySerial(serialOrCode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/qr/{qrToken}")
    public ResponseEntity<?> getWarrantyByQr(@PathVariable String qrToken) {
        log.info("Buscando información de garantía por QR: {}", qrToken);
        return warrantyService.getWarrantyByQrToken(qrToken)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
