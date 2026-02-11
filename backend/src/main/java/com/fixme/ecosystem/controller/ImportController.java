package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.ImportRequestDTO;
import com.fixme.ecosystem.entity.Import;
import com.fixme.ecosystem.service.ImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/imports")
@RequiredArgsConstructor
@Slf4j
public class ImportController {

    private final ImportService importService;

    /**
     * Procesa una nueva importación
     * Calcula el factor de prorrateo y aplica el costo real a cada variante
     */
    @PostMapping("/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Import> processImport(@RequestBody ImportRequestDTO request) {
        log.info("Procesando nueva importación desde {}", request.getProvider());
        Import result = importService.processImport(request);
        return ResponseEntity.ok(result);
    }
}
