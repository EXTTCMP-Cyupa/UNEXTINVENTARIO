-- Migración SQL para agregar campo de dueño/inversor del producto
-- Permite identificar a quién corresponde pagar cuando el producto es vendido

ALTER TABLE inventory_item ADD COLUMN product_owner VARCHAR(100);

-- Crear índice para búsquedas por dueño
CREATE INDEX idx_inventory_product_owner ON inventory_item(product_owner);
