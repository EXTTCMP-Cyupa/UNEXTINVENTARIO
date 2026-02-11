package com.fixme.ecosystem.service;

import com.fixme.ecosystem.dto.CreateProductDTO;
import com.fixme.ecosystem.dto.CreateProductVariantDTO;
import com.fixme.ecosystem.dto.ProductVariantDTO;
import com.fixme.ecosystem.entity.Product;
import com.fixme.ecosystem.entity.ProductVariant;
import com.fixme.ecosystem.repository.ProductRepository;
import com.fixme.ecosystem.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getPublicCatalog() {
        log.info("Obteniendo catálogo público (precios PVP)");
        return productVariantRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getB2BCatalog() {
        log.info("Obteniendo catálogo B2B (precios de socio)");
        return productVariantRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductVariantDTO getVariantBySku(String sku) {
        return productVariantRepository.findBySku(sku)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("SKU no encontrado: " + sku));
    }

    @Transactional
    public ProductVariant createVariant(ProductVariant variant) {
        log.info("Creando variante: {}", variant.getSku());
        return productVariantRepository.save(variant);
    }

    @Transactional
    public Product createProduct(CreateProductDTO dto) {
        log.info("Creando producto: {} - {}", dto.getBrand(), dto.getName());
        
        Product product = Product.builder()
                .name(dto.getName())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .active(true)
                .build();
        
        return productRepository.save(product);
    }

    @Transactional
    public ProductVariant createProductVariant(CreateProductVariantDTO dto) {
        log.info("Creando variante de producto - SKU: {}", dto.getSku());
        
        // Validar que el SKU no exista
        if (productVariantRepository.findBySku(dto.getSku()).isPresent()) {
            throw new RuntimeException("SKU ya existe: " + dto.getSku());
        }
        
        // Cargar el producto
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + dto.getProductId()));
        
        // Validar precios (PVP > B2B > FOB)
        if (dto.getPricePVP().compareTo(dto.getPriceB2B()) <= 0) {
            throw new RuntimeException("PVP debe ser mayor a precio B2B");
        }
        if (dto.getPriceB2B().compareTo(dto.getCostPrice()) <= 0) {
            throw new RuntimeException("Precio B2B debe ser mayor a costo FOB");
        }
        
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(dto.getSku())
                .costPrice(dto.getCostPrice())
                .landedCost(dto.getCostPrice()) // Inicialmente igual al FOB
                .priceB2B(dto.getPriceB2B())
                .pricePVP(dto.getPricePVP())
                .stock(0) // Se incrementa al importar
                .attributes(dto.getAttributes())
                .active(true)
                .build();
        
        return productVariantRepository.save(variant);
    }

    private ProductVariantDTO convertToDTO(ProductVariant variant) {
        return ProductVariantDTO.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .productName(variant.getProduct().getName())
                .sku(variant.getSku())
                .costPrice(variant.getCostPrice())
                .landedCost(variant.getLandedCost())
                .priceB2B(variant.getPriceB2B())
                .pricePVP(variant.getPricePVP())
                .stock(variant.getStock())
                .attributes(variant.getAttributes())
                .active(variant.getActive())
                .build();
    }
}
