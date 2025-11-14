#!/bin/bash

echo "=== 🐳 Docker контейнеры и их порты ==="
echo ""

# Показать все запущенные контейнеры с их портами
echo "📦 Запущенные контейнеры:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== 🔍 Детальная информация о контейнерах kirdro ==="
echo ""

# Показать только контейнеры kirdro с полной информацией о портах
docker ps --filter "name=kirdro" --format "Container: {{.Names}}\nPorts: {{.Ports}}\nStatus: {{.Status}}\n---"

echo ""
echo "=== 🌐 Конфигурация Caddy ==="
echo ""

# Найти конфигурационный файл Caddy
echo "📄 Поиск Caddyfile:"
find / -name "Caddyfile" -type f 2>/dev/null | head -5

echo ""
echo "📋 Содержимое Caddyfile (если найден):"
if [ -f "/etc/caddy/Caddyfile" ]; then
    cat /etc/caddy/Caddyfile
elif [ -f "/opt/caddy/Caddyfile" ]; then
    cat /opt/caddy/Caddyfile
else
    # Попробовать найти в Docker volumes
    find /var/lib/docker/volumes -name "Caddyfile" -type f 2>/dev/null | while read file; do
        echo "Найден: $file"
        cat "$file"
    done
fi

echo ""
echo "=== 🔗 Проверка доменов и проксирования ==="
echo ""

# Проверить конфигурацию Caddy через API (если доступен)
if docker ps | grep -q caddy; then
    echo "🔍 Caddy контейнер найден. Проверяем конфигурацию:"
    docker exec $(docker ps -q -f name=caddy) caddy list-modules 2>/dev/null || echo "API не доступен"

    echo ""
    echo "📄 Конфигурация из контейнера Caddy:"
    docker exec $(docker ps -q -f name=caddy) cat /etc/caddy/Caddyfile 2>/dev/null || \
    docker exec $(docker ps -q -f name=caddy) cat /config/Caddyfile 2>/dev/null || \
    echo "Caddyfile не найден в стандартных местах"
fi

echo ""
echo "=== 📊 Сетевые подключения ==="
echo ""

# Показать прослушиваемые порты
echo "🔌 Прослушиваемые порты (связанные с Docker):"
ss -tlnp | grep -E ":(3000|3001|3002|3003|3004|3005|80|443)" | grep -v "127.0.0.1"

echo ""
echo "=== 🗺️ Docker сети ==="
echo ""

# Показать Docker сети
docker network ls

echo ""
echo "🔗 Контейнеры в сети (если есть кастомная сеть):"
for network in $(docker network ls -q); do
    name=$(docker network inspect $network --format '{{.Name}}')
    if [[ "$name" != "bridge" && "$name" != "host" && "$name" != "none" ]]; then
        echo "Сеть: $name"
        docker network inspect $network --format '{{range .Containers}}  - {{.Name}} ({{.IPv4Address}}){{"\n"}}{{end}}'
    fi
done

echo ""
echo "=== ✅ Проверка доступности ==="
echo ""

# Проверить доступность доменов
domains=("kirdro.ru" "admin.kirdro.ru" "api.kirdro.ru")
for domain in "${domains[@]}"; do
    echo -n "🌐 $domain: "
    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$domain" | grep -q "200\|301\|302"; then
        echo "✅ Доступен"
    else
        echo "❌ Не доступен или возвращает ошибку"
    fi
done