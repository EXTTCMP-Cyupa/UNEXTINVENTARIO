package com.fixme.ecosystem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductVariantDTO {
    
    @NotNull(message = "ID del producto es requerido")
    private Long productId;
    
    @NotBlank(message = "SKU es requerido")
    @Size(min = 3, max = 50, message = "SKU debe tener entre 3 y 50 caracteres")
    private String sku;
    
    @NotNull(message = "Costo FOB es requerido")
    @Positive(message = "Costo FOB debe ser mayor a 0")
    private BigDecimal costPrice;
    
    @NotNull(message = "Precio B2B es requerido")
    @Positive(message = "Precio B2B debe ser mayor a 0")
    private BigDecimal priceB2B;
    
    @NotNull(message = "Precio PVP es requerido")
    @Positive(message = "Precio PVP debe ser mayor a 0")
    private BigDecimal pricePVP;
    
    private JsonNode attributes; // Atributos dinámicos (RAM, CPU, etc.)
}
