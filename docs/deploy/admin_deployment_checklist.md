# 📋 Чек-лист настройки деплоя админ-панели на сервер 176.98.176.195

## 🎯 Цель
Настроить деплой админ-панели kirdro.ru на существующем сервере без нарушения работы продакшн сайта.

## ⚙️ Параметры деплоя
- **Сервер**: 176.98.176.195 (тот же что у продакшна)
- **Домен**: admin.kirdro.ru  
- **Порт**: 3005 (избегаем конфликтов с :3003 продакшн)
- **Контейнер**: kirdro-portfolio-admin
- **Ветка деплоя**: main
- **Окружение**: admin

---

## ✅ Фаза 1: Исследование сервера (ВЫПОЛНЕНО)

### 1.1 Анализ системы
- [x] Подключение к серверу `ssh root@176.98.176.195`
- [x] Проверка ресурсов: 27GB свободно, 1.2GB RAM доступно
- [x] Анализ запущенных контейнеров (только kirdro-portfolio-prod на :3003)
- [x] Проверка свободных портов (:3005 свободен ✅)
- [x] Изучение структуры Caddy конфигурации

### 1.2 Состояние безопасности
- [x] Caddy работает стабильно с SSL сертификатами
- [x] Firewall настроен (порты 80, 443 открыты)
- [x] Docker daemon активен и работает

---

## ✅ Фаза 2: Подготовка конфигураций (В ПРОЦЕССЕ)

### 2.1 Структура директорий
- [x] Создание `/var/docker/kirdro-admin/`
- [x] Создание `/var/logs/kirdro-admin/` 
- [x] Установка прав доступа для логов Caddy

### 2.2 Переменные окружения
- [x] Создание `.env.admin` с корректными настройками:
  - NODE_ENV=production
  - NEXTAUTH_URL=https://admin.kirdro.ru
  - PORT=3005
  - DATABASE_URL (та же база что у продакшна)
- [x] Установка безопасных прав (chmod 600)

### 2.3 Обновление Caddy конфигурации
- [ ] Добавить секцию для admin.kirdro.ru в Caddyfile
- [ ] Настроить reverse_proxy на localhost:3005
- [ ] Добавить логирование в /var/logs/kirdro-admin/
- [ ] Валидация конфигурации и перезапуск Caddy

---

## 🔐 Фаза 3: SSH и безопасность 

### 3.1 Создание SSH ключей для GitHub Actions
```bash
# НА ЛОКАЛЬНОЙ МАШИНЕ
ssh-keygen -t ed25519 -C "github-actions-admin-deploy" -f ~/.ssh/kirdro_admin_deploy -N ""
ssh-copy-id -i ~/.ssh/kirdro_admin_deploy.pub root@176.98.176.195
ssh -i ~/.ssh/kirdro_admin_deploy root@176.98.176.195 "echo 'SSH ключ работает!'"
```

### 3.2 GitHub Secrets
- [ ] ADMIN_DEPLOY_HOST = 176.98.176.195
- [ ] ADMIN_DEPLOY_USER = root  
- [ ] ADMIN_DEPLOY_KEY = [приватный ключ]

---

## 🚀 Фаза 4: GitHub Actions

### 4.1 Workflow файл
- [ ] Создать `.github/workflows/deploy-admin.yml`
- [ ] Настроить этапы:
  - TypeScript check
  - Docker build (образ kirdro-portfolio-admin:latest)
  - Deploy на порт 3005
  - Health check (https://admin.kirdro.ru/api/health)

### 4.2 Docker деплой скрипт
```bash
# В workflow - команды для деплоя
docker stop kirdro-portfolio-admin || true
docker rm kirdro-portfolio-admin || true
docker run -d \
  --name kirdro-portfolio-admin \
  --restart unless-stopped \
  -p 127.0.0.1:3005:3005 \
  --env-file /var/docker/kirdro-admin/.env.admin \
  kirdro-portfolio-admin:latest
```

---

## 🌐 Фаза 5: DNS и OAuth

### 5.1 DNS настройки
- [ ] Создать A-запись: admin.kirdro.ru → 176.98.176.195
- [ ] Проверить распространение DNS: `dig admin.kirdro.ru`

### 5.2 Yandex OAuth обновление  
- [ ] Добавить redirect URI: `https://admin.kirdro.ru/api/auth/callback/yandex`
- [ ] Проверить OAuth провайдеры

---

## 🧪 Фаза 6: Тестирование

### 6.1 Базовое тестирование
- [ ] Первый деплой через GitHub Actions
- [ ] Проверка запуска контейнера: `docker ps | grep kirdro-admin`
- [ ] SSL сертификат получен автоматически
- [ ] Доступность https://admin.kirdro.ru

### 6.2 Функциональное тестирование
- [ ] Авторизация через Yandex работает
- [ ] Подключение к базе данных успешно
- [ ] API endpoints отвечают
- [ ] Продакшн сайт не затронут

---

## ⚠️ Критические предупреждения

### 🚨 НЕ ТРОГАТЬ:
- Контейнер kirdro-portfolio-prod (порт 3003)
- Основную часть Caddyfile для kirdro.ru
- Директории /var/docker/kirdro/
- Любые системные настройки продакшна

### ✅ БЕЗОПАСНО ИЗМЕНЯТЬ:
- Добавлять новые секции в Caddyfile
- Создавать /var/docker/kirdro-admin/
- Добавлять SSH ключи в authorized_keys
- Создавать GitHub Actions workflows

---

## 📊 Финальная конфигурация

После завершения будет работать:
```
┌─ Production ─────────────────┐  ┌─ Admin Panel ──────────────────┐
│ https://kirdro.ru           │  │ https://admin.kirdro.ru        │
│ Container: kirdro-prod      │  │ Container: kirdro-admin        │  
│ Port: :3003                 │  │ Port: :3005                    │
│ Branch: main                │  │ Branch: main                   │
└─────────────────────────────┘  └────────────────────────────────┘
                   │
                   └─ Shared PostgreSQL DB (109.196.100.98:5432)
```

---

## 📝 Примечания
- Каждая фаза должна завершаться успешно перед переходом к следующей
- При любых проблемах - проверить логи: `journalctl -u caddy -f` и `docker logs kirdro-portfolio-admin -f`
- Тестировать на каждом этапе, не накапливать изменения

---

*Создано: 11.09.2025*  
*Сервер: 176.98.176.195 (Ubuntu)*