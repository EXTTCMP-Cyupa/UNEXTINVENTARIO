package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.CheckoutRequestDTO;
import com.fixme.ecosystem.dto.OrderResponseDTO;
import com.fixme.ecosystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * Crear una nueva orden (checkout)
     */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody CheckoutRequestDTO checkoutRequest) {
        try {
            OrderResponseDTO order = orderService.createOrder(checkoutRequest);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener órdenes pendientes de pago (PRE_VENDIDA) - Solo admin
     */
    @GetMapping("/pending")
    public ResponseEntity<List<OrderResponseDTO>> getPendingOrders() {
        List<OrderResponseDTO> orders = orderService.getPendingOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Obtener orden por número de referencia
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponseDTO> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            OrderResponseDTO order = orderService.getOrderByNumber(orderNumber);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtener órdenes por cédula del cliente
     */
    @GetMapping("/customer/{cedula}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByCedula(@PathVariable String cedula) {
        List<OrderResponseDTO> orders = orderService.getOrdersByCedula(cedula);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Obtener orden por ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long orderId) {
        try {
            OrderResponseDTO order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Marcar orden como pagada (solo admin)
     */
    @PutMapping("/{orderId}/mark-paid")
    public ResponseEntity<OrderResponseDTO> markOrderAsPaid(
            @PathVariable Long orderId,
            @RequestParam(required = false) String paymentNotes) {
        try {
            OrderResponseDTO order = orderService.markOrderAsPaid(orderId, paymentNotes);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
