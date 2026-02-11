# Endpoints para Gestión de Productos

## Descripción General
Los endpoints de productos permiten a los usuarios ADMIN crear y gestionar el catálogo de productos.

---

## 1. Crear un Producto Nuevo
**POST** `/api/products`

### Autenticación
✅ Requerido: **ADMIN**

### Request Body
```json
{
  "name": "Laptop ProBook 15.6\"",
  "brand": "HP",
  "model": "ProBook 450 G9",
  "category": "Laptops",
  "description": "Laptop empresarial con procesador Intel Core i7"
}
```

### Campos
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|-----------|
| `name` | String | ✅ Sí | 3-100 caracteres |
| `brand` | String | ✅ Sí | 2-50 caracteres |
| `model` | String | ✅ Sí | 2-100 caracteres |
| `category` | String | ✅ Sí | 2-50 caracteres |
| `description` | String | ❌ No | Máx 500 caracteres |

### Response (201 Created)
```json
{
  "id": 1,
  "name": "Laptop ProBook 15.6\"",
  "brand": "HP",
  "model": "ProBook 450 G9",
  "category": "Laptops",
  "description": "Laptop empresarial con procesador Intel Core i7",
  "active": true,
  "createdAt": "2026-02-10T10:30:00Z",
  "updatedAt": "2026-02-10T10:30:00Z"
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor Dell U2723DE",
    "brand": "Dell",
    "model": "U2723DE",
    "category": "Monitores",
    "description": "Monitor 4K IPS 27 pulgadas"
  }'
```

---

## 2. Crear una Variante de Producto (SKU)
**POST** `/api/products/variants`

### Autenticación
✅ Requerido: **ADMIN**

### Request Body
```json
{
  "productId": 1,
  "sku": "HP-PB450-I7-16GB-512SSD",
  "costPrice": 450.00,
  "priceB2B": 550.00,
  "pricePVP": 650.00,
  "attributes": {
    "processor": "Intel Core i7-12700H",
    "ram": "16GB DDR4",
    "storage": "512GB SSD NVMe",
    "display": "15.6 FHD IPS",
    "battery": "47Wh"
  }
}
```

### Campos
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|-----------|
| `productId` | Long | ✅ Sí | Debe existir en BD |
| `sku` | String | ✅ Sí | 3-50 caracteres, único |
| `costPrice` | Decimal | ✅ Sí | > 0 (Precio FOB) |
| `priceB2B` | Decimal | ✅ Sí | > costPrice |
| `pricePVP` | Decimal | ✅ Sí | > priceB2B |
| `attributes` | JSON | ❌ No | Objeto libre con especificaciones |

### Validaciones de Precio
⚠️ **Importante**: Los precios se validan en cascada:
- `pricePVP > priceB2B`
- `priceB2B > costPrice`
- Si no se cumplen, la API retorna error 400

### Response (201 Created)
```json
{
  "id": 5,
  "product": {
    "id": 1,
    "name": "Laptop ProBook 15.6\"",
    "brand": "HP",
    "model": "ProBook 450 G9"
  },
  "sku": "HP-PB450-I7-16GB-512SSD",
  "costPrice": 450.00,
  "landedCost": 450.00,
  "priceB2B": 550.00,
  "pricePVP": 650.00,
  "stock": 0,
  "attributes": {
    "processor": "Intel Core i7-12700H",
    "ram": "16GB DDR4",
    "storage": "512GB SSD NVMe",
    "display": "15.6 FHD IPS",
    "battery": "47Wh"
  },
  "active": true,
  "createdAt": "2026-02-10T10:35:00Z",
  "updatedAt": "2026-02-10T10:35:00Z"
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:8080/api/products/variants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "sku": "HP-PB450-I7-16GB-512SSD",
    "costPrice": 450.00,
    "priceB2B": 550.00,
    "pricePVP": 650.00,
    "attributes": {
      "processor": "Intel Core i7-12700H",
      "ram": "16GB DDR4",
      "storage": "512GB SSD NVMe"
    }
  }'
```

---

## 3. Obtener Catálogo Público
**GET** `/api/products/public`

### Autenticación
❌ No requerida (público)

### Response
```json
[
  {
    "id": 5,
    "productName": "Laptop ProBook 15.6\"",
    "sku": "HP-PB450-I7-16GB-512SSD",
    "costPrice": 450.00,
    "landedCost": 450.00,
    "priceB2B": 550.00,
    "pricePVP": 650.00,
    "stock": 0,
    "attributes": {...},
    "active": true
  }
]
```

---

## 4. Obtener Catálogo B2B
**GET** `/api/products/b2b`

### Autenticación
✅ Requerido: **PARTNER** o **ADMIN**

### Response
Mismo formato que catálogo público, pero con visibilidad a precios B2B

---

## 5. Obtener Variante por SKU
**GET** `/api/products/{sku}`

### Autenticación
❌ No requerida

### Parámetros
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sku` | String (path) | Código SKU de la variante |

### Response
```json
{
  "id": 5,
  "productName": "Laptop ProBook 15.6\"",
  "sku": "HP-PB450-I7-16GB-512SSD",
  "costPrice": 450.00,
  "landedCost": 450.00,
  "priceB2B": 550.00,
  "pricePVP": 650.00,
  "stock": 0,
  "attributes": {...},
  "active": true
}
```

---

## Flujo de Trabajo Recomendado para Agregar Productos

### Paso 1: Crear el Producto Base
```bash
# Crear un laptop
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Asus VivoBook 15",
    "brand": "Asus",
    "model": "F515EA",
    "category": "Laptops"
  }'
# Guardar el ID retornado (ej: "id": 2)
```

### Paso 2: Crear Variantes (SKUs) para el Producto
```bash
# Variante 1: Procesador Intel i5
curl -X POST http://localhost:8080/api/products/variants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 2,
    "sku": "ASUS-VB15-I5-8GB-256SSD",
    "costPrice": 380.00,
    "priceB2B": 460.00,
    "pricePVP": 550.00,
    "attributes": {"processor": "Intel Core i5", "ram": "8GB", "storage": "256GB SSD"}
  }'

# Variante 2: Procesador Intel i7
curl -X POST http://localhost:8080/api/products/variants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 2,
    "sku": "ASUS-VB15-I7-16GB-512SSD",
    "costPrice": 520.00,
    "priceB2B": 630.00,
    "pricePVP": 750.00,
    "attributes": {"processor": "Intel Core i7", "ram": "16GB", "storage": "512GB SSD"}
  }'
```

### Paso 3: Verificar en Catálogo Público
```bash
# Ver todas las variantes públicas
curl http://localhost:8080/api/products/public

# Ver variante específica
curl http://localhost:8080/api/products/ASUS-VB15-I7-16GB-512SSD
```

### Paso 4: Importar Stock (Luego aplicar prorrateo)
```bash
# POST /api/imports/process
# (Se describe en documento separado: IMPORTS.md)
```

---

## Códigos de Error

| Código | Error | Causa |
|--------|-------|-------|
| 400 | Bad Request | Validación fallida (ej: SKU que ya existe, precios inválidos) |
| 401 | Unauthorized | Token JWT ausente o expirado |
| 403 | Forbidden | Rol insuficiente (requiere ADMIN) |
| 404 | Not Found | Producto o SKU no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Notas de Seguridad

⚠️ **Solo ADMIN puede crear productos**
- Todos los endpoints POST están protegidos con `@PreAuthorize("hasRole('ADMIN')")`
- Incluya un token JWT válido de usuario ADMIN en header `Authorization: Bearer TOKEN`

⚠️ **El stock se gestiona mediante importaciones**
- Al crear una variante, el stock comienza en 0
- El stock se incrementa cuando se procesa una importación
- No hay endpoint directo para modificar stock (se hace solo mediante imports)

⚠️ **Los precios incluyen validaciones**
- PVP (venta al público) debe ser mayor a precio B2B
- Precio B2B debe ser mayor a costo FOB
- Si son iguales o menores, la API rechaza la operación

---

## Próximos Pasos

1. **Endpoint para actualizar productos** (PATCH /api/products/{id})
2. **Endpoint para desactivar variantes** (DELETE /api/products/{id})
3. **Panel de administración frontend** para crear productos sin cURL
4. **Importación en lote** de productos desde CSV/XLSX
