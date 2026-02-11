# FIXME ECOSYSTEM - ERP + Marketplace para Tecnología

**Arquitecto de Software**: Versión 1.0
**Stack**: Spring Boot 3.x + Next.js 14+ + PostgreSQL 15

---

## 📋 Descripción del Proyecto

**FIXME ECOSYSTEM** es una solución integral para la gestión de inventario y catálogo de productos tecnológicos(Laptops, Monitores, Repuestos). Implementa:

✅ **ERP Backend**: Spring Boot 3.x con arquitectura empresarial  
✅ **Frontend Moderno**: Next.js 14+ con TypeScript y Tailwind CSS  
✅ **Base de Datos Robusta**: PostgreSQL 15 con JSONB  
✅ **Trazabilidad Completa**: Número de serie y código interno por unidad  
✅ **Cálculo Automático**: Factor de prorrateo para costos reales  
✅ **Seguridad JWT**: Autenticación y autorización granular  

---

## 🏗️ Estructura del Proyecto

```
UNEXTINVENTARIO/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/fixme/ecosystem/
│   │   ├── entity/                  # JPA Entities
│   │   │   ├── Product.java
│   │   │   ├── ProductVariant.java
│   │   │   ├── Import.java
│   │   │   ├── InventoryItem.java
│   │   │   └── User.java
│   │   ├── repository/              # JPA Repositories
│   │   ├── service/                 # Business Logic
│   │   │   ├── ImportService.java   # LA LÓGICA PRINCIPAL
│   │   │   └── ProductService.java
│   │   ├── controller/              # REST Endpoints
│   │   │   ├── ProductController.java (Catálogos)
│   │   │   ├── ImportController.java  (Procesamiento)
│   │   │   ├── WarrantyController.java (Garantía)
│   │   │   └── AuthController.java    (Autenticación)
│   │   ├── security/                # JWT & Security Config
│   │   ├── dto/                     # DTOs para API
│   │   └── FixmeEcosystemApplication.java
│   ├── src/main/resources/
│   │   └── application.yml          # Configuración Spring
│   └── pom.xml                      # Maven Dependencies
│
├── frontend/                         # Next.js Application
│   ├── src/app/                     # Pages (App Router)
│   │   ├── page.tsx                 # Landing Page
│   │   ├── catalog/                 # Catálogo Público/B2B
│   │   ├── imports/                 # Ingreso de Mercadería
│   │   ├── warranty/                # Consulta de Garantía
│   │   ├── login/                   # Autenticación
│   │   ├── register/                # Registro
│   │   ├── layout.tsx               # Root Layout
│   │   └── globals.css
│   ├── src/components/              # Componentes React
│   │   ├── Header.tsx
│   │   ├── ImportForm.tsx           # FORMULARIO DINÁMICO
│   │   └── CatalogView.tsx
│   ├── src/services/                # API Client Services
│   │   └── api.ts
│   ├── src/store/                   # Zustand State Management
│   │   └── authStore.ts
│   ├── src/lib/                     # Utilidades
│   │   └── apiClient.ts
│   ├── src/types/                   # TypeScript Interfaces
│   │   └── index.ts
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── infra/                           # Docker & Infrastructure
│   ├── docker-compose.yml           # PostgreSQL 15
│   └── init-db.sql                  # Database Init Script
│
└── README.md (este archivo)

```

---

## 🚀 Instrucciones de Setup

### PASO 1: Infraestructura (Docker)

```bash
cd infra
docker-compose up -d

# Verificar que PostgreSQL esté corriendo
docker ps | grep fixme-postgres
```

**Credenciales por defecto:**
- Database: `fixme_ecosystem`
- User: `fixme_admin`
- Password: `fixme_secure_pass_change_me`
- Port: `5432`

> ⚠️ **IMPORTANTE**: Cambiar contraseña en producción

---

### PASO 2: Backend Spring Boot

```bash
cd backend

# Compilar
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run
```

**Backend accesible en:** `http://localhost:8080/api`

#### Antes de ejecutar - Crear datos de prueba:

1. Crear un usuario ADMIN en la BD:
```sql
-- Dentro del contenedor PostgreSQL
INSERT INTO fixme.user (email, full_name, password_hash, role, active) 
VALUES ('admin@fixme.com', 'Admin User', '$2a$10$...', 'ADMIN', true);
```

2. Crear un producto y variante:
```sql
INSERT INTO fixme.product (name, brand, model, category, active) 
VALUES ('MacBook Pro', 'Apple', 'M2', 'Laptops', true);

INSERT INTO fixme.product_variant 
(product_id, sku, cost_price, price_b2b, price_pvp, stock, active) 
VALUES (1, 'SKU-MBPRO-M2-001', 1500.00, 1450.00, 1899.00, 0, true);
```

---

### PASO 3: Frontend Next.js

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Production
npm run build
npm run start
```

**Frontend accesible en:** `http://localhost:3000`

---

## 🧠 LA LÓGICA PRINCIPAL: Factor de Prorrateo

### ¿Qué es?

Cuando importas mercadería, los costos NO son solo el FOB. Incluyen:
- **Flete** (Freight)
- **Aduanas** (Customs)
- **Extras** (Otros gastos)

Estos costos deben **prorratearse** entre los productos importados.

### Fórmula Matemática

$$\text{FactorProrrateo} = \frac{\text{FreightCost + CustomsCost + ExtrasCost}}{\text{TotalFOBSum}}$$

$$\text{LandedCost} = \text{UnitFOBCost} \times (1 + \text{FactorProrrateo})$$

### Ejemplo Práctico

**Importación:**
- Proveedor: "TechWholesale"
- Flete: $500
- Aduanas: $300
- Extras: $200
- **Total adicional: $1,000**

**Ítems importados:**
| SKU | Cantidad | FOB Unit | Subtotal |
|-----|----------|----------|----------|
| SKU-LAPTOP-001 | 10 | $1000 | $10,000 |
| SKU-MONITOR-001 | 20 | $200 | $4,000 |
| **Total FOB Sum** | | | **$14,000** |

**Cálculo:**

```
FactorProrrateo = 1,000 / 14,000 = 0.0714 (7.14%)

LandedCost (Laptop) = 1000 × (1 + 0.0714) = $1,071.40
LandedCost (Monitor) = 200 × (1 + 0.0714) = $214.29
```

### Implementación en el código

Ver: [ImportService.java](backend/src/main/java/com/fixme/ecosystem/service/ImportService.java#L47-L73)

```java
// Calcular Factor de Prorrateo
BigDecimal prorationFactor = totalAdditionalCosts.divide(totalFobSum, 10, RoundingMode.HALF_UP);

// Aplicar a cada variante
BigDecimal landedCost = item.getCostPrice()
    .multiply(BigDecimal.ONE.add(prorationFactor))
    .setScale(2, RoundingMode.HALF_UP);
```

---

## 📊 Esquema de Datos

### Entidades Principales

#### **Product** (Base genérica)
```
├─ id (PK)
├─ name: String
├─ brand: String
├─ model: String
├─ category: String
└─ active: Boolean
```

#### **ProductVariant** (SKU real con atributos JSONB)
```
├─ id (PK)
├─ product_id (FK)
├─ sku: String (UNIQUE)
├─ costPrice: BigDecimal (FOB)
├─ landedCost: BigDecimal (Costo Real calculado)
├─ priceB2B: BigDecimal (Precio de socio)
├─ pricePVP: BigDecimal (Precio público)
├─ stock: Integer
├─ attributes: JSONB ← RAM, CPU, Colors, etc.
└─ active: Boolean
```

#### **Import** (Cabecera)
```
├─ id (PK)
├─ provider: String
├─ importDate: LocalDateTime
├─ freightCost: BigDecimal
├─ customsCost: BigDecimal
├─ extrasCost: BigDecimal
├─ totalFobSum: BigDecimal (Calculado)
├─ prorationFactor: BigDecimal (Calculado)
└─ status: String (PENDING, PROCESSED, CANCELLED)
```

#### **InventoryItem** (Trazabilidad unitaria)
```
├─ id (PK)
├─ product_variant_id (FK)
├─ import_id (FK)
├─ serialNumber: String (UNIQUE) ← ¡Crítico!
├─ internalCode: String (UNIQUE)
├─ status: String (AVAILABLE, SOLD, DEFECTIVE)
├─ soldToCustomer: String
├─ soldDate: LocalDateTime
└─ createdAt: LocalDateTime
```

#### **User** (Autenticación)
```
├─ id (PK)
├─ email: String (UNIQUE)
├─ passwordHash: String
├─ role: String (USER, PARTNER, ADMIN)
└─ active: Boolean
```

---

## 🔒 Autenticación y Autorización

### Flujo JWT

```
1. Usuario hace POST /api/auth/login
   ↓
2. Backend valida credenciales
   ↓
3. Genera JWT con claims: email + role
   ↓
4. Frontend almacena en localStorage
   ↓
5. Siguientes requests incluyen: Authorization: Bearer <JWT>
   ↓
6. JwtAuthenticationFilter valida en cada request
```

### Roles y Permisos

| Endpoint | GET | POST | Rol Requerido |
|----------|-----|------|---------------|
| `/products/public` | ✅ | ❌ | Todos |
| `/products/b2b` | ✅ | ❌ | PARTNER, ADMIN |
| `/imports/process` | ❌ | ✅ | ADMIN |
| `/warranty/{sn}` | ✅ | ❌ | Todos |

---

## 📱 Frontend - Páginas Principales

### 1. **Página de Inicio** (`/`)
- Landing page con opciones principales
- Links a Catálogo, Importaciones, Garantía

### 2. **Catálogo** (`/catalog`)
- Muestra **Catálogo Público** (PVP) sin autenticación
- Muestra **Catálogo B2B** (precios de socio) si user es PARTNER
- Cálculo en tiempo real del `landedCost`
- Visualización de atributos JSONB

### 3. **Importaciones** (`/imports`) - POST-ADMIN
- **Formulario dinámico** para agregar ítems
- Entrada de: SKU, costo FOB, cantidad
- **Cálculo REAL-TIME** del factor de prorrateo
- Antes de guardar: muestra costo unitario proyectado
- Soporte para números de serie por unidad

### 4. **Consulta de Garantía** (`/warranty`)
- Buscar por número de serie
- Devuelve:
  - Fecha de importación
  - Proveedor
  - Fecha de venta
  - Cliente (si aplica)
  - Estado actual del producto

---

## 📡 API Endpoints

### Productos

```
GET  /api/products/public          → Catálogo público (PVP)
GET  /api/products/b2b              → Catálogo B2B (JWT + PARTNER role)
GET  /api/products/{sku}            → Detalles de variante
```

### Importaciones

```
POST /api/imports/process           → Procesar nueva importación (JWT + ADMIN)
```

**Request Body:**
```json
{
  "provider": "TechWholesale",
  "freightCost": 500,
  "customsCost": 300,
  "extrasCost": 200,
  "items": [
    {
      "sku": "SKU-LAPTOP-001",
      "costPrice": 1000,
      "quantity": 10,
      "serialNumbers": [
        {"serialNumber": "ABC123", "internalCode": "INT001"},
        {"serialNumber": "ABC124", "internalCode": "INT002"}
      ]
    }
  ]
}
```

### Garantía

```
GET  /api/warranty/{serialNumber}  → Historial completo
```

**Response:**
```json
{
  "serialNumber": "ABC123",
  "internalCode": "INT001",
  "productName": "MacBook Pro M2",
  "productSku": "SKU-LAPTOP-001",
  "importProvider": "TechWholesale",
  "importDate": "2024-01-15T10:30:00",
  "saleDate": "2024-01-20T14:22:00",
  "customerName": "Juan Pérez",
  "unitPrice": 1071.40,
  "status": "SOLD"
}
```

### Autenticación

```
POST /api/auth/login         → { email, password } → { token, role }
POST /api/auth/register      → { email, password, fullName }
```

---

## 🛠️ Configuración Importante

### Backend - application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/fixme_ecosystem
    username: fixme_admin
    password: fixme_secure_pass_change_me
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQL15Dialect
    hibernate:
      ddl-auto: validate  # ← En prod, NO auto-crear

jwt:
  secret: fixme-super-secret-key-change-in-production
  expiration: 86400000  # 24 horas
```

### Frontend - Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🔧 Development & Testing

### Maven Build
```bash
cd backend
mvn clean install
mvn test
```

### Next.js Development
```bash
cd frontend
npm install
npm run dev
npm run lint
```

### Docker Logs
```bash
docker logs fixme-postgres
docker-compose logs -f
```

---

## 📚 Tecnologías Utilizadas

### Backend
- **Spring Boot 3.2.2** - Framework web
- **Spring Data JPA** - ORM
- **Spring Security** - Autenticación
- **JWT (jjwt 0.12.3)** - Token management
- **PostgreSQL + Hibernate 6** - Base de datos
- **Lombok** - Boilerplate reduction
- **Hypersistence Utils** - JSONB support

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hooks** - Manejo de estado local

### Infraestructura
- **PostgreSQL 15** - Database
- **Docker & Compose** - Containerización
- **Maven** - Build tool (Backend)
- **npm/node** - Package manager (Frontend)

---

## ⚠️ Notas Importantes

1. **JSONB en ProductVariant**: Los atributos dinámicos (RAM, CPU, etc.) se almacenan como JSONB en PostgreSQL. Consultar [ProductVariant.java](backend/src/main/java/com/fixme/ecosystem/entity/ProductVariant.java#L30)

2. **Números de Serie**: Cada unidad física tiene serialNumber (del fabricante) e internalCode (nuestro control). **Crítico para garantía**.

3. **Factor de Prorrateo**: Se calcula UNA SOLA VEZ por importación. Es un BigDecimal a 10 dígitos de precisión.

4. **JWT + localStorage**: El frontend almacena el token en localStorage. Implementar refresh tokens en producción.

5. **CORS**: Configurado para localhost:3000 y localhost:3001. Cambiar en `SecurityConfig.java` para producción.

---

## 🚀 Próximos Pasos (Roadmap)

- [ ] Integración con Stripe/PayPal para pagos
- [ ] Sistema de órdenes y carrito de compras
- [ ] Reportes avanzados (Excel, PDF)
- [ ] Notificaciones por email
- [ ] Dashboard de analytics
- [ ] Soporte multi-tenant
- [ ] Cache con Redis
- [ ] Testing automatizado (Jest, JUnit5)

---

## 📞 Soporte

Para problemas o preguntas sobre la arquitectura:
- Revisar logs: `docker-compose logs` / `spring-boot console`
- Verificar conexión DB: `psql -h localhost -U fixme_admin -d fixme_ecosystem`
- Inspeccionar JWT: jwt.io

---

**Creado con ❤️ por Equipo de Arquitectura FIXME Ecosystem**
