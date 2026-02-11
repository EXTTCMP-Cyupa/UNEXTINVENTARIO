-- Crear usuarios de prueba
INSERT INTO app_user (email, full_name, password_hash, role, active) VALUES
('admin@fixme.com', 'Admin Usuario', '$2a$10$s2gJNSGM6V7a.dEt6zxMn.zPKtJ/N/CjYW3H6B0z5VmJLeLTOVZ1u', 'ADMIN', true),
('partner@fixme.com', 'Partner Usuario', '$2a$10$s2gJNSGM6V7a.dEt6zxMn.zPKtJ/N/CjYW3H6B0z5VmJLeLTOVZ1u', 'PARTNER', true),
('customer@fixme.com', 'Customer Usuario', '$2a$10$s2gJNSGM6V7a.dEt6zxMn.zPKtJ/N/CjYW3H6B0z5VmJLeLTOVZ1u', 'USER', true);

-- Crear productos
INSERT INTO product (name, brand, model, category, description, active) VALUES
('MacBook Pro', 'Apple', '13-inch M2', 'Laptops', 'MacBook Pro con procesador Apple M2', true),
('Dell Monitor', 'Dell', '27 UltraSharp', 'Monitores', 'Monitor Dell 27 pulgadas 4K', true),
('Kingston RAM', 'Kingston', 'DDR4 16GB', 'Repuestos', 'Memoria RAM DDR4 16GB', true);

-- Crear variantes de productos
INSERT INTO product_variant (product_id, sku, cost_price, priceb2b, pricepvp, stock, attributes, active) VALUES
(1, 'SKU-MBPRO-M2-001', 1500.00, 1450.00, 1899.00, 0, '{"ram": "8GB", "storage": "256GB", "color": "Space Gray"}', true),
(2, 'SKU-DELL-27-001', 200.00, 195.00, 299.00, 0, '{"resolution": "4K", "size": "27in", "refresh_rate": "60Hz"}', true),
(3, 'SKU-KINGSTON-DDR4-01', 30.00, 28.00, 45.00, 0, '{"capacity": "16GB", "type": "DDR4", "speed": "3200MHz"}', true);
