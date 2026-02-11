-- Insertar usuario ADMIN para pruebas
INSERT INTO app_user (email, full_name, password_hash, role, active, created_at)
VALUES (
    'admin@fixme.com',
    'Administrador FIXME',
    -- Password: AdminPassword123! (bcrypted)
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lm',
    'ADMIN',
    true,
    NOW()
);

-- Insertar usuario PARTNER
INSERT INTO app_user (email, full_name, password_hash, role, active, created_at)
VALUES (
    'partner@fixme.com',
    'Partner FIXME',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lm',
    'PARTNER',
    true,
    NOW()
);

-- Insertar usuario común
INSERT INTO app_user (email, full_name, password_hash, role, active, created_at)
VALUES (
    'customer@fixme.com',
    'Cliente FIXME',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lm',
    'USER',
    true,
    NOW()
);
