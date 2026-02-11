# Script para crear productos usando los nuevos endpoints
# PowerShell version

$API_URL = "http://localhost:8080/api"

Write-Host "=== FIXME ECOSYSTEM - Product Creation Demo ===" -ForegroundColor Blue
Write-Host ""

# 1. Registrar usuario ADMIN
Write-Host "1. Registrando usuario ADMIN..." -ForegroundColor Yellow
$registerPayload = @{
    email = "admin@fixme.com"
    password = "AdminPassword123!"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerPayload `
        -UseBasicParsing
    
    Write-Host "Usuario creado: " -ForegroundColor Green
    $registerResponse.Content | ConvertFrom-Json | Format-Table -AutoSize
} catch {
    Write-Host "Usuario probablemente ya existe: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

Write-Host ""

# 2. Login para obtener token
Write-Host "2. Obteniendo token JWT..." -ForegroundColor Yellow
$loginPayload = @{
    email = "admin@fixme.com"
    password = "password"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginPayload `
    -UseBasicParsing

$loginData = $loginResponse.Content | ConvertFrom-Json
$TOKEN = $loginData.token

if ($null -eq $TOKEN) {
    Write-Host "Error: No se pudo obtener el token" -ForegroundColor Red
    exit 1
}

Write-Host "Token obtenido: $($TOKEN.Substring(0,20))..." -ForegroundColor Green
Write-Host ""

# 3. Crear producto 1: Laptop HP
Write-Host "3. Creando producto: Laptop HP ProBook..." -ForegroundColor Yellow
$product1Payload = @{
    name = "Laptop ProBook 15.6`""
    brand = "HP"
    model = "ProBook 450 G9"
    category = "Laptops"
    description = "Laptop empresarial de alta rendimiento"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

$product1Response = Invoke-WebRequest -Uri "$API_URL/products" `
    -Method Post `
    -Headers $headers `
    -Body $product1Payload `
    -UseBasicParsing

$product1Data = $product1Response.Content | ConvertFrom-Json
$PRODUCT1_ID = $product1Data.id

Write-Host "Producto creado con ID: $PRODUCT1_ID" -ForegroundColor Green
Write-Host ""

# 4. Crear variante 1 del producto 1
Write-Host "4. Creando variante 1: Intel i5, 8GB RAM, 256GB SSD..." -ForegroundColor Yellow
$variant1Payload = @{
    productId = $PRODUCT1_ID
    sku = "HP-PB450-I5-8GB-256SSD"
    costPrice = 380.00
    priceB2B = 460.00
    pricePVP = 550.00
    attributes = @{
        processor = "Intel Core i5-12450H"
        ram = "8GB DDR4"
        storage = "256GB SSD NVMe"
        display = "15.6 FHD IPS"
        battery = "47Wh"
    }
} | ConvertTo-Json

$variant1Response = Invoke-WebRequest -Uri "$API_URL/products/variants" `
    -Method Post `
    -Headers $headers `
    -Body $variant1Payload `
    -UseBasicParsing

$variant1Data = $variant1Response.Content | ConvertFrom-Json
Write-Host "Variante 1 creada - SKU: $($variant1Data.sku)" -ForegroundColor Green
Write-Host ""

# 5. Crear variante 2 del producto 1
Write-Host "5. Creando variante 2: Intel i7, 16GB RAM, 512GB SSD..." -ForegroundColor Yellow
$variant2Payload = @{
    productId = $PRODUCT1_ID
    sku = "HP-PB450-I7-16GB-512SSD"
    costPrice = 520.00
    priceB2B = 630.00
    pricePVP = 750.00
    attributes = @{
        processor = "Intel Core i7-12700H"
        ram = "16GB DDR4"
        storage = "512GB SSD NVMe"
        display = "15.6 FHD IPS"
        battery = "47Wh"
    }
} | ConvertTo-Json

$variant2Response = Invoke-WebRequest -Uri "$API_URL/products/variants" `
    -Method Post `
    -Headers $headers `
    -Body $variant2Payload `
    -UseBasicParsing

$variant2Data = $variant2Response.Content | ConvertFrom-Json
Write-Host "Variante 2 creada - SKU: $($variant2Data.sku)" -ForegroundColor Green
Write-Host ""

# 6. Crear producto 2: Monitor Dell
Write-Host "6. Creando producto: Monitor Dell U2723DE..." -ForegroundColor Yellow
$product2Payload = @{
    name = "Monitor IPS 27 Pulgadas 4K"
    brand = "Dell"
    model = "U2723DE"
    category = "Monitores"
    description = "Monitor profesional 4K USB-C"
} | ConvertTo-Json

$product2Response = Invoke-WebRequest -Uri "$API_URL/products" `
    -Method Post `
    -Headers $headers `
    -Body $product2Payload `
    -UseBasicParsing

$product2Data = $product2Response.Content | ConvertFrom-Json
$PRODUCT2_ID = $product2Data.id

Write-Host "Producto creado con ID: $PRODUCT2_ID" -ForegroundColor Green
Write-Host ""

# 7. Crear variante del producto 2
Write-Host "7. Creando variante del monitor..." -ForegroundColor Yellow
$variant3Payload = @{
    productId = $PRODUCT2_ID
    sku = "DELL-U2723DE-4K-USB-C"
    costPrice = 350.00
    priceB2B = 420.00
    pricePVP = 499.00
    attributes = @{
        resolution = "3840x2160 4K"
        panelType = "IPS"
        connectivity = "USB-C, HDMI, DP"
        brightness = "350 nits"
        colorGamut = "100% sRGB"
    }
} | ConvertTo-Json

$variant3Response = Invoke-WebRequest -Uri "$API_URL/products/variants" `
    -Method Post `
    -Headers $headers `
    -Body $variant3Payload `
    -UseBasicParsing

$variant3Data = $variant3Response.Content | ConvertFrom-Json
Write-Host "Variante creada - SKU: $($variant3Data.sku)" -ForegroundColor Green
Write-Host ""

# 8. Obtener catálogo público
Write-Host "8. Obteniendo catálogo público..." -ForegroundColor Yellow
$catalogResponse = Invoke-WebRequest -Uri "$API_URL/products/public" `
    -Method Get `
    -UseBasicParsing

$catalog = $catalogResponse.Content | ConvertFrom-Json
Write-Host "Total de variantes en catálogo: $($catalog.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Productos catalogados:" -ForegroundColor Cyan
$catalog | Format-Table -Property sku, productName, pricePVP, priceB2B, costPrice -AutoSize

Write-Host ""
Write-Host "=== Creación de productos completada exitosamente ===" -ForegroundColor Green
