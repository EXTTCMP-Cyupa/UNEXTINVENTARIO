package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.CreateProductDTO;
import com.fixme.ecosystem.dto.CreateProductVariantDTO;
import com.fixme.ecosystem.entity.Product;
import com.fixme.ecosystem.entity.ProductVariant;
import com.fixme.ecosystem.entity.User;
import com.fixme.ecosystem.repository.UserRepository;
import com.fixme.ecosystem.security.JwtTokenProvider;
import com.fixme.ecosystem.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador temporal sin autenticación para crear productos rápidamente
 * ⚠️ SOLO PARA DESARROLLO - REMOVER EN PRODUCCIÓN
 */
@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
@Slf4j
public class DevController {

    private final ProductService productService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtener token sin autenticación (SOLO PARA DEV)
     */
    @GetMapping("/token/admin")
    public ResponseEntity<Map<String, String>> getDevToken() {
        log.warn("⚠️ Generando token de desarrollo sin autenticación - SOLO PARA DEV");
        User admin = userRepository.findByEmail("admin@fixme.com").orElse(null);
        
        Map<String, String> response = new HashMap<>();
        if (admin != null) {
            String token = jwtTokenProvider.generateToken(admin.getEmail(), admin.getRole());
            response.put("token", token);
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole());
        } else {
            response.put("error", "Admin user not found");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * Crear producto sin autenticación (SOLO PARA DEV)
     */
    @PostMapping("/products")
    public ResponseEntity<Product> devCreateProduct(@RequestBody CreateProductDTO dto) {
        log.warn("⚠️ Creando producto sin autenticación - SOLO PARA DEV");
        Product product = productService.createProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * Crear variante sin autenticación (SOLO PARA DEV)
     */
    @PostMapping("/variants")
    public ResponseEntity<ProductVariant> devCreateVariant(@RequestBody CreateProductVariantDTO dto) {
        log.warn("⚠️ Creando variante sin autenticación - SOLO PARA DEV");
        ProductVariant variant = productService.createProductVariant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(variant);
    }

    /**
     * Crear un producto completo con variantes (SOLO PARA DEV)
     */
    @PostMapping("/quickstart")
    public ResponseEntity<Map<String, Object>> quickStart() {
        log.warn("⚠️ Creando productos de demostración - SOLO PARA DEV");
        
        // Producto 1: Laptop HP
        Product laptop = productService.createProduct(CreateProductDTO.builder()
                .name("Laptop ProBook 15.6\"")
                .brand("HP")
                .model("ProBook 450 G9")
                .category("Laptops")
                .description("Laptop empresarial de alta rendimiento")
                .build());
        
        ProductVariant var1 = productService.createProductVariant(CreateProductVariantDTO.builder()
                .productId(laptop.getId())
                .sku("HP-PB450-I5-8GB-256SSD")
                .costPrice(new BigDecimal("380.00"))
                .priceB2B(new BigDecimal("460.00"))
                .pricePVP(new BigDecimal("550.00"))
                .build());
        
        ProductVariant var2 = productService.createProductVariant(CreateProductVariantDTO.builder()
                .productId(laptop.getId())
                .sku("HP-PB450-I7-16GB-512SSD")
                .costPrice(new BigDecimal("520.00"))
                .priceB2B(new BigDecimal("630.00"))
                .pricePVP(new BigDecimal("750.00"))
                .build());
        
        // Producto 2: Monitor Dell
        Product monitor = productService.createProduct(CreateProductDTO.builder()
                .name("Monitor IPS 27 Pulgadas 4K")
                .brand("Dell")
                .model("U2723DE")
                .category("Monitores")
                .description("Monitor profesional 4K USB-C")
                .build());
        
        ProductVariant var3 = productService.createProductVariant(CreateProductVariantDTO.builder()
                .productId(monitor.getId())
                .sku("DELL-U2723DE-4K-USB-C")
                .costPrice(new BigDecimal("350.00"))
                .priceB2B(new BigDecimal("420.00"))
                .pricePVP(new BigDecimal("499.00"))
                .build());
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Productos creados exitosamente");
        result.put("products", 2);
        result.put("variants", 3);
        result.put("skus", new String[]{"HP-PB450-I5-8GB-256SSD", "HP-PB450-I7-16GB-512SSD", "DELL-U2723DE-4K-USB-C"});
        
        return ResponseEntity.ok(result);
    }

    /**
     * Resetear contraseña de un usuario (SOLO PARA DEV)
     * POST /dev/reset-password?email=user@example.com&password=newPassword
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestParam String email,
            @RequestParam String password) {
        log.warn("⚠️ Reseteando contraseña para usuario: {} - SOLO PARA DEV", email);
        
        Map<String, String> response = new HashMap<>();
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            response.put("error", "Usuario no encontrado: " + email);
            return ResponseEntity.status(400).body(response);
        }
        
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
        
        response.put("message", "Contraseña actualizada");
        response.put("email", email);
        response.put("newPassword", password);
        
        return ResponseEntity.ok(response);
    }
}
