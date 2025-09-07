# 🔐 Руководство по авторизации через Яндекс в проекте KIRDRO Admin

## 📋 Обзор

Данный проект использует **NextAuth.js v4** с кастомным провайдером **Яндекс OAuth** для авторизации в админ-панели портфолио. Реализована строгая система безопасности с доступом только для администратора `kirdro@yandex.ru`.

## 🏗️ Архитектура авторизации

### 1. Основные компоненты

```
src/
├── server/auth.ts          # Конфигурация NextAuth.js
├── middleware.ts           # Middleware для защиты маршрутов  
├── app/auth/               # Страницы авторизации
│   ├── signin/page.tsx     # Страница входа
│   └── error/page.tsx      # Страница ошибок авторизации
└── app/api/auth/           # API маршруты NextAuth.js
    └── [...nextauth]/
```

### 2. Стратегия авторизации

- **JWT-based** авторизация (без использования БД для сессий)
- **Единственный провайдер**: Яндекс OAuth
- **Строгое ограничение**: доступ только для `kirdro@yandex.ru`
- **Время жизни**: 24 часа для JWT токенов и сессий

## ⚙️ Конфигурация NextAuth.js

### Файл: `src/server/auth.ts`

#### Кастомный Яндекс провайдер

```typescript
const YandexProvider = {
  id: "yandex",
  name: "Yandex", 
  type: "oauth" as const,
  authorization: {
    url: "https://oauth.yandex.ru/authorize",
    params: {
      scope: "login:email login:info",
      response_type: "code",
    },
  },
  token: "https://oauth.yandex.ru/token",
  userinfo: "https://login.yandex.ru/info?format=json",
  clientId: process.env.AUTH_YANDEX_ID!,
  clientSecret: process.env.AUTH_YANDEX_SECRET!,
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.display_name || profile.real_name,
      email: profile.default_email,
      image: profile.is_avatar_empty 
        ? null 
        : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`,
    };
  },
};
```

#### Ключевые особенности конфигурации

1. **Без Prisma адаптера** - используется только JWT
2. **Стратегия сессии**: JWT
3. **Время жизни**: 24 часа
4. **Подробное логирование** всех событий авторизации

### Callbacks (колбэки)

#### signIn callback - контроль доступа
```typescript
async signIn({ user, account, profile }) {
  // Разрешаем доступ ТОЛЬКО для kirdro@yandex.ru
  if (user.email !== "kirdro@yandex.ru") {
    console.log(`❌ Заблокирован доступ для: ${user.email}`);
    return false;
  }
  return true;
}
```

#### jwt callback - настройка токена
```typescript
async jwt({ token, user, account }) {
  if (user) {
    // Назначаем роль администратора напрямую
    token.role = user.email === "kirdro@yandex.ru" ? "ADMIN" : "USER";
  }
  return token;
}
```

#### session callback - настройка сессии
```typescript
async session({ session, token }) {
  if (token) {
    session.user.id = token.sub!;
    session.user.role = token.role as string;
  }
  return session;
}
```

## 🛡️ Middleware для защиты маршрутов

### Файл: `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Исключения (публичные пути)
  const isPublicPath = 
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico';

  if (isPublicPath) return NextResponse.next();

  // Проверка авторизации
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}
```

**Матчер применяется ко всем маршрутам:**
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## 🎨 Пользовательский интерфейс

### Страница входа: `src/app/auth/signin/page.tsx`

#### Дизайн в киберпанк стилистике
- **Цветовая схема**: Темный фон (#0B0D0E) + неоновый зеленый (#00FF99)
- **Эффекты**: Сканлайны, глитч-кнопки, световые эффекты
- **Типографика**: Моноширинный шрифт для терминального вида

#### Функциональность
```typescript
// Вход через OAuth провайдер (Яндекс)
const handleProviderSignIn = async (providerId: string) => {
  await signIn(providerId, { callbackUrl: "/" });
};

// Проверка email перед входом
const handleEmailSignIn = async (e: React.FormEvent) => {
  if (!email || email !== "kirdro@yandex.ru") {
    alert("⛔ Доступ разрешен только для kirdro@yandex.ru");
    return;
  }
  // ... отправка email magic link
};
```

#### UI компоненты
- **Форма входа по email** (в данный момент отключена)
- **Кнопка "Вход через Яндекс"** - основной способ авторизации
- **Предупреждение безопасности** - информирует о логировании
- **Автоматический редирект** - если пользователь уже авторизован

## 🔧 Переменные окружения

### Требуемые переменные в `.env`

```bash
# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"  # или ваш production URL

# Yandex OAuth приложение
AUTH_YANDEX_ID="your-yandex-app-id"
AUTH_YANDEX_SECRET="your-yandex-app-secret"

# Email провайдер (отключен, но можно активировать)
# EMAIL_SERVER_HOST="smtp.yandex.ru"
# EMAIL_SERVER_PORT="465" 
# EMAIL_SERVER_USER="your-email@yandex.ru"
# EMAIL_SERVER_PASSWORD="your-app-password"
# EMAIL_FROM="your-email@yandex.ru"
```

## 📱 Настройка Яндекс OAuth приложения

### 1. Создание приложения в Яндекс OAuth

1. Перейдите на https://oauth.yandex.ru/
2. Нажмите "Зарегистрировать новое приложение"
3. Заполните форму:
   - **Название**: KIRDRO Admin Panel
   - **Платформы**: Веб-сервисы
   - **Redirect URI**: 
     - Development: `http://localhost:3000/api/auth/callback/yandex`
     - Production: `https://admin.kirdro.ru/api/auth/callback/yandex`

### 2. Настройки прав доступа

Выберите необходимые права:
- ✅ `login:email` - доступ к email адресу
- ✅ `login:info` - доступ к основной информации профиля

### 3. Получение учетных данных

После создания приложения получите:
- **ID приложения** → `AUTH_YANDEX_ID`
- **Пароль приложения** → `AUTH_YANDEX_SECRET`

## 🔒 Система безопасности

### Многоуровневая защита

1. **OAuth уровень**: проверка через Яндекс OAuth
2. **Callback уровень**: проверка email в `signIn` callback
3. **Middleware уровень**: проверка JWT токена на каждом запросе
4. **UI уровень**: дополнительная проверка email в форме

### Логирование безопасности

```typescript
// Все события авторизации логируются
events: {
  async signIn({ user, account }) {
    console.log(`📅 SignIn event: ${user.email} via ${account?.provider}`);
  },
  async signOut({ token }) {
    console.log(`👋 SignOut event: ${token?.email}`);
  },
  // ... другие события
}
```

### Настройки куки

```typescript
cookies: {
  sessionToken: {
    name: "next-auth.session-token",
    options: {
      httpOnly: true,        // Защита от XSS
      sameSite: "lax",       // CSRF protection  
      path: "/",
      secure: process.env.NODE_ENV === "production",  // HTTPS в продакшене
    },
  },
}
```

## 🚀 Deployment (Деплой)

### Production настройки

1. **NEXTAUTH_URL** - должен указывать на production домен
2. **Yandex OAuth Redirect URI** - добавить production URL
3. **NEXTAUTH_SECRET** - использовать криптографически стойкий секрет
4. **SSL/HTTPS** - обязательно для production

### Рекомендуемые команды

```bash
# Установка зависимостей
bun install

# Запуск в режиме разработки  
bun dev

# Сборка для продакшена
bun build

# Запуск продакшен сервера
bun start
```

## 🐛 Troubleshooting (Решение проблем)

### Частые ошибки

#### 1. "Configuration error" 
**Причина**: Неправильные переменные окружения
**Решение**: Проверить `.env` файл и перезапустить сервер

#### 2. "Redirect URI mismatch"
**Причина**: URL в Яндекс OAuth не совпадает с фактическим
**Решение**: Обновить Redirect URI в настройках приложения

#### 3. "Access denied"
**Причина**: Попытка входа с неразрешенным email
**Решение**: Это нормальное поведение, доступ только для `kirdro@yandex.ru`

### Отладка

```typescript
// Включить подробное логирование NextAuth.js
// В .env добавить:
NEXTAUTH_DEBUG=true
```

## 📊 Мониторинг

### События которые логируются

- ✅ Все попытки входа (успешные и неуспешные)
- ✅ Выходы из системы  
- ✅ Создание/обновление пользователей
- ✅ Доступ к сессиям
- ✅ Связывание аккаунтов

### Пример логов

```
🔐 SignIn callback started for: kirdro@yandex.ru
📋 Account provider: yandex
✅ Разрешен доступ для: kirdro@yandex.ru (45ms)
🎫 JWT callback started for: kirdro@yandex.ru
🎭 Role assigned: ADMIN (fast mode)
📝 Session callback started for: kirdro@yandex.ru
🎪 Final session: {"user":{"id":"..","email":"kirdro@yandex.ru","role":"ADMIN"}}
```

## 🔄 Возможные улучшения

1. **Двухфакторная аутентификация** - дополнительный уровень безопасности
2. **Аудит логи в БД** - постоянное хранение событий безопасности  
3. **Rate limiting** - защита от брутфорс атак
4. **IP whitelist** - дополнительное ограничение по IP адресам
5. **Session management** - управление активными сессиями

---

**📝 Примечание**: Данная система авторизации спроектирована специально для админ-панели с единственным пользователем и максимальным уровнем безопасности.