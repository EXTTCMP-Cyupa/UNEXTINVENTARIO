-- Migración SQL para implementar el flujo de 5 estados de importación
-- Añade columnas al modelo InventoryItem para soportar:
-- 1. Estado principal: COMPRADO, PREPARACION_ENVIO, EN_TRANSITO, STOCK_LOCAL, VENDIDO
-- 2. Sub-estado de logística: ENVIADO_AL_PAIS, EN_ADUANA, EN_CAMINO_AL_LOCAL
-- 3. Sistema de reservas con anticipo
-- 4. Desglose de costos (flete, aduanas separados)
-- 5. Seguimiento de precios y ganancias

-- Agregar columnas de sub-estado de logística
ALTER TABLE inventory_item ADD COLUMN logistics_stage VARCHAR(50);

-- Agregar columnas de sistema de reservas
ALTER TABLE inventory_item ADD COLUMN is_reserved BOOLEAN DEFAULT false;
ALTER TABLE inventory_item ADD COLUMN reserved_customer VARCHAR(255);
ALTER TABLE inventory_item ADD COLUMN reserved_date TIMESTAMP;
ALTER TABLE inventory_item ADD COLUMN reserved_price DECIMAL(19, 2);
ALTER TABLE inventory_item ADD COLUMN reservation_amount DECIMAL(19, 2);

-- Agregar columnas de costos desglosados
ALTER TABLE inventory_item ADD COLUMN cost_shipping DECIMAL(19, 2);
ALTER TABLE inventory_item ADD COLUMN cost_customs DECIMAL(19, 2);

-- Agregar columnas de precios de referencia y proveedor
ALTER TABLE inventory_item ADD COLUMN price_referential DECIMAL(19, 2);
ALTER TABLE inventory_item ADD COLUMN price_provider DECIMAL(19, 2);

-- Agregar columna de ganancia/utilidad (calculada: sale_price - landed_cost)
ALTER TABLE inventory_item ADD COLUMN profit DECIMAL(19, 2);

-- Agregar fecha de venta final
ALTER TABLE inventory_item ADD COLUMN sold_date TIMESTAMP;
ALTER TABLE inventory_item ADD COLUMN sold_to_customer VARCHAR(255);

-- Crear índices para mejorar performance en búsquedas comunes
CREATE INDEX idx_inventory_status ON inventory_item(status);
CREATE INDEX idx_inventory_logistics_stage ON inventory_item(logistics_stage);
CREATE INDEX idx_inventory_is_reserved ON inventory_item(is_reserved);
CREATE INDEX idx_inventory_sold_date ON inventory_item(sold_date);
