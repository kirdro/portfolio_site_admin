# Multi-stage Docker build для admin панели kirdro.ru

# Stage 1: Dependencies
FROM oven/bun:1 AS deps
WORKDIR /app

# Копируем package.json, lockfile и prisma схему
COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile --ignore-scripts

# Stage 2: Builder
FROM oven/bun:1 AS builder
WORKDIR /app

# Копируем node_modules из deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma клиент
RUN bunx prisma generate

# Сборка приложения для продакшена  
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build args для переменных окружения
ARG GROQ_API_KEY=""
ARG DATABASE_URL=""
ARG NEXTAUTH_SECRET="build-temp-secret"
ARG NEXTAUTH_URL="http://localhost:3005"

# Устанавливаем переменные окружения для сборки
ENV GROQ_API_KEY=$GROQ_API_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN bun run build

# Stage 3: Runner
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Устанавливаем curl для healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Runtime переменные
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005

# Создаем пользователя nextjs
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Копируем необходимые файлы из builder
COPY --from=builder /app/public ./public

# Копируем .next со всеми правами
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Копируем package.json и node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Копируем Prisma схему и сгенерированный клиент
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

USER nextjs

EXPOSE 3005

# Healthcheck для Docker и K8s
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3005/api/health || exit 1

# Запуск приложения
CMD ["bun", "start"]