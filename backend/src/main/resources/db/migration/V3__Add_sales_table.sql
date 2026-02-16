-- Migración V3: Sistema de ventas anticipadas
-- Crear tabla de ventas para registrar ventas normales y anticipadas

CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_item(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150),
    customer_phone VARCHAR(15),
    customer_address TEXT,
    sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
    sale_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'EFECTIVO',
    notes TEXT,
    sale_type VARCHAR(50) NOT NULL DEFAULT 'NORMAL', -- NORMAL, ANTICIPADA
    status_at_sale VARCHAR(50) NOT NULL, -- EN_TRANSITO, DISPONIBLE
    delivery_date TIMESTAMP, -- Fecha de entrega física (si fue anticipada)
    profit DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_inventory_item ON sales(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_sales_type ON sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_sales_customer_email ON sales(customer_email);

COMMENT ON TABLE sales IS 'Registro de ventas (anticipadas en tránsito o normales en disponible)';
COMMENT ON COLUMN sales.sale_type IS 'NORMAL: venta en DISPONIBLE, ANTICIPADA: venta en EN_TRANSITO';
COMMENT ON COLUMN sales.delivery_date IS 'Fecha real de entrega física (si fue anticipada)';
COMMENT ON COLUMN sales.status_at_sale IS 'Estado del producto al momento de la venta';
