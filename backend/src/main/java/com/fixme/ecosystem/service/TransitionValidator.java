package com.fixme.ecosystem.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Valida transiciones de estado permitidas en el pipeline
 */
@Component
@Slf4j
public class TransitionValidator {

    private static final Map<String, List<String>> ALLOWED_TRANSITIONS = new HashMap<>();

    static {
        // COMPRADO puede ir a PREPARACION_ENVIO
        ALLOWED_TRANSITIONS.put("COMPRADO", List.of("PREPARACION_ENVIO"));
        
        // PREPARACION_ENVIO puede ir a EN_TRANSITO
        ALLOWED_TRANSITIONS.put("PREPARACION_ENVIO", List.of("EN_TRANSITO"));
        
        // EN_TRANSITO puede ir a STOCK_LOCAL (normal) o quedar EN_TRANSITO (venta anticipada hasta llegada)
        ALLOWED_TRANSITIONS.put("EN_TRANSITO", List.of("STOCK_LOCAL"));
        
        // STOCK_LOCAL puede ir a DISPONIBLE o VENDIDO (si fue venta anticipada)
        ALLOWED_TRANSITIONS.put("STOCK_LOCAL", List.of("DISPONIBLE", "VENDIDO"));
        
        // DISPONIBLE puede ir a VENDIDO
        ALLOWED_TRANSITIONS.put("DISPONIBLE", List.of("VENDIDO"));
        
        // VENDIDO es terminal
        ALLOWED_TRANSITIONS.put("VENDIDO", List.of());
    }

    /**
     * Valida si la transición de estado es permitida
     */
    public void validateTransition(String currentStatus, String targetStatus) {
        log.debug("Validando transición: {} → {}", currentStatus, targetStatus);

        List<String> allowed = ALLOWED_TRANSITIONS.get(currentStatus);
        
        if (allowed == null) {
            throw new IllegalStateException("Estado actual no válido: " + currentStatus);
        }

        if (!allowed.contains(targetStatus)) {
            throw new IllegalStateException(
                String.format("Transición no permitida: %s → %s (permitidas: %s)", 
                    currentStatus, targetStatus, String.join(", ", allowed))
            );
        }

        log.info("Transición válida: {} → {}", currentStatus, targetStatus);
    }

    /**
     * Obtiene las transiciones permitidas desde un estado
     */
    public List<String> getAllowedTransitions(String status) {
        return ALLOWED_TRANSITIONS.getOrDefault(status, List.of());
    }

    /**
     * Verifica si un estado es terminal
     */
    public boolean isTerminalStatus(String status) {
        return ALLOWED_TRANSITIONS.getOrDefault(status, List.of()).isEmpty();
    }
}
