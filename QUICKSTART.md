# FIXME Ecosystem - Quick Start Guide

## Requisitos Previos
- Docker & Docker Compose
- Java 17+
- Maven 3.6+
- Node.js 18+ & npm

## 🚀 Inicio Rápido (5 minutos)

### 1. Levantar PostgreSQL
```bash
cd infra
docker-compose up -d
```

### 2. Backend - Spring Boot
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend ejecutándose: http://localhost:8080/api

### 3. Frontend - Next.js (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend ejecutándose: http://localhost:3000

## 📊 Crear datos de prueba

```bash
# Acceder a PostgreSQL
docker exec -it fixme-postgres psql -U fixme_admin -d fixme_ecosystem

# Ejecutar en la terminal PostgreSQL:
```

```sql
-- Crear usuario admin
INSERT INTO fixme.user (email, full_name, password_hash, role, active) 
VALUES ('admin@fixme.com', 'Admin Usuario', '$2a$10$s2gJNSGM6V7a.dEt6zxMn.zPKtJ/N/CjYW3H6B0z5VmJLeLTOVZ1u', 'ADMIN', true);

-- Crear usuario partner
INSERT INTO fixme.user (email, full_name, password_hash, role, active) 
VALUES ('partner@fixme.com', 'Partner Usuario', '$2a$10$s2gJNSGM6V7a.dEt6zxMn.zPKtJ/N/CjYW3H6B0z5VmJLeLTOVZ1u', 'PARTNER', true);

-- Crear producto base
INSERT INTO fixme.product (name, brand, model, category, description, active) 
VALUES ('MacBook Pro', 'Apple', '13-inch M2', 'Laptops', 'MacBook Pro con procesador Apple M2', true);

-- Crear variante de producto
INSERT INTO fixme.product_variant 
(product_id, sku, cost_price, price_b2b, price_pvp, stock, attributes, active) 
VALUES (
  1, 
  'SKU-MBPRO-M2-001', 
  1500.00, 
  1450.00, 
  1899.00, 
  0, 
  '{"ram": "8GB", "storage": "256GB", "color": "Space Gray"}', 
  true
);

-- Crear otro producto
INSERT INTO fixme.product (name, brand, model, category, description, active) 
VALUES ('Dell Monitor', 'Dell', '27 UltraSharp', 'Monitores', 'Monitor Dell 27 pulgadas 4K', true);

INSERT INTO fixme.product_variant 
(product_id, sku, cost_price, price_b2b, price_pvp, stock, attributes, active) 
VALUES (
  2, 
  'SKU-DELL-27-001', 
  200.00, 
  195.00, 
  299.00, 
  0, 
  '{"resolution": "4K", "size": "27in", "refresh_rate": "60Hz"}', 
  true
);
```

## 🔐 Credenciales de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@fixme.com | password | ADMIN |
| partner@fixme.com | password | PARTNER |

> **Nota**: Las contraseñas anteriores son hashes BCrypt de "password". Para producción, generar hashes seguros.

## 🧪 Probar Importación

1. Login como ADMIN en http://localhost:3000/login
2. Ir a http://localhost:3000/imports
3. Llenar el formulario:
   - Proveedor: "TechWholesale"
   - Flete: 500
   - Aduanas: 300
   - Extras: 200
   - Ítem 1: SKU-MBPRO-M2-001, Cost: 1500, Qty: 10
   - Ítem 2: SKU-DELL-27-001, Cost: 200, Qty: 20
4. Observar el cálculo en tiempo real del costo proyectado
5. Procesar importación

## 🧬 Probar Catálogos

- **Público**: http://localhost:3000/catalog (sin login)
- **B2B**: http://localhost:3000/catalog (con login como PARTNER)

Verás precios diferentes según el rol.

## 🔎 Consultar Garantía

1. Ir a http://localhost:3000/warranty
2. Ingresar número de serie: ABC123 (si fue importado previamente)
3. Ver historial completo

## 🛠️ Debugging

### Logs Backend
```bash
# En la terminal donde corre Spring Boot
# O checking logs en docker
docker logs -f fixme-postgres
```

### Network Debug
```bash
# Verificar que las puertos estén disponibles
# Windows PowerShell
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :8080
lsof -i :3000
lsof -i :5432
```

### Database Connection
```bash
docker exec -it fixme-postgres psql -U fixme_admin -d fixme_ecosystem
```

```sql
-- Ver datos importados
SELECT * FROM fixme.import;
SELECT * FROM fixme.product_variant;
SELECT * FROM fixme.inventory_item;
```

## 📖 Ver Documentación Completa

Consulta [README.md](README.md) para:
- Arquitectura detallada
- Explicación de la lógica de prorrateo
- Esquema de datos completo
- API Reference
- Roadmap

## 🚨 Problemas Comunes

**Error: "Cannot connect to database"**
- Verificar que Docker está corriendo: `docker ps`
- Reiniciar: `docker-compose restart`

**Error: "Port 8080 already in use"**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Frontend no conecta al Backend**
- Verificar NEXT_PUBLIC_API_URL en `.env.local` o `next.config.js`
- Revisar CORS en `SecurityConfig.java`
- Checkear console del navegador (F12)

---

¡Sistema listo para usar! 🎉
