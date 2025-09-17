# Интеграция админ-панели с главным сайтом портфолио

## Обзор интеграции

Данный документ описывает процесс подключения главного сайта портфолио (kirdro.ru) к данным, управляемым через админ-панель (admin.kirdro.ru).

## Архитектура интеграции

```
┌─────────────────┐    API запросы    ┌──────────────────┐
│  Главный сайт   │ ──────────────→   │  Админ-панель    │
│  kirdro.ru      │                   │  admin.kirdro.ru │
└─────────────────┘                   └──────────────────┘
         │                                      │
         └──────────── Общая БД PostgreSQL ────┘
```

## Способы интеграции

### 1. Прямое подключение к БД (Рекомендуемый)

Главный сайт подключается напрямую к той же PostgreSQL базе данных:

**Преимущества:**
- Мгновенные обновления данных
- Минимальная задержка
- Нет зависимости от HTTP API
- Лучшая производительность
е 
**Настройка подключения:**

```typescript
// lib/db.ts на главном сайте
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Переменная окружения:**
```bash
DATABASE_URL="postgresql://gen_user:W{I9FH,fd#YU#E@109.196.100.98:5432/default_db"
```

### 2. REST API эндпоинты (Альтернативный)

Создание REST API на админ-панели для получения данных:

```typescript
// pages/api/portfolio/skills.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '~/server/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const skills = await db.skill.findMany({
        orderBy: [
          { category: 'asc' },
          { level: 'desc' }
        ]
      })
      
      res.status(200).json(skills)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch skills' })
    }
  }
}

// pages/api/portfolio/projects.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const projects = await db.project.findMany({
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      })
      
      res.status(200).json(projects)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' })
    }
  }
}
```

## Структуры данных для интеграции

### Skills API Response

```typescript
interface Skill {
  id: string
  name: string
  category: string
  level: number
  icon?: string
}

interface SkillsResponse {
  skills: Skill[]
  categories: string[]
}
```

### Projects API Response

```typescript
interface Project {
  id: string
  title: string
  description: string
  imageUrl?: string
  demoUrl?: string
  githubUrl?: string
  tags: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectsResponse {
  projects: Project[]
  featured: Project[]
  tags: string[]
}
```

## Реализация на главном сайте

### 1. Создание хуков для получения данных

```typescript
// hooks/useSkills.ts
import { useEffect, useState } from 'react'

interface Skill {
  id: string
  name: string
  category: string
  level: number
  icon?: string
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkills() {
      try {
        const response = await fetch('/api/skills')
        if (!response.ok) throw new Error('Failed to fetch skills')
        const data = await response.json()
        setSkills(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSkills()
  }, [])

  return { skills, loading, error }
}

// hooks/useProjects.ts
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Failed to fetch projects')
        const data = await response.json()
        setProjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const featuredProjects = projects.filter(p => p.featured)
  const regularProjects = projects.filter(p => !p.featured)

  return { projects, featuredProjects, regularProjects, loading, error }
}
```

### 2. Создание компонентов

```typescript
// components/SkillsSection.tsx
import { useSkills } from '../hooks/useSkills'

export function SkillsSection() {
  const { skills, loading, error } = useSkills()

  if (loading) return <SkillsLoader />
  if (error) return <ErrorMessage message={error} />

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <section className="skills-section">
      <h2 className="section-title">Навыки</h2>
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <SkillCategory
          key={category}
          category={category}
          skills={categorySkills}
        />
      ))}
    </section>
  )
}

// components/ProjectsSection.tsx
export function ProjectsSection() {
  const { featuredProjects, regularProjects, loading, error } = useProjects()

  if (loading) return <ProjectsLoader />
  if (error) return <ErrorMessage message={error} />

  return (
    <section className="projects-section">
      <h2 className="section-title">Проекты</h2>
      
      {featuredProjects.length > 0 && (
        <div className="featured-projects">
          <h3>Избранные проекты</h3>
          <ProjectsGrid projects={featuredProjects} />
        </div>
      )}
      
      <div className="all-projects">
        <h3>Все проекты</h3>
        <ProjectsGrid projects={regularProjects} />
      </div>
    </section>
  )
}
```

### 3. Server-Side Rendering (SSG/ISR)

Для лучшей производительности и SEO используйте статическую генерацию:

```typescript
// pages/index.tsx
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { db } from '../lib/db'

export const getStaticProps: GetStaticProps = async () => {
  const [skills, projects] = await Promise.all([
    db.skill.findMany({
      orderBy: [{ category: 'asc' }, { level: 'desc' }]
    }),
    db.project.findMany({
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }]
    })
  ])

  return {
    props: {
      skills,
      projects
    },
    revalidate: 3600 // Обновлять каждый час
  }
}

export default function HomePage({
  skills,
  projects
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main>
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} />
    </main>
  )
}
```

## Кеширование и производительность

### 1. Redis кеширование (опционально)

```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await redis.get(key)
  
  if (cached) {
    return JSON.parse(cached)
  }

  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  
  return data
}

// Использование
const skills = await getCachedData('skills', () =>
  db.skill.findMany({ orderBy: { level: 'desc' } })
)
```

### 2. Next.js ISR (Incremental Static Regeneration)

```typescript
export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { /* данные */ },
    revalidate: 1800 // 30 минут
  }
}
```

## Обновление данных в реальном времени

### WebSockets для live updates (опционально)

```typescript
// lib/websocket.ts
import { Server as SocketIOServer } from 'socket.io'
import type { NextApiResponse } from 'next'

export function initializeWebSocket(res: NextApiResponse) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected')
    })
  }
}

// В админ-панели при обновлении данных
export async function notifyDataUpdate(type: 'skills' | 'projects') {
  if (res.socket?.server?.io) {
    res.socket.server.io.emit('data-updated', { type })
  }
}
```

## План миграции от моковых данных

### Этап 1: Подготовка
1. Создать API эндпоинты на админ-панели
2. Настроить подключение к БД на главном сайте
3. Создать типы TypeScript для данных

### Этап 2: Замена навыков
1. Найти все моковые данные навыков
2. Заменить на API вызовы
3. Обновить компоненты для работы с новой структурой
4. Добавить обработку состояний загрузки и ошибок

### Этап 3: Замена проектов
1. Найти все моковые данные проектов
2. Заменить на API вызовы
3. Обновить компоненты портфолио
4. Добавить поддержку избранных проектов

### Этап 4: Оптимизация
1. Добавить кеширование
2. Настроить ISR/SSG
3. Оптимизировать загрузку изображений
4. Добавить SEO метатеги

## Мониторинг и отладка

### Логирование API запросов

```typescript
// middleware/logger.ts
export function logApiRequest(req: NextApiRequest) {
  console.log(`[API] ${req.method} ${req.url}`, {
    query: req.query,
    timestamp: new Date().toISOString()
  })
}
```

### Error Boundary для React компонентов

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Что-то пошло не так</h2>
          <p>Попробуйте обновить страницу</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Безопасность

1. **Ограничение CORS** для API эндпоинтов
2. **Rate limiting** для предотвращения злоупотреблений
3. **Валидация входных данных**
4. **Sanitization** выводимых данных

## Заключение

Интеграция позволяет главному сайту портфолио динамически отображать актуальные данные, управляемые через админ-панель, обеспечивая единую систему управления контентом.