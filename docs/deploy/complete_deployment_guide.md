# 📚 Полное руководство по деплою новых окружений

> **Цель документа**: Предоставить исчерпывающее руководство для автоматического развертывания новых окружений (dev, staging, admin и т.д.) с использованием Docker + Caddy на отдельных серверах.

---

## 📋 Оглавление

1. [🎯 Обзор архитектуры](#-обзор-архитектуры)
2. [🔧 Подготовка сервера](#-подготовка-сервера)
3. [🐳 Настройка Docker](#-настройка-docker)
4. [🌐 Установка и настройка Caddy](#-установка-и-настройка-caddy)
5. [🔐 Безопасность и SSH](#-безопасность-и-ssh)
6. [📁 Структура директорий](#-структура-директорий)
7. [⚙️ Переменные окружения](#️-переменные-окружения)
8. [🚀 GitHub Actions CI/CD](#-github-actions-cicd)
9. [🌐 DNS настройки](#-dns-настройки)
10. [🧪 Тестирование и валидация](#-тестирование-и-валидация)
11. [⚠️ Подводные камни и решения](#️-подводные-камни-и-решения)
12. [📝 Шаблоны для копирования](#-шаблоны-для-копирования)

---

## 🎯 Обзор архитектуры

### Текущая инфраструктура kirdro.ru:

```
┌─ Production ─────────────────────┐  ┌─ Development ───────────────────┐
│ https://kirdro.ru               │  │ https://dev.kirdro.ru           │
│ Server: 176.98.176.195          │  │ Server: 5.129.250.165           │
│ Caddy -> Docker:3003            │  │ Caddy -> Docker:3004            │
│ Branch: main                    │  │ Branch: dev                     │
│ Container: kirdro-portfolio-prod│  │ Container: kirdro-portfolio-dev │
└─────────────────────────────────┘  └─────────────────────────────────┘
            │                                    │
            └──── Shared PostgreSQL DB ─────────┘
               109.196.100.98:5432/default_db
```

### Принципы развертывания:

- **Изоляция**: Каждое окружение на отдельном сервере
- **Безопасность**: UFW firewall, SSH keys, SSL через Let's Encrypt
- **Автоматизация**: GitHub Actions с Docker build & deploy
- **Мониторинг**: Логи, health checks, статус контейнеров
- **Масштабируемость**: Простое добавление новых окружений

---

## 🔧 Подготовка сервера

### Системные требования:
- **ОС**: Debian 12+ (Trixie)
- **RAM**: Минимум 1GB
- **Диск**: Минимум 10GB свободного места
- **Сеть**: Открытые порты 22, 80, 443

### Базовая настройка системы:

```bash
# Подключение к серверу
ssh root@<SERVER_IP>

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl wget git htop nano ufw

# Очистка старых пакетов (если нужно)
apt autoremove -y
```

### ⚠️ ВАЖНО: Проверка SSH доступа
```bash
# Убедитесь что SSH работает ПЕРЕД настройкой firewall
ssh root@<SERVER_IP> "echo 'SSH работает!'"
```

---

## 🐳 Настройка Docker

### Установка Docker (официальный метод):

```bash
# Добавление Docker репозитория
apt update
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Запуск Docker
systemctl enable docker
systemctl start docker
```

### Проверка установки Docker:

```bash
# Проверка версии
docker --version

# Проверка статуса
systemctl status docker --no-pager

# Тестовый запуск (опционально)
docker run hello-world
```

### ⚠️ Подводный камень: Docker daemon
- **Проблема**: Docker может не запуститься автоматически
- **Решение**: Всегда проверяйте статус и запускайте принудительно

---

## 🌐 Установка и настройка Caddy

### Установка Caddy через официальный репозиторий:

```bash
# Добавление Caddy репозитория
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list

# Установка Caddy
apt update
apt install -y caddy

# Включение сервиса
systemctl enable caddy
systemctl start caddy
```

### Создание Caddyfile (шаблон):

```bash
# Создание основного Caddyfile для нового окружения
cat > /etc/caddy/Caddyfile << 'EOF'
# ENVIRONMENT_NAME environment для kirdro.ru
SUBDOMAIN.kirdro.ru {
    # Автоматический HTTPS
    
    # Проксирование на Next.js контейнер
    reverse_proxy localhost:PORT {
        # Автоматическая обработка WebSockets и HTTP/2
    }
    
    # Кеширование статики
    @static {
        path /_next/static/*
        path /images/*
        path *.ico *.png *.jpg *.jpeg *.svg *.gif
        path *.js *.css *.woff *.woff2
    }
    handle @static {
        header Cache-Control "public, max-age=3600"
    }
    
    # Безопасность заголовки
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        # Environment indicator
        X-Environment "ENVIRONMENT_NAME"
    }
    
    # Логирование
    log {
        output file /var/logs/kirdro-ENVIRONMENT_NAME/access.log {
            roll_size 100mb
            roll_keep 5
        }
        format json
    }
}
EOF
```

### Замените плейсхолдеры:
- `ENVIRONMENT_NAME` → `dev`, `admin`, `staging` и т.д.
- `SUBDOMAIN` → `dev`, `admin`, `staging` и т.д.  
- `PORT` → `3004`, `3005`, `3006` и т.д.

### ⚠️ Подводные камни Caddy:

1. **Проблема**: Permission denied для log файлов
   ```bash
   # Решение: Создать директорию и дать права
   mkdir -p /var/logs/kirdro-ENVIRONMENT_NAME
   chown -R caddy:caddy /var/logs/kirdro-ENVIRONMENT_NAME
   chmod -R 755 /var/logs/kirdro-ENVIRONMENT_NAME
   ```

2. **Проблема**: Caddy не перезагружается
   ```bash
   # Проверка синтаксиса
   caddy validate --config /etc/caddy/Caddyfile
   
   # Принудительная перезагрузка
   systemctl restart caddy
   
   # Проверка статуса
   systemctl status caddy --no-pager
   ```

3. **Проблема**: SSL сертификат не получается
   - **Причина**: DNS запись не указывает на сервер
   - **Решение**: Проверить DNS через `dig SUBDOMAIN.kirdro.ru`

---

## 🔐 Безопасность и SSH

### Настройка UFW Firewall:

```bash
# Настройка базовых правил
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Включение firewall (ОСТОРОЖНО! Может разорвать SSH)
ufw --force enable

# Проверка статуса
ufw status verbose
```

### Создание SSH ключей для GitHub Actions:

```bash
# НА ЛОКАЛЬНОЙ МАШИНЕ, НЕ НА СЕРВЕРЕ!
ssh-keygen -t ed25519 -C "github-actions-ENVIRONMENT_NAME-deploy" -f ~/.ssh/kirdro_ENVIRONMENT_NAME_deploy -N ""

# Копирование публичного ключа на сервер
ssh-copy-id -i ~/.ssh/kirdro_ENVIRONMENT_NAME_deploy.pub root@<SERVER_IP>

# Тест подключения по ключу
ssh -i ~/.ssh/kirdro_ENVIRONMENT_NAME_deploy root@<SERVER_IP> "echo 'SSH ключ работает!'"
```

### Получение приватного ключа для GitHub Secrets:

```bash
# НА ЛОКАЛЬНОЙ МАШИНЕ
cat ~/.ssh/kirdro_ENVIRONMENT_NAME_deploy
```

### ⚠️ Критический подводный камень SSH:
- **НИКОГДА не настраивайте PasswordAuthentication no ПЕРЕД тестированием ключей!**
- **Всегда тестируйте SSH доступ после настройки firewall**

---

## 📁 Структура директорий

### Создание директорий на сервере:

```bash
# Создание основной структуры
mkdir -p /var/docker/kirdro-ENVIRONMENT_NAME
mkdir -p /var/logs/kirdro-ENVIRONMENT_NAME
mkdir -p /etc/caddy/conf.d

# Установка прав доступа
chown -R root:root /var/docker/kirdro-ENVIRONMENT_NAME
chmod -R 755 /var/docker/kirdro-ENVIRONMENT_NAME

# Права для логов Caddy
chown -R caddy:caddy /var/logs/kirdro-ENVIRONMENT_NAME
chmod -R 755 /var/logs/kirdro-ENVIRONMENT_NAME
```

### Финальная структура:
```
/var/docker/kirdro-ENVIRONMENT_NAME/
├── .env.ENVIRONMENT_NAME        # Переменные окружения
└── (Docker образы загружаются сюда временно)

/var/logs/kirdro-ENVIRONMENT_NAME/
├── access.log                   # Логи Caddy
└── (автоматические ротации)
```

---

## ⚙️ Переменные окружения

### Шаблон .env файла:

```bash
# Создание .env файла на сервере
cat > /var/docker/kirdro-ENVIRONMENT_NAME/.env.ENVIRONMENT_NAME << 'EOF'
# ENVIRONMENT_NAME environment variables for SUBDOMAIN.kirdro.ru
NODE_ENV=ENVIRONMENT_NAME
NEXTAUTH_URL=https://SUBDOMAIN.kirdro.ru
AUTH_TRUST_HOST=true

# Database (общая для всех окружений)
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth (АКТУАЛЬНЫЕ КЛЮЧИ - проверьте дату обновления)
AUTH_SECRET=YOUR_AUTH_SECRET_HERE
AUTH_YANDEX_ID=YOUR_YANDEX_CLIENT_ID_HERE
AUTH_YANDEX_SECRET=YOUR_YANDEX_CLIENT_SECRET_HERE

# Email SMTP (общие для всех окружений)
EMAIL_SERVER_HOST=smtp.yandex.ru
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=kirdro@yandex.ru
EMAIL_SERVER_PASSWORD=YOUR_EMAIL_PASSWORD_HERE
EMAIL_FROM=KD Portfolio ENVIRONMENT_NAME <kirdro@yandex.ru>

# AI API (общий для всех окружений)
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE

# Специфичные для окружения
PORT=PORT_NUMBER
NEXT_TELEMETRY_DISABLED=1
EOF

# Установка безопасных прав доступа
chmod 600 /var/docker/kirdro-ENVIRONMENT_NAME/.env.ENVIRONMENT_NAME
```

### Замените плейсхолдеры:
- `ENVIRONMENT_NAME` → `development`, `admin`, `staging`
- `SUBDOMAIN` → `dev`, `admin`, `staging`
- `PORT_NUMBER` → `3004`, `3005`, `3006`

### ⚠️ Подводные камни переменных окружения:

1. **Всегда используйте chmod 600 для .env файлов**
2. **Проверяйте актуальность Yandex OAuth ключей**
3. **NODE_ENV должен соответствовать типу окружения**

---

## 🚀 GitHub Actions CI/CD

### Шаблон GitHub Actions workflow:

```yaml
# .github/workflows/deploy-ENVIRONMENT_NAME.yml
name: 🐳 Docker Deploy to ENVIRONMENT_NAME

on:
  push:
    branches: [BRANCH_NAME]
  pull_request:
    branches: [BRANCH_NAME]

env:
  DOCKER_IMAGE: kirdro-portfolio-ENVIRONMENT_NAME
  DOCKER_TAG: latest
  CONTAINER_NAME: kirdro-portfolio-ENVIRONMENT_NAME

jobs:
  # Этап 1: TypeScript и линтинг
  typecheck:
    name: ⚡ TypeScript Check (ENVIRONMENT_NAME)
    runs-on: ubuntu-latest
    steps:
      - name: 📚 Checkout
        uses: actions/checkout@v4

      - name: 🏗 Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: 📦 Install dependencies
        run: bun install

      - name: 🔍 TypeScript check
        run: bun run typecheck

      - name: 🧹 Lint check
        run: SKIP_ENV_VALIDATION=1 bun run lint || echo "Lint warnings detected but continuing..."

  # Этап 2: Сборка Docker образа
  docker-build:
    name: 🐳 Docker Build (ENVIRONMENT_NAME)
    runs-on: ubuntu-latest
    needs: typecheck
    steps:
      - name: 📚 Checkout
        uses: actions/checkout@v4

      - name: 🏗 Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🐳 Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          load: true
          tags: ${{ env.DOCKER_IMAGE }}:${{ env.DOCKER_TAG }}
          build-args: |
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: 🗜️ Save Docker image
        run: |
          echo "💾 Saving Docker image to tar archive..."
          docker save ${{ env.DOCKER_IMAGE }}:${{ env.DOCKER_TAG }} | gzip > kirdro-ENVIRONMENT_NAME-docker-image.tar.gz
          echo "📊 Archive size:"
          ls -lh kirdro-ENVIRONMENT_NAME-docker-image.tar.gz

      - name: 📤 Upload Docker image
        uses: actions/upload-artifact@v4
        with:
          name: docker-image-ENVIRONMENT_NAME
          path: kirdro-ENVIRONMENT_NAME-docker-image.tar.gz
          retention-days: 1

  # Этап 3: Docker Деплой
  docker-deploy:
    name: 🐳 Docker Deploy to ENVIRONMENT_NAME
    runs-on: ubuntu-latest
    needs: [typecheck, docker-build]
    if: github.ref == 'refs/heads/BRANCH_NAME'
    environment: ENVIRONMENT_NAME
    
    steps:
      - name: 📥 Download Docker image
        uses: actions/download-artifact@v4
        with:
          name: docker-image-ENVIRONMENT_NAME
          path: .

      - name: 🔐 Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.ENVIRONMENT_NAME_DEPLOY_KEY }}

      - name: 🐳 Deploy Docker to ENVIRONMENT_NAME server
        run: |
          echo "🐳 Starting Docker deployment to ENVIRONMENT_NAME server..."
          
          # Копирование Docker образа на сервер
          scp -o StrictHostKeyChecking=no kirdro-ENVIRONMENT_NAME-docker-image.tar.gz ${{ secrets.ENVIRONMENT_NAME_DEPLOY_USER }}@${{ secrets.ENVIRONMENT_NAME_DEPLOY_HOST }}:/tmp/

          # Docker deployment на сервере
          ssh -o StrictHostKeyChecking=no ${{ secrets.ENVIRONMENT_NAME_DEPLOY_USER }}@${{ secrets.ENVIRONMENT_NAME_DEPLOY_HOST }} '
            set -e
            
            echo "🐳 Starting Docker deployment on ENVIRONMENT_NAME server..."
            
            # Переходим в Docker директорию
            cd /var/docker/kirdro-ENVIRONMENT_NAME
            
            # Загружаем новый Docker образ
            echo "📥 Loading Docker image..."
            docker load -i /tmp/kirdro-ENVIRONMENT_NAME-docker-image.tar.gz
            
            # Останавливаем старый контейнер если существует
            echo "🛑 Stopping old ENVIRONMENT_NAME container..."
            if docker ps -a --format "table {{.Names}}" | grep -q "^${{ env.CONTAINER_NAME }}$"; then
              docker stop ${{ env.CONTAINER_NAME }} || true
              docker rm ${{ env.CONTAINER_NAME }} || true
              echo "✅ Old ENVIRONMENT_NAME container removed"
            fi
            
            # Запускаем новый контейнер
            echo "🚀 Starting new ENVIRONMENT_NAME Docker container..."
            docker run -d \
              --name ${{ env.CONTAINER_NAME }} \
              --restart unless-stopped \
              -p 127.0.0.1:PORT_NUMBER:PORT_NUMBER \
              --env-file .env.ENVIRONMENT_NAME \
              --memory="1g" \
              --cpus="1.0" \
              --health-cmd="bun healthcheck.js" \
              --health-interval=30s \
              --health-timeout=10s \
              --health-retries=3 \
              --health-start-period=60s \
              ${{ env.DOCKER_IMAGE }}:${{ env.DOCKER_TAG }}
            
            echo "✅ New ENVIRONMENT_NAME container started successfully!"
            
            # Проверяем запущенные контейнеры
            echo "🔍 Running ENVIRONMENT_NAME containers:"
            docker ps | grep kirdro-ENVIRONMENT_NAME || echo "❌ ENVIRONMENT_NAME Container not found in ps"
            
            # Очистка
            rm -f /tmp/kirdro-ENVIRONMENT_NAME-docker-image.tar.gz
            
            echo "🎉 ENVIRONMENT_NAME Docker deployment completed successfully!"
          '

      - name: 🔍 ENVIRONMENT_NAME Health Check
        run: |
          echo "⏳ Waiting for ENVIRONMENT_NAME container startup..."
          sleep 30
          
          # Проверяем API endpoint через HTTP
          echo "🩺 Checking ENVIRONMENT_NAME API health endpoint..."
          for i in {1..5}; do
            response=$(curl -s -o /dev/null -w "%{http_code}" https://SUBDOMAIN.kirdro.ru/api/healthz || echo "000")
            if [ "$response" = "200" ]; then
              echo "✅ ENVIRONMENT_NAME API Health check passed (HTTP $response)"
              exit 0
            else
              echo "⏳ ENVIRONMENT_NAME API Health attempt $i: HTTP $response, retrying..."
              sleep 10
            fi
          done
          
          echo "❌ ENVIRONMENT_NAME API Health check failed after all attempts"
          exit 1

  # Этап 4: Уведомления
  notify:
    name: 📢 ENVIRONMENT_NAME Notifications  
    runs-on: ubuntu-latest
    needs: [docker-deploy]
    if: always()
    steps:
      - name: 🎉 Success Notification
        if: needs.docker-deploy.result == 'success'
        run: echo "🎉 ENVIRONMENT_NAME deployment to https://SUBDOMAIN.kirdro.ru completed successfully! 🐳"
        
      - name: 💥 Failure Notification  
        if: needs.docker-deploy.result == 'failure'
        run: echo "💥 ENVIRONMENT_NAME deployment failed! Check the logs and container status."
```

### Замените плейсхолдеры:
- `ENVIRONMENT_NAME` → `Development`, `Admin`, `Staging`
- `BRANCH_NAME` → `dev`, `admin`, `staging`  
- `SUBDOMAIN` → `dev`, `admin`, `staging`
- `PORT_NUMBER` → `3004`, `3005`, `3006`

### GitHub Secrets (нужно добавить вручную):

```
# Для каждого окружения добавить в GitHub Settings → Secrets:
ENVIRONMENT_NAME_DEPLOY_HOST = <SERVER_IP>
ENVIRONMENT_NAME_DEPLOY_USER = root
ENVIRONMENT_NAME_DEPLOY_KEY = <PRIVATE_SSH_KEY>

# Например для admin окружения:
ADMIN_DEPLOY_HOST = 5.129.250.166  
ADMIN_DEPLOY_USER = root
ADMIN_DEPLOY_KEY = -----BEGIN OPENSSH PRIVATE KEY-----...
```

---

## 🌐 DNS настройки

### Требуемые DNS записи:

```
# В панели управления DNS (например, Cloudflare):
# A запись: SUBDOMAIN.kirdro.ru -> <SERVER_IP>

# Примеры:
dev.kirdro.ru -> 5.129.250.165
admin.kirdro.ru -> 5.129.250.166
staging.kirdro.ru -> 5.129.250.167
```

### Проверка DNS:

```bash
# Проверка разрешения DNS
dig SUBDOMAIN.kirdro.ru

# Ожидаемый результат: должен показать правильный IP адрес сервера
```

### Yandex OAuth настройки:

```bash
# Добавить в Yandex OAuth приложение новый Redirect URI:
# https://SUBDOMAIN.kirdro.ru/api/auth/callback/yandex

# Проверка OAuth провайдеров:
curl -s https://SUBDOMAIN.kirdro.ru/api/auth/providers | python3 -m json.tool
```

---

## 🧪 Тестирование и валидация

### Чек-лист тестирования окружения:

```bash
# 1. Проверка основных страниц
curl -I https://SUBDOMAIN.kirdro.ru
curl -I https://SUBDOMAIN.kirdro.ru/about
curl -I https://SUBDOMAIN.kirdro.ru/projects
curl -I https://SUBDOMAIN.kirdro.ru/contacts

# 2. Проверка API endpoints
curl -s https://SUBDOMAIN.kirdro.ru/api/health | python3 -m json.tool
curl -s https://SUBDOMAIN.kirdro.ru/api/healthz
curl -s https://SUBDOMAIN.kirdro.ru/api/auth/session
curl -s https://SUBDOMAIN.kirdro.ru/api/auth/providers | python3 -m json.tool

# 3. Проверка tRPC
curl -s "https://SUBDOMAIN.kirdro.ru/api/trpc/chat.getMessages?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A1%7D%7D%7D"

# 4. Проверка статических файлов
curl -I https://SUBDOMAIN.kirdro.ru/_next/static/css/
curl -I https://SUBDOMAIN.kirdro.ru/favicon.ico

# 5. Проверка переменных окружения
ssh root@<SERVER_IP> "docker exec kirdro-portfolio-ENVIRONMENT_NAME env | grep -E 'NODE_ENV|NEXTAUTH_URL'"
```

### Диагностика проблем:

```bash
# Проверка логов Caddy
journalctl -u caddy -f

# Проверка логов Docker контейнера  
docker logs kirdro-portfolio-ENVIRONMENT_NAME -f

# Проверка статуса контейнера
docker ps | grep kirdro
docker inspect kirdro-portfolio-ENVIRONMENT_NAME

# Проверка портов
netstat -tulpn | grep -E ':PORT_NUMBER|:80|:443'
ss -tulpn | grep -E ':PORT_NUMBER|:80|:443'

# Проверка файловой системы
ls -la /var/docker/kirdro-ENVIRONMENT_NAME/
ls -la /var/logs/kirdro-ENVIRONMENT_NAME/

# Проверка SSL сертификата
echo | openssl s_client -connect SUBDOMAIN.kirdro.ru:443 -servername SUBDOMAIN.kirdro.ru 2>/dev/null | openssl x509 -noout -dates
```

---

## ⚠️ Подводные камни и решения

### 1. **Проблема**: Caddy не получает SSL сертификат
**Причины**:
- DNS запись не указывает на сервер
- Порт 443 заблокирован
- Домен уже используется другим сервисом

**Решение**:
```bash
# Проверить DNS
dig SUBDOMAIN.kirdro.ru

# Проверить порты  
ufw status verbose

# Перезапустить Caddy
systemctl restart caddy
```

### 2. **Проблема**: Permission denied для логов
**Решение**:
```bash
# Создать директорию с правильными правами
mkdir -p /var/logs/kirdro-ENVIRONMENT_NAME
chown -R caddy:caddy /var/logs/kirdro-ENVIRONMENT_NAME
chmod -R 755 /var/logs/kirdro-ENVIRONMENT_NAME
systemctl restart caddy
```

### 3. **Проблема**: Docker контейнер не запускается
**Возможные причины**:
- Порт уже занят
- .env файл не найден или недоступен
- Образ поврежден

**Диагностика**:
```bash
# Проверить порты
netstat -tulpn | grep PORT_NUMBER

# Проверить образы
docker images | grep kirdro

# Проверить .env файл
ls -la /var/docker/kirdro-ENVIRONMENT_NAME/.env.ENVIRONMENT_NAME

# Логи контейнера
docker logs kirdro-portfolio-ENVIRONMENT_NAME
```

### 4. **Проблема**: GitHub Actions не может подключиться по SSH
**Решения**:
```bash
# Проверить SSH ключ на сервере
cat ~/.ssh/authorized_keys | grep "github-actions-ENVIRONMENT_NAME-deploy"

# Тест подключения с локальной машины
ssh -i ~/.ssh/kirdro_ENVIRONMENT_NAME_deploy root@<SERVER_IP> "echo 'Тест SSH'"

# Проверить GitHub Secrets - они должны точно соответствовать именам в workflow
```

### 5. **Проблема**: Health check не проходит
**Возможные причины**:
- Контейнер еще не запустился полностью (решение: увеличить время ожидания)
- Caddy не проксирует запросы (решение: проверить Caddyfile)
- API endpoint не отвечает (решение: проверить логи приложения)

### 6. **Проблема**: "Address already in use"
```bash
# Найти процесс на порту
lsof -i :PORT_NUMBER

# Убить процесс (осторожно!)
pkill -f PORT_NUMBER

# Или остановить все Docker контейнеры
docker stop $(docker ps -q)
```

---

## 📝 Шаблоны для копирования

### Быстрое создание нового окружения:

1. **Заменить в шаблонах**:
   - `ENVIRONMENT_NAME` → имя окружения (`admin`, `staging`)
   - `SUBDOMAIN` → поддомен (`admin`, `staging`)  
   - `BRANCH_NAME` → ветка Git (`admin`, `staging`)
   - `PORT_NUMBER` → порт контейнера (`3005`, `3006`)
   - `<SERVER_IP>` → IP адрес сервера

2. **Последовательность действий**:
   1. Подготовить сервер (секция "Подготовка сервера")
   2. Установить Docker (секция "Настройка Docker")
   3. Установить Caddy (секция "Caddy")
   4. Настроить безопасность (секция "Безопасность и SSH")
   5. Создать структуру директорий (секция "Структура директорий")
   6. Создать .env файл (секция "Переменные окружения")
   7. Создать GitHub Actions workflow (секция "GitHub Actions")
   8. Добавить DNS запись (секция "DNS настройки")
   9. Добавить GitHub Secrets
   10. Тестировать (секция "Тестирование")

### Карта портов (для избежания конфликтов):
```
Production: kirdro.ru (176.98.176.195) → :3003
Development: dev.kirdro.ru (5.129.250.165) → :3004  
Admin: admin.kirdro.ru (NEW_SERVER) → :3005
Staging: staging.kirdro.ru (NEW_SERVER) → :3006
```

---

## 🎯 Заключение

Данное руководство содержит все необходимые шаги и решения для развертывания новых окружений kirdro.ru портфолио. 

**Ключевые принципы**:
- Тестируйте каждый шаг перед переходом к следующему
- Всегда проверяйте SSH доступ перед настройкой firewall
- Используйте правильные права доступа для файлов
- Каждое окружение должно иметь уникальный порт
- DNS записи должны быть настроены перед тестированием SSL

При следовании данному руководству развертывание нового окружения займет примерно 15-20 минут.

---

*Документ создан на основе успешного развертывания dev окружения 11.09.2025*
*Автор: Claude Code AI Assistant*