package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.CheckoutRequestDTO;
import com.fixme.ecosystem.dto.OrderResponseDTO;
import com.fixme.ecosystem.entity.*;
import com.fixme.ecosystem.repository.InventoryItemRepository;
import com.fixme.ecosystem.repository.OrderRepository;
import com.fixme.ecosystem.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final SaleRepository saleRepository;
    private final InventoryItemRepository inventoryItemRepository;
    
    /**
     * Crea una nueva orden de compra con los artículos del carrito
     * Estado inicial: PRE_VENDIDA
     * Una vez verificado el pago, el admin cambia a VENDIDA
     */
    @Transactional
    public OrderResponseDTO createOrder(CheckoutRequestDTO checkoutRequest) {
        
        // Validar que haya items
        if (checkoutRequest.getItems() == null || checkoutRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("La orden debe contener al menos un artículo");
        }
        
        // Generar número único de orden
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // Calcular totales
        BigDecimal subtotal = BigDecimal.ZERO;
        List<Sale> sales = new java.util.ArrayList<>();
        
        // Crear una venta por cada item del carrito
        for (CheckoutRequestDTO.CartItemDTO cartItem : checkoutRequest.getItems()) {
            InventoryItem inventoryItem = inventoryItemRepository.findById(cartItem.getInventoryItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + cartItem.getInventoryItemId()));
            
            // Validar disponibilidad
            if (!"DISPONIBLE".equals(inventoryItem.getStatus())) {
                throw new IllegalArgumentException("Producto no disponible: " + inventoryItem.getProductName());
            }
            
            BigDecimal itemPrice = cartItem.getUnitPrice() != null ? 
                    cartItem.getUnitPrice() : 
                    inventoryItem.getPricePVP();
            
            BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity() != null ? cartItem.getQuantity() : 1));
            subtotal = subtotal.add(itemTotal);
            
            Sale sale = Sale.builder()
                    .inventoryItem(inventoryItem)
                    .customerName(checkoutRequest.getCustomerName())
                    .customerEmail(checkoutRequest.getCustomerEmail())
                    .customerPhone(checkoutRequest.getCustomerPhone())
                    .customerAddress(checkoutRequest.getCustomerAddress())
                    .salePrice(itemPrice)
                    .paymentMethod(checkoutRequest.getPaymentMethod())
                    .saleType("NORMAL")
                    .statusAtSale(inventoryItem.getStatus())
                    .notes(checkoutRequest.getNotes())
                    .build();
            
            // Cambiar estado del producto a PRE_VENDIDA
            inventoryItem.setStatus("PRE_VENDIDA");
            inventoryItemRepository.save(inventoryItem);
            
            sales.add(sale);
        }
        
        // Crear orden
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerName(checkoutRequest.getCustomerName())
                .customerCedula(checkoutRequest.getCustomerCedula())
                .customerCity(checkoutRequest.getCustomerCity())
                .customerPhone(checkoutRequest.getCustomerPhone())
                .customerAddress(checkoutRequest.getCustomerAddress())
                .deliveryType(checkoutRequest.getDeliveryType())
                .paymentMethod(checkoutRequest.getPaymentMethod())
                .subtotal(subtotal)
                .total(subtotal)
                .status("PRE_VENDIDA")
                .isPaid(false)
                .notes(checkoutRequest.getNotes())
                .build();
        
        Order savedOrder = orderRepository.save(order);
        
        // Asignar orden a las ventas y guardarlas
        for (Sale sale : sales) {
            sale.setOrder(savedOrder);
            saleRepository.save(sale);
        }
        
        return mapToOrderResponse(savedOrder, sales);
    }
    
    /**
     * Marca una orden como pagada
     */
    @Transactional
    public OrderResponseDTO markOrderAsPaid(Long orderId, String paymentNotes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        order.setIsPaid(true);
        order.setPaidAt(LocalDateTime.now());
        order.setPaymentNotes(paymentNotes);
        order.setStatus("VENDIDA");
        
        // Cambiar estado de todos los productos a VENDIDA
        List<Sale> sales = saleRepository.findByOrder(order);
        for (Sale sale : sales) {
            InventoryItem item = sale.getInventoryItem();
            item.setStatus("VENDIDA");
            inventoryItemRepository.save(item);
        }
        
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder, sales);
    }
    
    /**
     * Obtiene una orden por ID
     */
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        List<Sale> sales = saleRepository.findByOrder(order);
        return mapToOrderResponse(order, sales);
    }
    
    /**
     * Obtiene una orden por número de referencia
     */
    public OrderResponseDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada: " + orderNumber));
        List<Sale> sales = saleRepository.findByOrder(order);
        return mapToOrderResponse(order, sales);
    }
    
    /**
     * Obtiene órdenes por cédula del cliente
     */
    public List<OrderResponseDTO> getOrdersByCedula(String cedula) {
        List<Order> orders = orderRepository.findByCustomerCedula(cedula);
        return orders.stream()
                .map(order -> {
                    List<Sale> sales = saleRepository.findByOrder(order);
                    return mapToOrderResponse(order, sales);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene órdenes pendientes de pago (estado PRE_VENDIDA)
     */
    public List<OrderResponseDTO> getPendingOrders() {
        List<Order> orders = orderRepository.findByStatus("PRE_VENDIDA");
        return orders.stream()
                .map(order -> {
                    List<Sale> sales = saleRepository.findByOrder(order);
                    return mapToOrderResponse(order, sales);
                })
                .collect(Collectors.toList());
    }

    /**
     * Mapea una entidad Order a DTO
     */
    private OrderResponseDTO mapToOrderResponse(Order order, List<Sale> sales) {
        List<OrderResponseDTO.OrderItemDTO> items = sales.stream()
                .map(sale -> OrderResponseDTO.OrderItemDTO.builder()
                        .saleId(sale.getId())
                        .productName(sale.getInventoryItem().getProductName())
                        .brand(sale.getInventoryItem().getBrand())
                        .model(sale.getInventoryItem().getModel())
                        .price(sale.getSalePrice())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .createdAt(order.getCreatedAt())
                .customerName(order.getCustomerName())
                .customerCedula(order.getCustomerCedula())
                .customerCity(order.getCustomerCity())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .orderStatus(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .deliveryType(order.getDeliveryType())
                .subtotal(order.getSubtotal())
                .total(order.getTotal())
                .itemCount(items.size())
                .items(items)
                .isPaid(order.getIsPaid())
                .paymentNotes(order.getPaymentNotes())
                .build();
    }
}
