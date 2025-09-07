# 📋 ПОЛНАЯ ДОКУМЕНТАЦИЯ ПРОЕКТА kirdro.ru ДЛЯ СОЗДАНИЯ АДМИНКИ

> **🎯 Цель документа**: Полная техническая документация для создания отдельного проекта администрирования портфолио-сайта kirdro.ru на базе create-t3-app с идентичным дизайном и подключением к той же базе данных.

---

## 🚀 ОБЗОР ПРОЕКТА

### Основная информация
- **Проект**: Портфолио-сайт разработчика Кирилла Дроздова (Kirdro)
- **Основной домен**: https://kirdro.ru  
- **Админ-панель**: должна быть на https://admin.kirdro.ru
- **Текущий статус**: 7 этапов разработки завершены, полнофункциональный сайт

### Функциональность основного сайта
- ✅ Главная страница с 3D аватаром и Matrix эффектами
- ✅ Страницы: О себе, Проекты, Контакты 
- ✅ Интерактивные функции: Общий чат, ИИ чат, Терминал
- ✅ Аутентификация через NextAuth.js v5 (Email + Яндекс OAuth)
- ✅ Мультиязычность (RU/EN/中文)
- ✅ Киберпанк дизайн-система с неоновыми эффектами
- ✅ Адаптивность и производительность

---

## 🗄️ БАЗА ДАННЫХ И ПОДКЛЮЧЕНИЕ

### Параметры подключения PostgreSQL
```
Host: 109.196.100.98
Port: 5432
User: gen_user
Password: W{I9FH,fd#YU#E
Database: default_db
DATABASE_URL: "postgresql://gen_user:W{I9FH,fd#YU#E@109.196.100.98:5432/default_db"
```

### ⚠️ КРИТИЧЕСКИ ВАЖНО - СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
**НЕЛЬЗЯ УДАЛЯТЬ СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ!** В базе уже работают системы:

#### Основные пользовательские системы:
- `users` (15 записей) - система аутентификации существующих пользователей
- `teams` - система управления командами
- `files` - система загрузки файлов
- `products` - система управления продуктами

#### Финансовые системы:
- `user_balances` - балансы пользователей
- `balance_transactions` - транзакции
- `electricity_bills`, `electricity_readings`, `tariffs` - система учёта электроэнергии

#### Система управления временем:
- `task_projects`, `time_tasks`, `time_entries` - управление задачами и временем

#### Таблицы NextAuth (для портфолио):
- `User` - пользователи портфолио (с полем `role: UserRole`)
- `Account`, `Session`, `VerificationToken` - NextAuth интеграция

#### Таблицы портфолио-сайта:
- `ChatMessage` - общий чат
- `AiChatMessage` - ИИ чат сообщения  
- `Project` - проекты портфолио
- `Skill` - навыки разработчика
- `ContactForm` - обращения через контактную форму
- `Settings` - системные настройки

---

## 🎨 ДИЗАЙН-СИСТЕМА (Dark Neon Cyberpunk)

### Цветовая схема
```css
/* Основные цвета */
--color-bg: #0B0D0E;           /* Основной фон */
--color-bg-subtle: #0F1214;    /* Фон карточек/панелей */
--color-bg-hover: #1A1F22;     /* Фон при наведении */

/* Текст */
--color-text-base: #E6F4EF;    /* Основной текст */
--color-text-mute: #A6C7BB;    /* Второстепенный текст */
--color-text-dim: #6E8E84;     /* Приглушённый текст */

/* Неоновые акценты */  
--color-neon-green: #00FF99;   /* Основной акцент */
--color-neon-cyan: #00FFCC;    /* Вторичный акцент */
--color-neon-soft: #66FFB2;    /* Мягкий акцент */

/* Линии и границы */
--color-line: #1C2A25;         /* Границы элементов */
```

### Шрифты
```css
/* Google Fonts - обязательно подключить */
@import url('https://fonts.googleapis.com/css2?family=Jura:wght@300;400;500;600;700&family=VT323&display=swap');

/* Основной UI шрифт */
font-family: 'Jura', ui-sans-serif, system-ui;

/* Терминальный шрифт */
font-family: 'VT323', ui-monospace, SFMono-Regular;
```

### Ключевые CSS эффекты
```css
/* Фаски (bevel) - характерная черта дизайна */
.bevel {
  position: relative;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-line);
}

.bevel::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(0,255,153,.15);
  clip-path: inherit;
}

/* Неоновое свечение текста */
.glyph-glow {
  text-shadow: 
    0 0 6px rgba(0,255,153,.35),
    0 0 12px rgba(0,255,153,.25);
}

/* Тень свечения для элементов */
.shadow-neon {
  box-shadow: 
    0 0 0.5rem rgba(0,255,153,.35), 
    0 0 1rem rgba(0,255,153,.25);
}

/* Сканлайн эффект для терминала */
.scanline {
  position: relative;
  overflow: hidden;
}

.scanline::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,.03), rgba(255,255,255,.03) 2px,
    transparent 2px, transparent 4px
  );
  pointer-events: none;
}

/* Glitch эффект */
.btn-glitch {
  position: relative;
  isolation: isolate;
}

.btn-glitch::before,
.btn-glitch::after {
  content: "";
  position: absolute;
  inset: 0;
  mix-blend-mode: screen;
  opacity: 0;
  transition: opacity 0.15s;
}

.btn-glitch::before {
  box-shadow: 2px 0 0 var(--color-neon-green);
  transform: translateX(-1px);
}

.btn-glitch::after {
  box-shadow: -2px 0 0 var(--color-neon-cyan);
  transform: translateX(1px);
}

.btn-glitch:hover::before,
.btn-glitch:hover::after {
  opacity: 0.35;
}
```

### TailwindCSS конфигурация
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", 
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Кастомная цветовая схема
        bg: {
          DEFAULT: "#0B0D0E",
          subtle: "#0F1214", 
          hover: "#1A1F22",
        },
        text: {
          base: "#E6F4EF",
          mute: "#A6C7BB",
          dim: "#6E8E84",
        },
        neon: {
          green: "#00FF99",
          cyan: "#00FFCC", 
          soft: "#66FFB2",
        },
        line: "#1C2A25",
      },
      fontFamily: {
        sans: ["Jura", "ui-sans-serif", "system-ui"],
        mono: ["VT323", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        neon: "0 0 0.5rem rgba(0,255,153,.35), 0 0 1rem rgba(0,255,153,.25)",
      },
      transitionTimingFunction: {
        outExpo: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    },
  },
  plugins: [],
};

export default config;
```

---

## 🛠️ ТЕХНИЧЕСКИЙ СТЕК

### Основа проекта
```bash
# Создание проекта
bunx create-t3-app@latest admin-kirdro

# Выбрать опции:
# ✅ App Router
# ✅ tRPC
# ✅ Prisma
# ✅ NextAuth.js
# ✅ TailwindCSS  
# ✅ TypeScript
# ✅ ESLint
# ❌ Next.js src/ directory (НЕ выбирать!)
```

### Основные зависимости
```json
{
  "dependencies": {
    "@next/font": "^14.0.0",
    "@prisma/client": "^5.0.0",
    "@t3-oss/env-nextjs": "^0.7.0", 
    "@tanstack/react-query": "^4.0.0",
    "@trpc/client": "^10.0.0",
    "@trpc/next": "^10.0.0",
    "@trpc/react-query": "^10.0.0",
    "@trpc/server": "^10.0.0",
    "next": "^14.0.0",
    "next-auth": "5.0.0-beta.4",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Environment Variables (.env)
```bash
# База данных  
DATABASE_URL="postgresql://gen_user:W{I9FH,fd#YU#E@109.196.100.98:5432/default_db"

# NextAuth
NEXTAUTH_SECRET="bwM9W/s5xXMXGOfq0ldklrpg+caLArSx2g2ZlYO8kAY="
NEXTAUTH_URL="https://admin.kirdro.ru"
AUTH_TRUST_HOST="true"

# NextAuth провайдеры  
AUTH_YANDEX_ID="9a55e49a40b143e6a5538367a4b9918d"
AUTH_YANDEX_SECRET="80343452184c4b49836de3e0d4b7249c"

# Email провайдер (Яндекс SMTP)
EMAIL_SERVER_HOST="smtp.yandex.ru"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER="kirdro@yandex.ru" 
EMAIL_SERVER_PASSWORD="zffknxumqhjexkme"
EMAIL_FROM="kirdro@yandex.ru"

# Groq API (для ИИ, опционально)
GROQ_API_KEY="your-groq-api-key-here"
```

---

## 🔐 СИСТЕМА АУТЕНТИФИКАЦИИ

### Ограничения доступа
**КРИТИЧЕСКИ ВАЖНО**: Доступ к админке разрешён ТОЛЬКО для `kirdro@yandex.ru`

### NextAuth.js конфигурация
```typescript
// src/server/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import YandexProvider from "next-auth/providers/yandex";
import EmailProvider from "next-auth/providers/email";
import { db } from "~/server/db";
import { env } from "~/env";

const ADMIN_EMAIL = "kirdro@yandex.ru";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true, // Разрешить работу с admin.kirdro.ru
  
  providers: [
    YandexProvider({
      clientId: env.AUTH_YANDEX_ID,
      clientSecret: env.AUTH_YANDEX_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],
  
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
});
```

### Middleware для защиты админки
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '~/server/auth';

const ADMIN_EMAIL = "kirdro@yandex.ru";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Все маршруты админки требуют авторизации
  if (pathname.startsWith("/")) {
    const session = await auth();
    
    // Проверяем строго: только kirdro@yandex.ru с ролью ADMIN
    const isAdmin = session?.user?.role === "ADMIN" && 
                   session?.user?.email === ADMIN_EMAIL;
    
    if (!isAdmin) {
      const signInUrl = new URL('/api/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs' // Важно! Не Edge Runtime
};
```

---

## 📊 ДАННЫЕ ДЛЯ УПРАВЛЕНИЯ В АДМИНКЕ

### 1. Пользователи (таблица User)
**Что управляем:**
- Просмотр всех пользователей портфолио
- Изменение ролей (USER/ADMIN) 
- Блокировка/активация аккаунтов
- Статистика регистраций

**Ключевые поля:**
- `id` - UUID пользователя
- `name` - имя пользователя  
- `email` - email (уникальный)
- `role` - роль (USER/ADMIN)
- `emailVerified` - дата подтверждения email
- `image` - аватар пользователя

### 2. Проекты портфолио (таблица Project)
**Что управляем:**
- Создание/редактирование/удаление проектов
- Управление статусом "featured" (рекомендуемые)
- Загрузка изображений проектов
- Теги и категоризация

**Ключевые поля:**
- `title` - название проекта
- `description` - описание проекта (Text)
- `imageUrl` - URL изображения  
- `demoUrl` - ссылка на демо
- `githubUrl` - ссылка на GitHub
- `tags` - массив тегов
- `featured` - флаг рекомендуемого проекта

### 3. Навыки (таблица Skill)
**Что управляем:**
- Добавление/редактирование навыков
- Категоризация по типам
- Уровень владения (1-100)
- Иконки навыков

**Ключевые поля:**
- `name` - название навыка (уникальное)
- `category` - категория ("Frontend", "Backend", etc.)
- `level` - уровень 1-100
- `icon` - URL иконки или код

### 4. Сообщения чатов
**Что управляем:**
- **Общий чат (ChatMessage)**: модерация, удаление сообщений
- **ИИ чат (AiChatMessage)**: просмотр диалогов, статистика использования

**Общий чат поля:**
- `content` - текст сообщения
- `userId` - автор сообщения
- `createdAt` - время отправки

**ИИ чат поля:**
- `content` - текст сообщения
- `userId` - пользователь
- `isAI` - флаг сообщения от ИИ
- `modelName` - используемая модель ИИ

### 5. Контактные обращения (таблица ContactForm)
**Что управляем:**
- Просмотр обращений через контактную форму
- Изменение статуса обработки
- Ответы на обращения
- Статистика обращений

**Ключевые поля:**
- `name` - имя отправителя
- `email` - email отправителя  
- `message` - текст обращения
- `status` - статус ("new", "in_progress", "resolved")

### 6. Системные настройки (таблица Settings)
**Что управляем:**
- Глобальные настройки сайта
- Конфигурация функций
- Настройки интеграций

**Структура:**
- `key` - ключ настройки (уникальный)
- `value` - значение (JSON)

### 7. Статистика и аналитика
**Что отслеживаем:**
- Количество пользователей
- Активность в чатах
- Популярные проекты
- Обращения по периодам
- Использование ИИ чата

---

## 🏗️ АРХИТЕКТУРА АДМИН-ПАНЕЛИ

### Структура страниц
```
src/app/
├── (auth)/                    # Группа авторизации
│   ├── signin/
│   └── layout.tsx
├── (dashboard)/               # Главная группа админки
│   ├── page.tsx              # Dashboard - главная
│   ├── users/                # Управление пользователями
│   │   ├── page.tsx          # Список пользователей
│   │   └── [id]/            # Редактирование пользователя
│   │       └── page.tsx
│   ├── projects/             # Управление проектами  
│   │   ├── page.tsx          # Список проектов
│   │   ├── create/           # Создание проекта
│   │   │   └── page.tsx
│   │   └── [id]/            # Редактирование проекта
│   │       └── page.tsx
│   ├── skills/              # Управление навыками
│   │   ├── page.tsx
│   │   └── create/
│   │       └── page.tsx
│   ├── chat/                # Модерация чатов
│   │   ├── page.tsx
│   │   ├── general/         # Общий чат
│   │   └── ai/              # ИИ чат
│   ├── contacts/            # Контактные обращения
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── settings/            # Системные настройки
│   │   └── page.tsx
│   └── layout.tsx           # Layout админки
├── api/                     # API Routes
│   ├── auth/
│   └── trpc/
├── globals.css
└── layout.tsx              # Root layout
```

### Компоненты админки
```
src/components/
├── admin/                   # Админ компоненты
│   ├── layout/
│   │   ├── AdminSidebar.tsx    # Боковое меню
│   │   ├── AdminHeader.tsx     # Верхняя панель  
│   │   └── AdminBreadcrumbs.tsx # Навигационные крошки
│   ├── dashboard/
│   │   ├── StatsCard.tsx       # Карточки статистики
│   │   ├── RecentActivity.tsx   # Последняя активность
│   │   └── QuickActions.tsx    # Быстрые действия
│   ├── users/
│   │   ├── UsersTable.tsx      # Таблица пользователей
│   │   ├── UserForm.tsx        # Форма пользователя
│   │   └── UserStatusBadge.tsx # Статус пользователя
│   ├── projects/
│   │   ├── ProjectsGrid.tsx    # Сетка проектов
│   │   ├── ProjectForm.tsx     # Форма проекта
│   │   └── ProjectCard.tsx     # Карточка проекта
│   ├── shared/
│   │   ├── DataTable.tsx       # Универсальная таблица
│   │   ├── FormField.tsx       # Поле формы
│   │   ├── StatusBadge.tsx     # Статус badge
│   │   └── AdminModal.tsx      # Модальное окно
│   └── ui/                     # UI компоненты
│       ├── Button.tsx          # Кнопки
│       ├── Input.tsx           # Поля ввода
│       ├── Select.tsx          # Выпадающие списки
│       └── Card.tsx           # Карточки
```

### tRPC роутеры для админки
```typescript
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  // Админ роутеры
  admin: createTRPCRouter({
    // Пользователи
    users: createTRPCRouter({
      getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.user.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                chatMessages: true,
                projects: true,
              }
            }
          }
        });
      }),
      
      getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
          return ctx.db.user.findUnique({
            where: { id: input.id },
            include: {
              chatMessages: true,
              projects: true,
            }
          });
        }),
      
      updateRole: adminProcedure
        .input(z.object({ 
          id: z.string(),
          role: z.enum(['USER', 'ADMIN']) 
        }))
        .mutation(async ({ ctx, input }) => {
          return ctx.db.user.update({
            where: { id: input.id },
            data: { role: input.role }
          });
        }),
    }),
    
    // Проекты
    projects: createTRPCRouter({
      getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.project.findMany({
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        });
      }),
      
      create: adminProcedure
        .input(projectCreateSchema)
        .mutation(async ({ ctx, input }) => {
          return ctx.db.project.create({
            data: {
              ...input,
              userId: ctx.session.user.id,
            }
          });
        }),
      
      update: adminProcedure
        .input(projectUpdateSchema)
        .mutation(async ({ ctx, input }) => {
          return ctx.db.project.update({
            where: { id: input.id },
            data: input
          });
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
          return ctx.db.project.delete({
            where: { id: input.id }
          });
        }),
    }),
    
    // Навыки
    skills: createTRPCRouter({
      getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.skill.findMany({
          orderBy: [{ category: 'asc' }, { name: 'asc' }]
        });
      }),
      
      create: adminProcedure
        .input(skillCreateSchema)
        .mutation(async ({ ctx, input }) => {
          return ctx.db.skill.create({ data: input });
        }),
      
      update: adminProcedure
        .input(skillUpdateSchema)
        .mutation(async ({ ctx, input }) => {
          return ctx.db.skill.update({
            where: { id: input.id },
            data: input
          });
        }),
    }),
    
    // Контактные формы
    contacts: createTRPCRouter({
      getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.contactForm.findMany({
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        });
      }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.string(),
          status: z.enum(['new', 'in_progress', 'resolved'])
        }))
        .mutation(async ({ ctx, input }) => {
          return ctx.db.contactForm.update({
            where: { id: input.id },
            data: { status: input.status }
          });
        }),
    }),
    
    // Чаты
    chat: createTRPCRouter({
      getGeneralMessages: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          cursor: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
          return ctx.db.chatMessage.findMany({
            take: input.limit,
            cursor: input.cursor ? { id: input.cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
          });
        }),
      
      getAiMessages: adminProcedure
        .input(z.object({
          limit: z.number().default(50),
          cursor: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
          return ctx.db.aiChatMessage.findMany({
            take: input.limit,
            cursor: input.cursor ? { id: input.cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
          });
        }),
      
      deleteMessage: adminProcedure
        .input(z.object({
          id: z.string(),
          type: z.enum(['general', 'ai'])
        }))
        .mutation(async ({ ctx, input }) => {
          if (input.type === 'general') {
            return ctx.db.chatMessage.delete({
              where: { id: input.id }
            });
          } else {
            return ctx.db.aiChatMessage.delete({
              where: { id: input.id }
            });
          }
        }),
    }),
    
    // Dashboard статистика
    dashboard: createTRPCRouter({
      getStats: adminProcedure.query(async ({ ctx }) => {
        const [
          userCount,
          projectCount,
          featuredProjectCount,
          generalMessageCount,
          aiMessageCount,
          newContactCount
        ] = await Promise.all([
          ctx.db.user.count(),
          ctx.db.project.count(),
          ctx.db.project.count({ where: { featured: true } }),
          ctx.db.chatMessage.count(),
          ctx.db.aiChatMessage.count(),
          ctx.db.contactForm.count({ where: { status: 'new' } })
        ]);
        
        return {
          users: userCount,
          projects: projectCount,
          featuredProjects: featuredProjectCount,
          generalMessages: generalMessageCount,
          aiMessages: aiMessageCount,
          newContacts: newContactCount
        };
      }),
    }),
  }),
});

// Админ процедура (только для kirdro@yandex.ru)
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  if (ctx.session.user.email !== 'kirdro@yandex.ru' || 
      ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return next({
    ctx: {
      session: ctx.session,
      db: ctx.db,
    },
  });
});
```

---

## 📱 UI КОМПОНЕНТЫ АДМИНКИ

### AdminLayout (главный layout)
```typescript
// src/components/admin/layout/AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Боковое меню */}
      <AdminSidebar />
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6 bg-bg">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### AdminSidebar (боковое меню)
```typescript
// src/components/admin/layout/AdminSidebar.tsx
export function AdminSidebar() {
  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      href: '/users',
      label: 'Пользователи', 
      icon: '👥',
    },
    {
      href: '/projects',
      label: 'Проекты',
      icon: '📁',
    },
    {
      href: '/skills',
      label: 'Навыки',
      icon: '⚡',
    },
    {
      href: '/chat',
      label: 'Чаты',
      icon: '💬',
    },
    {
      href: '/contacts',
      label: 'Обращения',
      icon: '📮',
    },
    {
      href: '/settings',
      label: 'Настройки',
      icon: '⚙️',
    },
  ];
  
  return (
    <aside className="w-64 min-h-screen bevel bg-bg-subtle border-r border-line">
      <div className="p-6">
        {/* Логотип */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-neon-green glyph-glow">
            KIRDRO ADMIN
          </h1>
          <p className="text-sm text-text-mute mt-1">
            Панель управления
          </p>
        </div>
        
        {/* Навигационное меню */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <AdminNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>
        
        {/* Быстрые действия */}
        <div className="mt-8 pt-6 border-t border-line">
          <h3 className="text-xs font-medium text-text-mute uppercase tracking-wider mb-3">
            Быстрые действия
          </h3>
          <div className="space-y-2">
            <QuickActionButton
              href="/projects/create"
              label="Новый проект"
              icon="➕"
            />
            <QuickActionButton
              href="https://kirdro.ru"
              label="Открыть сайт"
              icon="🌐"
              external
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### StatsCard (карточки статистики)
```typescript
// src/components/admin/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'green' | 'cyan' | 'soft';
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'green' 
}: StatsCardProps) {
  const colorClasses = {
    green: 'text-neon-green',
    cyan: 'text-neon-cyan', 
    soft: 'text-neon-soft',
  };
  
  return (
    <div className="bevel bg-bg-subtle p-6 border border-line hover:border-neon-green transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-mute uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${colorClasses[color]} glyph-glow`}>
            {value}
          </p>
        </div>
        <div className="text-3xl opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
}
```

### DataTable (универсальная таблица)
```typescript
// src/components/admin/shared/DataTable.tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  loading,
  onRowClick 
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bevel bg-bg-subtle p-8 border border-line">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bevel bg-bg-subtle border border-line overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg border-b border-line">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-text-mute uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "hover:bg-bg-hover transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-text-base"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-text-mute">
          Данные отсутствуют
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 РАЗВЕРТЫВАНИЕ И КОНФИГУРАЦИЯ

### Структура деплоя
```
/var/www/
├── kirdro.ru/              # Основной сайт (порт 3003)
└── admin-kirdro/           # Админка (порт 3004)
    ├── .next/
    ├── src/
    ├── package.json
    ├── .env
    └── ...
```

### Nginx конфигурация
```nginx
# /etc/nginx/sites-available/admin.kirdro.ru
server {
    listen 80;
    server_name admin.kirdro.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.kirdro.ru;

    # SSL конфигурация
    ssl_certificate /etc/letsencrypt/live/admin.kirdro.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.kirdro.ru/privkey.pem;
    
    # Безопасность
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_session_cache shared:SSL:1m;
    
    # Proxy к Next.js
    location / {
        proxy_pass http://localhost:3004;
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

### PM2 конфигурация
```json
{
  "name": "admin-kirdro",
  "script": "npm",
  "args": "start",
  "cwd": "/var/www/admin-kirdro",
  "env": {
    "PORT": "3004",
    "NODE_ENV": "production"
  },
  "instances": 1,
  "exec_mode": "fork",
  "watch": false,
  "max_memory_restart": "1G",
  "error_file": "/var/log/pm2/admin-kirdro-error.log",
  "out_file": "/var/log/pm2/admin-kirdro-out.log",
  "log_file": "/var/log/pm2/admin-kirdro.log"
}
```

### SSL сертификат
```bash
# Получение SSL сертификата
sudo certbot --nginx -d admin.kirdro.ru --email kirdro@yandex.ru
```

---

## 📋 ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ

### Этап 1: Инициализация (30 минут)
1. Создать проект через create-t3-app
2. Настроить подключение к базе данных
3. Настроить TailwindCSS с киберпанк темой
4. Проверить подключение к БД

### Этап 2: Аутентификация (1 час)
1. Настроить NextAuth.js с ограничением на kirdro@yandex.ru
2. Создать middleware для защиты всех маршрутов
3. Настроить редирект на страницу входа
4. Протестировать авторизацию

### Этап 3: Базовый Layout (1 час)
1. Создать AdminSidebar с навигацией
2. Создать AdminHeader с информацией о пользователе
3. Реализовать основной AdminLayout
4. Применить киберпанк стилизацию

### Этап 4: Dashboard (45 минут) 
1. Создать StatsCard компонент
2. Реализовать tRPC запросы для статистики
3. Показать основные метрики
4. Добавить быстрые действия

### Этап 5: Управление пользователями (1.5 часа)
1. Создать страницу списка пользователей
2. Реализовать DataTable компонент
3. Добавить фильтрацию и поиск
4. Создать форму редактирования роли

### Этап 6: Управление проектами (2 часа)
1. Список проектов с возможностью редактирования
2. Форма создания/редактирования проекта
3. Загрузка изображений
4. Управление featured статусом

### Этап 7: Модерация чатов (1 час)
1. Страницы просмотра сообщений
2. Возможность удаления сообщений
3. Статистика использования
4. Фильтрация по пользователям

### Этап 8: Контактные обращения (45 минут)
1. Список обращений
2. Изменение статуса обработки
3. Просмотр деталей обращения
4. Поиск и фильтрация

### Этап 9: Управление навыками (45 минут)
1. CRUD операции для навыков
2. Категоризация
3. Управление уровнями
4. Иконки навыков

### Этап 10: Деплой (30 минут)
1. Сборка production версии
2. Настройка PM2
3. Конфигурация Nginx  
4. Получение SSL сертификата

**Общее время: ~8-10 часов**

---

## ✅ КРИТЕРИИ ГОТОВНОСТИ

### Функциональные требования
- [ ] Авторизация только для kirdro@yandex.ru
- [ ] Все CRUD операции работают
- [ ] Статистика отображается корректно
- [ ] Поиск и фильтрация функциональны
- [ ] Форма загрузки файлов работает

### Технические требования
- [ ] Использован create-t3-app стек
- [ ] Киберпанк дизайн идентичен основному сайту
- [ ] Подключение к правильной БД
- [ ] SSL сертификат настроен
- [ ] PM2 процесс стабильный

### UX требования
- [ ] Интерфейс интуитивно понятен
- [ ] Адаптивность на планшетах
- [ ] Быстродействие приемлемое
- [ ] Нет критических ошибок в консоли

---

## 🛡️ БЕЗОПАСНОСТЬ

### Обязательные меры
- ✅ Строгая проверка email kirdro@yandex.ru
- ✅ Проверка роли ADMIN на уровне tRPC
- ✅ Middleware защита всех маршрутов
- ✅ HTTPS обязательно
- ✅ Валидация всех входных данных через Zod

### Логирование
- Все действия администратора логируются
- Попытки несанкционированного доступа записываются
- Ошибки приложения отслеживаются

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

**Разработчик**: Кирилл Дроздов (Kirdro)  
**Email**: kirdro@yandex.ru  
**Основной сайт**: https://kirdro.ru  
**Админ-панель**: https://admin.kirdro.ru  

**Техническая поддержка**:
- База данных: PostgreSQL на 109.196.100.98
- Хостинг: VPS с Nginx + PM2
- Мониторинг: PM2 + системные логи

---

*Документ создан: 6 сентября 2025 г.*  
*Версия: 1.0*  
*Статус: Готов к реализации* ✅