# Diagrama de Arquitectura - FIXME Ecosystem

## Componentes Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                      FIXME ECOSYSTEM                             │
│                    ERP + Marketplace v1.0                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Frontend)                        │
│                                                                   │
│  ┌────────────┬──────────────┬────────────┬─────────────┐       │
│  │  Landing   │   Catálogo   │ Importar   │  Garantía   │       │
│  │   Page     │   Pub/B2B    │ Mercadería │  History    │       │
│  └───────┬────┴──────┬───────┴────┬───────┴──────┬──────┘       │
│          │           │            │              │               │
│      (Zustand Store - AuthStore + UI State)                      │
│          │           │            │              │               │
│  ┌───────┴───────────┴────────────┴──────────────┴──────┐       │
│  │                                                       │       │
│  │  Next.js 14 + TypeScript + Tailwind + Shadcn/UI   │       │
│  │  (localhost:3000)                                 │       │
│  └─────────────────────────┬─────────────────────────┘       │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    axios HTTP + JWT Token
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT API (Backend)                      │
│                    (localhost:8080/api)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   REST Controllers                         │ │
│  │                                                            │ │
│  │  ┌──────────────┬──────────────┬────────────────────────┐ │ │
│  │  │ ProductCtrl  │ ImportCtrl   │ WarrantyCtrl AuthCtrl │ │ │
│  │  └──┬───────────┴──┬───────────┴────────┬──────────┬────┘ │ │
│  └─────┼──────────────┼────────────────────┼──────────┼───────┘ │
│        │              │                    │          │         │
│  ┌─────▼──────────────▼────────────────────▼──────────▼───────┐ │
│  │               Service Layer (Business Logic)              │ │
│  │                                                           │ │
│  │  ┌───────────────┐       ┌──────────────┐                │ │
│  │  │ ProductService│       │ImportService │  ← LÓGICA       │ │
│  │  │               │       │(Prorrateo)   │    PRINCIPAL    │ │
│  │  │ - getCatalog  │       │ - calcFactor │                │ │
│  │  │ - getVariant  │       │ - processImport              │ │
│  │  └─────┬─────────┘       └────┬─────────┘                │ │
│  └────────┼────────────────────────┼──────────────────────────┘ │
│           │                        │                            │
│  ┌────────▼────────────────────────▼──────────────────────────┐ │
│  │            Repository Layer (Data Access)                 │ │
│  │                                                           │ │
│  │  ┌──────────────────────────────────────────────────────┐│ │
│  │  │ ProductRepository | VariantRepository               ││ │
│  │  │ ImportRepository | InventoryRepository              ││ │
│  │  │ UserRepository                                       ││ │
│  │  └────────────────────┬─────────────────────────────────┘│ │
│  └─────────────────────────┼────────────────────────────────┘ │
│                            │                                 │
│                 Spring Data JPA (Hibernate 6)               │
│                            │                                 │
│  ┌────────────────────────┐┌┴───────────────────────────────┐│
│  │   Security Layer       ││  Aspect Oriented Programming  ││
│  │                        ││                               ││
│  │ - JWT Token Provider   ││ - Transactionality (@Trans)  ││
│  │ - Auth Filter          ││ - Logging / Monitoring       ││
│  │ - SecurityConfig       ││                               ││
│  └────────────────────────┘└───────────────────────────────┘│
│                                                               │
└──────────────────────────────────────────────────────────────────┘
                               │
                        PostgreSQL Driver
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PostgreSQL 15                               │
│                   (Port 5432 en Docker)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Schema: fixme                           │ │
│  │                                                            │ │
│  │  ┌──────────────┐       ┌───────────────────────────────┐ │ │
│  │  │   product    │       │   product_variant            │ │ │
│  │  ├──────────────┤       ├───────────────────────────────┤ │ │
│  │  │ id (PK)      │◀──────│ id (PK)                       │ │ │
│  │  │ name         │       │ product_id (FK)              │ │ │
│  │  │ brand        │       │ sku                           │ │ │
│  │  │ model        │       │ cost_price (FOB)              │ │ │
│  │  │ category     │       │ landed_cost (Calculado) ◄──┐ │ │ │
│  │  │ active       │       │ price_b2b                   │ │ │ │
│  │  └──────────────┘       │ price_pvp                   │ │ │ │
│  │                         │ stock                       │ │ │ │
│  │                         │ attributes (JSONB) ◄ DYNAMIC │ │ │ │
│  │                         └───────────────────────────────┘ │ │ │
│  │                                                            │ │ │
│  │  ┌───────────────────┐     ┌──────────────────────────┐ │ │ │
│  │  │   import          │     │  inventory_item        │ │ │ │
│  │  │ (Cabecera)        │     │ (Trazabilidad Unitaria)│ │ │ │
│  │  ├───────────────────┤     ├──────────────────────────┤ │ │ │
│  │  │ id (PK)           │     │ id (PK)                 │ │ │ │
│  │  │ provider          │     │ product_variant_id (FK) │ │ │ │
│  │  │ import_date       │     │ import_id (FK)          │ │ │ │
│  │  │ freight_cost      │     │ serial_number (UNIQUE) ◄│ │ │ │
│  │  │ customs_cost      │     │ internal_code (UNIQUE)  │ │ │ │
│  │  │ extras_cost       │     │ status                  │ │ │ │
│  │  │ total_fob_sum ●●  │ ◄───┤ sold_to_customer        │ │ │ │
│  │  │ proration_factor  │     │ sold_date               │ │ │ │
│  │  │ status            │     └──────────────────────────┘ │ │ │
│  │  └───────────────────┘                                    │ │ │
│  │         ▲                                                 │ │ │
│  │         │ (Cálculo aquí)                                 │ │ │
│  │         │ FactorProrrateo = Extras / TotalFOB            │ │ │
│  │         │ LandedCost = FOB × (1 + Factor)                │ │ │
│  │         │                                                │ │ │
│  │         └────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────┐                                     │ │
│  │  │      user        │                                     │ │
│  │  ├──────────────────┤                                     │ │
│  │  │ id (PK)          │                                     │ │
│  │  │ email (UNIQUE)   │                                     │ │
│  │  │ password_hash    │                                     │ │
│  │  │ role (USER/PARTNER/ADMIN) │                           │ │ │
│  │  │ active           │                                     │ │ │
│  │  └──────────────────┘                                     │ │ │
│  │                                                            │ │ │
│  └────────────────────────────────────────────────────────────┘ │ │
│                                                                  │ │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Docker Infrastructure                         │
│                     (docker-compose.yml)                         │
│                                                                   │
│  ┌─────────────────────┐     ┌─────────────────────────────┐    │
│  │ PostgreSQL Container│     │ Network: fixme_network      │    │
│  │  (Port 5432)        │◄────┤ Volumes: postgres_data      │    │
│  │  Image: postgres:15 │     │ Environment vars: ✓         │    │
│  └─────────────────────┘     └─────────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

```

---

## Flujo de Datos - Importación (PASO A PASO)

```
1. ADMIN ingresa datos en Frontend
   └─ Proveedor, Costos (Flete, Aduanas, Extras)
   └─ Ítems: SKU, Costo FOB, Cantidad, S/N

2. Frontend calcula en TIEMPO REAL
   └─ FactorProrrateo = (500 + 300 + 200) / TotalFOB
   └─ Muestra costo proyectado por unidad
   └─ User verifica antes de guardar

3. POST /api/imports/process con JWT + ADMIN role
   ├─ Backend recibe ImportRequestDTO
   ├─ Valida que todos los SKU existan en BD
   └─ Calcula TotalFOBSum

4. ImportService.processImport() - EL CEREBRO
   ├─ Calcula FactorProrrateo (BigDecimal × 10 decimales)
   ├─ Guarda registro Import (status=PENDING)
   ├─ Para cada Ítem:
   │  ├─ LandedCost = CostPrice × (1 + FactorProrrateo)
   │  ├─ Actualiza ProductVariant.landedCost
   │  └─ Crea InventoryItem para cada S/N
   └─ Marca Import.status = PROCESSED

5. Response al Frontend
   └─ Muestra "Importación procesada exitosamente"

6. Datos persistidos en PostgreSQL
   ├─ import: { totalFobSum, prorationFactor }
   ├─ product_variant: { landedCost actualizado }
   └─ inventory_item: { trazabilidad unitaria }

```

---

## Flujo de Consulta de Garantía

```
1. Usuario ingresa S/N en http://localhost:3000/warranty
   
2. GET /api/warranty/{serialNumber}
   
3. WarrantyController busca en InventoryItemRepository
   ├─ Si no existe → 404 NotFound
   └─ Si existe:
   
4. ImportService.getWarrantyInfo retorna:
   ├─ Serial Number
   ├─ Producto y SKU
   ├─ Proveedor y Fecha de Importación ◄ Importancia
   ├─ Cliente y Fecha de Venta ◄ Garantía
   └─ Costo Real (LandedCost)
   
5. Frontend muestra información completa
```

---

## Stack Tecnológico por Capa

```
┌─────────────────────────────────────────────────────┐
│              PRESENTACIÓN (UI/UX)                   │
├─────────────────────────────────────────────────────┤
│                   Next.js 14                        │
│      TypeScript + React 18 + Tailwind CSS           │
│    Shadcn/UI Components + Zustand State Store       │
└─────────────────────────────────────────────────────┘
                         │
                    Axios HTTP
                    JWT Bearer
                         │
┌─────────────────────────────────────────────────────┐
│        LÓGICA DE NEGOCIO (Application)              │
├─────────────────────────────────────────────────────┤
│             Spring Boot 3.2.2                       │
│     Java 17 + Spring MVC + Spring Data              │
│  Service Layer con Transacciones (@Transactional)  │
└─────────────────────────────────────────────────────┘
                         │
                  Spring JPA API
                         │
┌─────────────────────────────────────────────────────┐
│          PERSISTENCIA (Data Access)                 │
├─────────────────────────────────────────────────────┤
│          Hibernate 6 + JPA 3.1                      │
│   Lombok (Builders) + Validation (jakarta)          │
│  JsonType para JSONB + BigDecimal para Precisión   │
└─────────────────────────────────────────────────────┘
                         │
                  PostgreSQL Driver
                         │
┌─────────────────────────────────────────────────────┐
│             BASE DE DATOS                           │
├─────────────────────────────────────────────────────┤
│           PostgreSQL 15                             │
│    Schema: fixme + Extensiones (UUID, JSONB)        │
│  Tipos: Integer, BigDecimal, String, JSONB, Timestamp│
└─────────────────────────────────────────────────────┘

```

---

## Seguridad - JWT Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│  User Login - POST /api/auth/login                   │
│  Body: { email, password }                           │
└──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────┐
│  AuthController.login()                              │
│  - Busca usuario en BD                               │
│  - Valida contraseña (BCrypt)                        │
└──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────┐
│  JwtTokenProvider.generateToken()                    │
│  Token = JWT({ email, role, exp }, SECRET)          │
│  Algorithm: HS512 (HMAC)                             │
└──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────┐
│  Response: { token, email, role }                    │
│  Frontend almacena en localStorage                   │
└──────────────────────────────────────────────────────┘

  Siguientes Requests:
  
┌──────────────────────────────────────────────────────┐
│  Headers: {                                          │
│    Authorization: "Bearer eyJhbGciOiJIUzUxMiIs..."  │
│  }                                                   │
└──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────┐
│  JwtAuthenticationFilter.doFilterInternal()          │
│  - Extrae JWT del header                             │
│  - Valida firma con SECRET                           │
│  - Extrae email y role                               │
└──────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────┐
│  SecurityContext.setAuthentication()                 │
│  Continúa con @PreAuthorize("hasRole()")             │
└──────────────────────────────────────────────────────┘

```

---

## Precisión Matemática - BigDecimal Config

```
┌─────────────────────────────────────────────────────┐
│  Cálculo del Factor de Prorrateo                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  totalAdditionalCosts = 500 + 300 + 200 = 1000     │
│  totalFobSum = 10000 + 4000 = 14000                │
│                                                     │
│  Fórmula en código:                                 │
│  prorationFactor = totalAdditionalCosts             │
│                    .divide(totalFobSum, 10,         │
│                    RoundingMode.HALF_UP)            │
│                                                     │
│  Resultado: 0.0714285714 (10 decimales)             │
│                                                     │
│  LandedCost (Laptop):                               │
│  1000 * (1 + 0.0714285714) = 1071.43 (2 decimales) │
│                                                     │
│  LandedCost (Monitor):                              │
│  200 * (1 + 0.0714285714) = 214.29 (2 decimales)   │
│                                                     │
└─────────────────────────────────────────────────────┘

```

