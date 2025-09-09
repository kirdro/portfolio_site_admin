# 🚀 Полное руководство по деплою через GitHub Actions

**Дата создания:** 9 сентября 2025г.  
**Автор:** Claude Code  
**Версия:** 1.0

---

## 📋 Описание системы деплоя

Этот проект использует **автоматический деплой на собственный VPS сервер** через GitHub Actions при каждом push в ветку `main`. Система полностью автономная и включает:

- ✅ **Типизация и линтинг** - проверка качества кода
- ✅ **Автоматическая сборка** - build Next.js приложения с Socket.io
- ✅ **Деплой на VPS** - развертывание через SSH с PM2
- ✅ **Health Check** - проверка работоспособности после деплоя
- ✅ **Backup система** - автобэкап перед обновлением

---

## 🏗️ Архитектура деплоя

### Схема процесса:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Git Push      │    │  GitHub Actions │    │   Production    │
│   to main       │───▶│     Runner      │───▶│   VPS Server    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌─────────┐              ┌─────────┐              ┌─────────┐
    │ Commit  │              │ Build   │              │ PM2 +   │
    │ Changes │              │ Test    │              │ Nginx   │
    └─────────┘              │ Package │              │ Process │
                             └─────────┘              └─────────┘
```

### Компоненты системы:

1. **GitHub Actions Workflow** - `.github/workflows/deploy.yml`
2. **PM2 Configuration** - `ecosystem.config.cjs`
3. **Health Check API** - `src/app/api/health/route.ts`
4. **Environment Secrets** - GitHub Repository Settings
5. **Server Setup** - VPS с Nginx + PM2 + Bun

---

## 📁 Структура файлов деплоя

### Основные файлы:

```
├── .github/workflows/
│   └── deploy.yml              # Главный workflow файл
├── ecosystem.config.cjs        # Конфигурация PM2
├── src/app/api/health/
│   └── route.ts               # Health check endpoint
├── server.js                  # Custom server с Socket.io
└── docs/deploy/               # Документация (этот файл)
```

---

## ⚙️ Настройка GitHub Actions

### 1. GitHub Secrets

В настройках репозитория (Settings → Secrets and variables → Actions) настроить:

#### 🔐 Обязательные секреты деплоя:
```bash
DEPLOY_KEY           # Приватный SSH ключ для доступа к серверу
DEPLOY_USER          # Пользователь на сервере (например: root)
DEPLOY_HOST          # IP адрес или домен сервера (например: kirdro.ru)
```

#### 🗄️ Секреты базы данных и приложения:
```bash
DATABASE_URL         # PostgreSQL подключение
NEXTAUTH_SECRET      # Секрет для NextAuth.js
NEXTAUTH_URL         # URL приложения (например: https://kirdro.ru)
GROQ_API_KEY         # API ключ для ИИ чата
```

#### 📧 Секреты почтового сервера:
```bash
EMAIL_SERVER_HOST    # SMTP хост
EMAIL_SERVER_PORT    # SMTP порт (обычно 587)
EMAIL_SERVER_USER    # SMTP пользователь
EMAIL_SERVER_PASSWORD # SMTP пароль
EMAIL_FROM           # Email отправителя
```

#### 🔑 OAuth секреты:
```bash
AUTH_YANDEX_ID       # Yandex OAuth Client ID
AUTH_YANDEX_SECRET   # Yandex OAuth Client Secret
AUTH_SECRET          # Общий секрет аутентификации
AUTH_TRUST_HOST      # Доверенный хост (true)
```

### 2. Workflow Файл

Основной файл: `.github/workflows/deploy.yml`

**Структура workflow:**

#### Этап 1: TypeScript Check
- Проверка типов с помощью `bun run typecheck`
- Линтинг с помощью `bun run lint`
- Продолжает работу даже при предупреждениях линта

#### Этап 2: Build
- Установка зависимостей через Bun
- Сборка Next.js с переменными окружения
- Подготовка пакета для деплоя
- Upload артефактов для следующего этапа

#### Этап 3: Deploy (только для main ветки)
- Download собранных артефактов
- SSH подключение к серверу
- Backup предыдущей версии
- Развертывание нового кода
- Перезапуск через PM2

#### Этап 4: Health Check
- Проверка API health endpoint
- Проверка основной страницы
- Диагностика при ошибках

---

## 🖥️ Настройка сервера

### Требования к серверу:

#### Системные требования:
- **OS:** Ubuntu 20.04+ / Debian 10+
- **RAM:** минимум 1GB, рекомендуется 2GB+
- **Storage:** минимум 20GB SSD
- **Network:** публичный IP адрес

#### Программное обеспечение:
```bash
# Установка базовых пакетов
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git nginx -y

# Установка Bun
curl -fsSL https://bun.sh/install | bash
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Установка PM2
npm install -g pm2

# Установка PostgreSQL (если нужно)
sudo apt install postgresql postgresql-contrib -y
```

### Настройка Nginx:

#### Конфигурация сайта (`/etc/nginx/sites-available/kirdro.ru`):
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name kirdro.ru www.kirdro.ru;

    # SSL сертификаты (получить через Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/kirdro.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kirdro.ru/privkey.pem;

    # Проксирование на Next.js приложение
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket поддержка для Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Активация конфигурации:
```bash
sudo ln -s /etc/nginx/sites-available/kirdro.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Настройка SSH ключей:

#### Создание SSH ключа:
```bash
# На локальной машине
ssh-keygen -t rsa -b 4096 -C "deploy@github-actions"

# Копирование публичного ключа на сервер
ssh-copy-id user@your-server.com

# Добавление приватного ключа в GitHub Secrets как DEPLOY_KEY
```

### Подготовка директорий:

#### Создание структуры папок:
```bash
# Рабочая директория
sudo mkdir -p /var/www/kirdro.ru
sudo chown -R $USER:$USER /var/www/kirdro.ru

# Логи
sudo mkdir -p /var/log/kirdro
sudo chown -R $USER:$USER /var/log/kirdro

# PM2 настройка для автозапуска
pm2 startup
sudo env PATH=$PATH:$HOME/.bun/bin pm2 startup systemd -u $USER --hp $HOME
```

---

## 📋 PM2 Configuration

### Файл: `ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'kirdro-portfolio',           // Название процесса
    script: 'bun',                     // Запуск через Bun
    args: 'start',                     // Команда запуска (bun start)
    cwd: '/var/www/kirdro.ru',         // Рабочая директория
    instances: 1,                      // Количество инстансов
    exec_mode: 'fork',                 // Режим выполнения
    env_file: '.env',                  // Файл с переменными окружения
    env: {
      NODE_ENV: 'production',
      PORT: 3003,                      // Порт приложения
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3003,
    },
    
    // Логирование
    error_file: '/var/log/kirdro/error.log',
    out_file: '/var/log/kirdro/access.log',
    log_file: '/var/log/kirdro/app.log',
    time: true,
    
    // Настройки перезапуска
    watch: false,                      // Не следим за изменениями файлов
    min_uptime: '10s',                 // Минимальное время работы
    max_restarts: 10,                  // Максимальное количество рестартов
    max_memory_restart: '1G',          // Рестарт при превышении памяти
    
    // Health monitoring
    health_check_url: 'http://localhost:3003/api/health',
    health_check_grace_period: 3000,
  }]
};
```

### PM2 команды:

```bash
# Запуск приложения
pm2 start ecosystem.config.cjs

# Мониторинг
pm2 status
pm2 logs kirdro-portfolio
pm2 monit

# Управление
pm2 reload kirdro-portfolio    # Graceful reload
pm2 restart kirdro-portfolio   # Hard restart
pm2 stop kirdro-portfolio      # Остановка
pm2 delete kirdro-portfolio    # Удаление

# Сохранение конфигурации
pm2 save
pm2 resurrect                  # Восстановление после перезагрузки сервера
```

---

## 🩺 Health Check System

### API Endpoint: `/api/health`

**Файл:** `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from '~/server/db';

export async function GET() {
  try {
    // Проверка подключения к базе данных
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
```

### Проверки в workflow:

1. **API Health Check** - `https://kirdro.ru/api/health` (HTTP 200)
2. **Main Page Check** - `https://kirdro.ru/` (HTTP 200)
3. **Content Validation** - проверка что не показывает "Hello World!"
4. **Server Diagnostics** - логи, процессы, порты при ошибках

---

## 🚀 Процесс деплоя

### Автоматический деплой:

1. **Push в main ветку** → триггерит workflow
2. **TypeScript + Lint** → проверка качества кода
3. **Build Process** → сборка с переменными окружения
4. **Package Creation** → создание архива с build файлами
5. **SSH Deploy** → копирование на сервер и развертывание
6. **PM2 Reload** → обновление приложения без даунтайма
7. **Health Check** → проверка работоспособности
8. **Notifications** → уведомления о результате

### Что происходит на сервере:

```bash
# 1. Backup текущей версии
sudo cp -r /var/www/kirdro.ru /var/www/kirdro.ru.backup.$(date +%Y%m%d_%H%M%S)

# 2. Очистка старых файлов
cd /var/www/kirdro.ru
rm -rf * .* 2>/dev/null || true

# 3. Распаковка нового кода
tar -xzf /tmp/kirdro-deploy.tar.gz

# 4. Создание .env с продакшн переменными
tee .env > /dev/null <<EOF
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
# ... остальные переменные
NODE_ENV=production
PORT=3003
EOF

# 5. Установка зависимостей
bun install --production

# 6. Настройка прав
chown -R www-data:www-data /var/www/kirdro.ru
chmod 600 .env

# 7. Перезапуск через PM2
pm2 reload kirdro-portfolio || pm2 start ecosystem.config.cjs

# 8. Cleanup
rm -f /tmp/kirdro-deploy.tar.gz
```

---

## 🔧 Адаптация под другой проект

### Шаг 1: Копирование файлов

**Обязательные файлы для копирования:**
```bash
# GitHub Actions workflow
.github/workflows/deploy.yml

# PM2 configuration
ecosystem.config.cjs

# Health check endpoint
src/app/api/health/route.ts
```

### Шаг 2: Настройка workflow файла

**Изменения в `.github/workflows/deploy.yml`:**

```yaml
# Измените название приложения
name: 🚀 Deploy Your Project Name

# Обновите секреты в env секции (строки 66-78)
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
  # ... добавьте свои переменные

# Измените домен и пути (строки 190-206)
DATABASE_URL="${{ secrets.DATABASE_URL }}"
NEXTAUTH_URL="https://your-domain.com"  # ← измените домен
NODE_ENV=production
PORT=3003  # ← измените порт если нужно

# Обновите health check URL (строки 240, 257)
https://your-domain.com/api/health  # ← ваш домен
https://your-domain.com/           # ← ваш домен
```

### Шаг 3: Настройка PM2

**Обновите `ecosystem.config.cjs`:**

```javascript
module.exports = {
  apps: [{
    name: 'your-project-name',        // ← измените название
    script: 'bun',                   // или 'npm' если используете npm
    args: 'start',
    cwd: '/var/www/your-domain.com', // ← путь на сервере
    instances: 1,
    exec_mode: 'fork',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: 3003,                    // ← ваш порт
    },
    
    // Обновите пути к логам
    error_file: '/var/log/your-project/error.log',
    out_file: '/var/log/your-project/access.log', 
    log_file: '/var/log/your-project/app.log',
    time: true,
    
    // Health check URL
    health_check_url: 'http://localhost:3003/api/health',
    health_check_grace_period: 3000,
  }]
};
```

### Шаг 4: Настройка GitHub Secrets

**Добавьте в Settings → Secrets and variables → Actions:**

#### Обязательные секреты деплоя:
```bash
DEPLOY_KEY=      # SSH приватный ключ
DEPLOY_USER=     # пользователь на сервере  
DEPLOY_HOST=     # IP или домен сервера
```

#### Секреты вашего приложения:
```bash
DATABASE_URL=    # строка подключения к БД
NEXTAUTH_SECRET= # секрет для авторизации
NEXTAUTH_URL=    # URL вашего сайта
# ... добавьте свои переменные
```

### Шаг 5: Подготовка сервера

**Создание структуры на сервере:**

```bash
# Директории
sudo mkdir -p /var/www/your-domain.com
sudo mkdir -p /var/log/your-project
sudo chown -R $USER:$USER /var/www/your-domain.com
sudo chown -R $USER:$USER /var/log/your-project

# Nginx конфигурация
sudo nano /etc/nginx/sites-available/your-domain.com
```

**Nginx config для вашего домена:**
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates  
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    location / {
        proxy_pass http://localhost:3003;  # ← ваш порт
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Шаг 6: Тестирование

**Проверка настройки:**

```bash
# 1. Проверка SSH доступа
ssh your-user@your-server.com

# 2. Тестовый коммит
git add .
git commit -m "Test deploy setup"  
git push origin main

# 3. Мониторинг workflow
# Идите в GitHub → Actions и следите за выполнением

# 4. Проверка на сервере
pm2 status
curl http://localhost:3003/api/health
curl https://your-domain.com/api/health
```

---

## 🛠️ Troubleshooting

### Частые проблемы и решения:

#### 1. SSH подключение не работает
```bash
# Проверка SSH ключа
ssh -T git@github.com

# Тестирование SSH на сервер
ssh -o StrictHostKeyChecking=no user@server

# Проверка формата приватного ключа в GitHub Secrets
# Должен начинаться с -----BEGIN OPENSSH PRIVATE KEY-----
```

#### 2. Build падает с ошибкой памяти
```yaml
# В workflow файле добавьте:
- name: 🏗 Build Next.js
  run: NODE_OPTIONS="--max_old_space_size=4096" bun run build
```

#### 3. PM2 не находит приложение
```bash
# На сервере
pm2 list
pm2 describe your-app-name
pm2 logs your-app-name

# Перезапуск с нуля
pm2 delete your-app-name
pm2 start ecosystem.config.cjs
```

#### 4. Health check падает
```bash
# Проверка API endpoint
curl -v http://localhost:3003/api/health

# Проверка логов
pm2 logs your-app-name
tail -f /var/log/your-project/error.log
```

#### 5. Nginx не проксирует запросы
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Логи Nginx
tail -f /var/log/nginx/error.log
```

### Полезные команды для диагностики:

```bash
# Проверка процессов
ps aux | grep -E "(bun|next|node)"

# Проверка портов  
netstat -tlnp | grep :3003
ss -tlnp | grep :3003

# Проверка места на диске
df -h
du -sh /var/www/your-domain.com

# Системные ресурсы
htop
free -m
```

---

## 📊 Мониторинг и логи

### PM2 Dashboard:
```bash
# Веб интерфейс PM2
pm2 web

# Мониторинг в реальном времени
pm2 monit

# Статистика
pm2 show kirdro-portfolio
```

### Логи:
```bash
# PM2 логи
pm2 logs kirdro-portfolio
pm2 logs kirdro-portfolio --lines 100

# Системные логи
tail -f /var/log/kirdro/app.log
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# GitHub Actions логи
# Доступны в веб интерфейсе GitHub → Actions → Workflow run
```

### Метрики:
- **Health Check API** - мониторинг работоспособности
- **PM2 Status** - статус процесса и ресурсы
- **Nginx Logs** - трафик и ошибки
- **System Metrics** - CPU, память, диск

---

## 🔒 Безопасность

### Рекомендации:

#### SSH Security:
```bash
# Отключение пароля SSH (только ключи)
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PubkeyAuthentication yes

sudo systemctl restart sshd
```

#### Firewall:
```bash
# UFW настройка
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP  
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 3003/tcp  # Блокировка прямого доступа к приложению
```

#### Environment Variables:
- ✅ Никогда не коммитить секреты в Git
- ✅ Использовать GitHub Secrets для всех паролей
- ✅ Файл .env должен быть в .gitignore
- ✅ Права на .env файл: 600 (только владелец читает)

#### SSL/HTTPS:
```bash
# Let's Encrypt сертификат
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run  # тест автообновления
```

---

## 📈 Оптимизация производительности

### Build оптимизации:

#### Next.js config (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация сборки
  swcMinify: true,
  compress: true,
  
  // Статические файлы
  trailingSlash: false,
  poweredByHeader: false,
  
  // Экспериментальные функции
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'disabled',
          generateStatsFile: true,
        })
      );
    }
    return config;
  },
};
```

### PM2 оптимизации:

#### Cluster mode (для высоконагруженных приложений):
```javascript
module.exports = {
  apps: [{
    name: 'your-app',
    script: 'bun',
    args: 'start',
    instances: 'max',           // Использовать все CPU ядра
    exec_mode: 'cluster',       // Кластерный режим
    max_memory_restart: '500M', // Перезапуск при 500MB
    node_args: '--max-old-space-size=1024',
    
    // Graceful reload
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
};
```

### Nginx оптимизации:

```nginx
server {
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3003;
    }
}
```

---

## 🎯 Заключение

Эта система деплоя обеспечивает:

- ✅ **Полная автоматизация** - от коммита до продакшна
- ✅ **Безопасность** - SSH ключи, секреты, права доступа
- ✅ **Надежность** - backup, health checks, graceful reload
- ✅ **Мониторинг** - логи, метрики, уведомления
- ✅ **Масштабируемость** - PM2 cluster, Nginx load balancing
- ✅ **Производительность** - оптимизация сборки и кэширование

**Адаптация под новый проект занимает ~30 минут** при правильной подготовке сервера и настройке секретов.

---

*Документация создана автоматически Claude Code*  
*Версия: 1.0 | Дата: 9 сентября 2025г.*