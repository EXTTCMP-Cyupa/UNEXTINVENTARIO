package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.SaleConfirmDTO;
import com.fixme.ecosystem.dto.SaleReserveDTO;
import com.fixme.ecosystem.dto.SaleResponseDTO;
import com.fixme.ecosystem.entity.InventoryItem;
import com.fixme.ecosystem.entity.PriceRule;
import com.fixme.ecosystem.entity.Transaction;
import com.fixme.ecosystem.entity.User;
import com.fixme.ecosystem.entity.Warranty;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import com.fixme.ecosystem.repository.PriceRuleRepository;
import com.fixme.ecosystem.repository.TransactionRepository;
import com.fixme.ecosystem.repository.UserRepository;
import com.fixme.ecosystem.repository.WarrantyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesService {

    private static final int DEFAULT_WARRANTY_MONTHS = 3;

    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final TransactionRepository transactionRepository;
    private final WarrantyRepository warrantyRepository;

    @Transactional
    public InventoryItem reserveItem(SaleReserveDTO dto) {
        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if (!"DISPONIBLE".equals(item.getStatus())) {
            throw new IllegalArgumentException("El producto no esta disponible para reserva");
        }

        User customer = resolveCustomer(dto.getCustomerId());
        String customerName = resolveCustomerName(customer, dto.getCustomerName());

        BigDecimal price = dto.getOverridePrice() != null
                ? dto.getOverridePrice()
                : resolvePriceForCustomer(item, customer);

        item.setStatus("RESERVADO");
        item.setReservedToCustomer(customerName);
        item.setReservedDate(LocalDateTime.now());
        item.setReservedPrice(price);

        return inventoryItemRepository.save(item);
    }

    @Transactional
    public SaleResponseDTO confirmSale(SaleConfirmDTO dto) {
        InventoryItem item = inventoryItemRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));

        if (!"RESERVADO".equals(item.getStatus())) {
            throw new IllegalArgumentException("El producto debe estar en estado RESERVADO");
        }

        User customer = resolveCustomer(dto.getCustomerId());
        String customerName = resolveCustomerName(customer, dto.getCustomerName());

        BigDecimal salePrice = dto.getSalePrice() != null
                ? dto.getSalePrice()
                : Optional.ofNullable(item.getReservedPrice())
                    .orElseGet(() -> resolvePriceForCustomer(item, customer));

        BigDecimal landedCost = item.getLandedCost() != null ? item.getLandedCost() : BigDecimal.ZERO;
        BigDecimal roi = salePrice.subtract(landedCost);

        Transaction transaction = Transaction.builder()
                .inventoryItem(item)
                .customer(customer)
                .amount(salePrice)
                .paymentMethod(dto.getPaymentMethod())
                .paymentDestination(dto.getPaymentDestination())
                .receiptUrl(dto.getReceiptUrl())
                .roi(roi)
                .build();
        transaction = transactionRepository.save(transaction);

        int warrantyMonths = dto.getWarrantyMonths() != null ? dto.getWarrantyMonths() : DEFAULT_WARRANTY_MONTHS;
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(warrantyMonths);

        Warranty warranty = Warranty.builder()
                .inventoryItem(item)
                .customer(customer)
                .startDate(startDate)
                .endDate(endDate)
                .status("ACTIVE")
                .qrToken(UUID.randomUUID().toString())
                .build();
        warranty = warrantyRepository.save(warranty);

        item.setStatus("VENDIDO");
        item.setSoldToCustomer(customerName);
        item.setSoldDate(LocalDateTime.now());
        item.setReservedToCustomer(null);
        item.setReservedDate(null);
        item.setReservedPrice(null);
        inventoryItemRepository.save(item);

        return SaleResponseDTO.builder()
                .inventoryItemId(item.getId())
                .status(item.getStatus())
                .soldToCustomer(item.getSoldToCustomer())
                .soldDate(item.getSoldDate())
                .transactionId(transaction.getId())
                .warrantyId(warranty.getId())
                .warrantyEndDate(warranty.getEndDate())
                .qrToken(warranty.getQrToken())
                .build();
    }

    public BigDecimal resolvePriceForCustomer(InventoryItem item, User customer) {
        String role = customer != null ? customer.getRole() : "USER";
        String priceType = priceRuleRepository.findByRoleAndActiveTrue(role)
                .map(PriceRule::getPriceType)
                .orElseGet(() -> "PARTNER".equals(role) ? "B2B" : "PVP");

        if ("B2B".equals(priceType) && item.getPriceB2B() != null) {
            return item.getPriceB2B();
        }
        if (item.getPricePVP() != null) {
            return item.getPricePVP();
        }
        return BigDecimal.ZERO;
    }

    public BigDecimal getPriceForCustomer(Long inventoryItemId, Long customerId) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new IllegalArgumentException("InventoryItem no encontrada"));
        User customer = resolveCustomer(customerId);
        return resolvePriceForCustomer(item, customer);
    }

    private User resolveCustomer(Long customerId) {
        if (customerId == null) {
            return null;
        }
        return userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
    }

    private String resolveCustomerName(User customer, String customerName) {
        if (customer != null) {
            return customer.getFullName();
        }
        if (customerName != null && !customerName.isBlank()) {
            return customerName;
        }
        return "Cliente Mostrador";
    }
}
