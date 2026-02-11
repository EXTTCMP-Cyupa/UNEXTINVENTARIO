package com.fixme.ecosystem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductDTO {
    
    @NotBlank(message = "Nombre es requerido")
    @Size(min = 3, max = 100, message = "Nombre debe tener entre 3 y 100 caracteres")
    private String name;
    
    @NotBlank(message = "Marca es requerida")
    @Size(min = 2, max = 50, message = "Marca debe tener entre 2 y 50 caracteres")
    private String brand;
    
    @NotBlank(message = "Modelo es requerido")
    @Size(min = 2, max = 100, message = "Modelo debe tener entre 2 y 100 caracteres")
    private String model;
    
    @NotBlank(message = "Categoría es requerida")
    @Size(min = 2, max = 50, message = "Categoría debe tener entre 2 y 50 caracteres")
    private String category;
    
    @Size(max = 500, message = "Descripción no puede exceder 500 caracteres")
    private String description;
}
