#!/bin/bash
# Script para crear productos usando los nuevos endpoints

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api"

echo -e "${BLUE}=== FIXME ECOSYSTEM - Product Creation Demo ===${NC}\n"

# 1. Registrar un usuario ADMIN (si no existe)
echo -e "${YELLOW}1. Registrando usuario ADMIN...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fixme.com",
    "password": "AdminPassword123!",
    "role": "ADMIN"
  }')

echo "Response: $REGISTER_RESPONSE"

# 2. Login para obtener token
echo -e "\n${YELLOW}2. Obteniendo token JWT...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fixme.com",
    "password": "AdminPassword123!"
  }')

echo "Login Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Error: No se pudo obtener el token${NC}"
  exit 1
fi

echo -e "${GREEN}Token obtenido: ${TOKEN:0:20}...${NC}"

# 3. Crear un producto
echo -e "\n${YELLOW}3. Creando producto: Laptop HP ProBook...${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop ProBook 15.6\"",
    "brand": "HP",
    "model": "ProBook 450 G9",
    "category": "Laptops",
    "description": "Laptop empresarial de alta rendimiento"
  }')

echo "Response: $PRODUCT_RESPONSE"
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}Error: No se pudo crear el producto${NC}"
  exit 1
fi

echo -e "${GREEN}Producto creado con ID: $PRODUCT_ID${NC}"

# 4. Crear variantes del producto
echo -e "\n${YELLOW}4. Creando variante 1: Intel i5, 8GB RAM, 256GB SSD...${NC}"
VARIANT1_RESPONSE=$(curl -s -X POST "$API_URL/products/variants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": $PRODUCT_ID,
    \"sku\": \"HP-PB450-I5-8GB-256SSD\",
    \"costPrice\": 380.00,
    \"priceB2B\": 460.00,
    \"pricePVP\": 550.00,
    \"attributes\": {
      \"processor\": \"Intel Core i5-12450H\",
      \"ram\": \"8GB DDR4\",
      \"storage\": \"256GB SSD NVMe\",
      \"display\": \"15.6 FHD IPS\",
      \"battery\": \"47Wh\"
    }
  }")

echo "Response: $VARIANT1_RESPONSE"

echo -e "\n${YELLOW}5. Creando variante 2: Intel i7, 16GB RAM, 512GB SSD...${NC}"
VARIANT2_RESPONSE=$(curl -s -X POST "$API_URL/products/variants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": $PRODUCT_ID,
    \"sku\": \"HP-PB450-I7-16GB-512SSD\",
    \"costPrice\": 520.00,
    \"priceB2B\": 630.00,
    \"pricePVP\": 750.00,
    \"attributes\": {
      \"processor\": \"Intel Core i7-12700H\",
      \"ram\": \"16GB DDR4\",
      \"storage\": \"512GB SSD NVMe\",
      \"display\": \"15.6 FHD IPS\",
      \"battery\": \"47Wh\"
    }
  }")

echo "Response: $VARIANT2_RESPONSE"

# 5. Crear otro producto
echo -e "\n${YELLOW}6. Creando producto: Monitor Dell U2723DE...${NC}"
PRODUCT2_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor IPS 27 Pulgadas 4K",
    "brand": "Dell",
    "model": "U2723DE",
    "category": "Monitores",
    "description": "Monitor profesional 4K USB-C"
  }')

echo "Response: $PRODUCT2_RESPONSE"
PRODUCT2_ID=$(echo $PRODUCT2_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo -e "\n${YELLOW}7. Creando variante del monitor...${NC}"
VARIANT3_RESPONSE=$(curl -s -X POST "$API_URL/products/variants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": $PRODUCT2_ID,
    \"sku\": \"DELL-U2723DE-4K-USB-C\",
    \"costPrice\": 350.00,
    \"priceB2B\": 420.00,
    \"pricePVP\": 499.00,
    \"attributes\": {
      \"resolution\": \"3840x2160 4K\",
      \"panelType\": \"IPS\",
      \"connectivity\": \"USB-C, HDMI, DP\",
      \"brightness\": \"350 nits\",
      \"colorGamut\": \"100% sRGB\"
    }
  }")

echo "Response: $VARIANT3_RESPONSE"

# 6. Obtener catálogo público
echo -e "\n${YELLOW}8. Obteniendo catálogo público...${NC}"
CATALOG=$(curl -s -X GET "$API_URL/products/public")
echo "Catálogo: $CATALOG"

echo -e "\n${GREEN}=== Creación de productos completada exitosamente ===${NC}"
