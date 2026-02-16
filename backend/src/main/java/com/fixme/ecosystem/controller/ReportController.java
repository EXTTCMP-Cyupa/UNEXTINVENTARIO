package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.SalesReportDTO;
import com.fixme.ecosystem.dto.SalesSummaryDTO;
import com.fixme.ecosystem.dto.InventoryReportDTO;
import com.fixme.ecosystem.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * GET /api/admin/reports/sales/summary
     * Retorna resumen general de ventas
     */
    @GetMapping("/sales/summary")
    public ResponseEntity<?> getSalesSummary() {
        try {
            SalesSummaryDTO summary = reportService.getSalesSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.ok().body(new SalesSummaryDTO(0L, null, null, null, null, 0L));
        }
    }

    /**
     * GET /api/admin/reports/sales/list
     * Retorna lista detallada de ventas
     */
    @GetMapping("/sales/list")
    public ResponseEntity<?> getSalesReport(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String warrantyType
    ) {
        try {
            List<SalesReportDTO> sales = reportService.getSalesReport(customerName, paymentMethod, warrantyType);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener reporte de ventas: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/reports/inventory/summary
     * Retorna resumen del inventario
     */
    @GetMapping("/inventory/summary")
    public ResponseEntity<?> getInventorySummary() {
        try {
            InventoryReportDTO inventory = reportService.getInventorySummary();
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener reporte de inventario: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/reports/sales/by-date
     * Retorna ventas por rango de fechas
     */
    @GetMapping("/sales/by-date")
    public ResponseEntity<?> getSalesByDateRange(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            List<SalesReportDTO> sales = reportService.getSalesByDateRange(startDate, endDate);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/reports/sales/payment-methods
     * Retorna distribución de métodos de pago
     */
    @GetMapping("/sales/payment-methods")
    public ResponseEntity<?> getPaymentMethodsDistribution() {
        try {
            var result = reportService.getPaymentMethodsDistribution();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/reports/health
     * Health check para reportes
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok().body(new Object() {
            public String status = "Reports API OK";
        });
    }
}
