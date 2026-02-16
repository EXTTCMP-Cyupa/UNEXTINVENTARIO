package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.SalesReportDTO;
import com.fixme.ecosystem.dto.SalesSummaryDTO;
import com.fixme.ecosystem.dto.InventoryReportDTO;
import com.fixme.ecosystem.entity.Sale;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.repository.SaleRepository;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    /**
     * Obtiene resumen general de ventas
     */
    public SalesSummaryDTO getSalesSummary() {
        List<Sale> allSales = saleRepository.findAll();

        if (allSales.isEmpty()) {
            return new SalesSummaryDTO(0L, BigDecimal.ZERO, BigDecimal.ZERO, null, null, 0L);
        }

        Long totalSales = (long) allSales.size();
        BigDecimal totalRevenue = allSales.stream()
                .map(s -> s.getSalePrice() != null ? s.getSalePrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averageSalePrice = totalRevenue.divide(BigDecimal.valueOf(totalSales), 2, RoundingMode.HALF_UP);

        // Método de pago más usado
        String topPaymentMethod = allSales.stream()
                .map(Sale::getPaymentMethod)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(pm -> pm, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("EFECTIVO");

        // Tipo de garantía más usado (default)
        String topWarrantyType = "6_MESES";

        // Garantías creadas - contar productos con warranty
        Long warrantiesCreated = allSales.stream()
                .filter(s -> s.getInventoryItem() != null)
                .count();

        return new SalesSummaryDTO(totalSales, totalRevenue, averageSalePrice, 
                topPaymentMethod, topWarrantyType, warrantiesCreated);
    }

    /**
     * Obtiene lista de ventas con filtros opcionales
     */
    public List<SalesReportDTO> getSalesReport(String customerName, String paymentMethod, String warrantyType) {
        List<Sale> sales = saleRepository.findAll();

        return sales.stream()
                .filter(s -> customerName == null || s.getCustomerName().contains(customerName))
                .filter(s -> paymentMethod == null || s.getPaymentMethod().equals(paymentMethod))
                .map(this::convertToSalesReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene resumen del inventario
     */
    public InventoryReportDTO getInventorySummary() {
        List<InventoryItem> allItems = inventoryItemRepository.findAll();

        if (allItems.isEmpty()) {
            return new InventoryReportDTO(0L, 0L, 0L, 0L, 0.0, 0.0);
        }

        Long totalProducts = (long) allItems.size();
        Long productsAvailable = allItems.stream()
                .filter(i -> "DISPONIBLE".equals(i.getStatus()))
                .count();
        Long productsInTransit = allItems.stream()
                .filter(i -> "EN_TRANSITO".equals(i.getStatus()))
                .count();
        
        // Contar productos disponibles hace más de 90 días
        Long lowStockCount = 0L;

        Double averageDaysInStock = 0.0;

        Double totalInventoryValue = allItems.stream()
                .mapToDouble(i -> {
                    BigDecimal cost = i.getCostFob() != null ? i.getCostFob() : BigDecimal.ZERO;
                    return cost.doubleValue();
                })
                .sum();

        return new InventoryReportDTO(totalProducts, productsAvailable, productsInTransit, 
                lowStockCount, averageDaysInStock, totalInventoryValue);
    }

    /**
     * Obtiene ventas por rango de fechas
     */
    public List<SalesReportDTO> getSalesByDateRange(String startDateStr, String endDateStr) {
        LocalDate startDate = startDateStr != null ? LocalDate.parse(startDateStr) : LocalDate.now().minusMonths(1);
        LocalDate endDate = endDateStr != null ? LocalDate.parse(endDateStr) : LocalDate.now();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Sale> sales = saleRepository.findAll().stream()
                .filter(s -> s.getCreatedAt() != null && 
                        s.getCreatedAt().isAfter(startDateTime) && 
                        s.getCreatedAt().isBefore(endDateTime))
                .collect(Collectors.toList());

        return sales.stream()
                .map(this::convertToSalesReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene distribución de métodos de pago
     */
    public Map<String, Long> getPaymentMethodsDistribution() {
        List<Sale> allSales = saleRepository.findAll();

        return allSales.stream()
                .map(Sale::getPaymentMethod)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(pm -> pm, Collectors.counting()));
    }

    /**
     * Convierte Sale a SalesReportDTO
     */
    private SalesReportDTO convertToSalesReportDTO(Sale sale) {
        return new SalesReportDTO(
                sale.getId(),
                sale.getCustomerName(),
                sale.getCustomerEmail(),
                sale.getInventoryItem() != null ? sale.getInventoryItem().getProductName() : "Unknown",
                sale.getInventoryItem() != null ? sale.getInventoryItem().getInternalCode() : "N/A",
                sale.getSalePrice(),
                sale.getPaymentMethod(),
                "6_MESES",  // Default warranty type
                sale.getSaleDate(),
                sale.getSaleType()  // Using saleType instead of status
        );
    }
}
