# Структура данных для проектов (Projects)

## Описание модели данных

Таблица `Project` содержит информацию о портфолио проектах разработчика, которые отображаются на главном сайте как примеры работ.

### Схема базы данных

```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  description String
  imageUrl    String?
  demoUrl     String?
  githubUrl   String?
  tags        String[] @default([])
  featured    Boolean  @default(false)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  User        User     @relation(fields: [userId], references: [id])

  @@index([featured, createdAt])
  @@map("Project")
}
```

### Поля модели

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | String | Да | Уникальный идентификатор проекта (автогенерируемый CUID) |
| `title` | String | Да | Название проекта |
| `description` | String | Да | Подробное описание проекта |
| `imageUrl` | String | Нет | URL изображения/скриншота проекта |
| `demoUrl` | String | Нет | Ссылка на живую демо-версию |
| `githubUrl` | String | Нет | Ссылка на репозиторий GitHub |
| `tags` | String[] | Нет | Массив тегов/технологий (по умолчанию пустой) |
| `featured` | Boolean | Нет | Признак избранного проекта (по умолчанию false) |
| `userId` | String | Да | ID пользователя-автора проекта |
| `createdAt` | DateTime | Да | Дата создания записи |
| `updatedAt` | DateTime | Да | Дата последнего обновления |

### Индексы

- `@@index([featured, createdAt])` - для быстрой выборки избранных проектов с сортировкой по дате

### Связи

- `User` - связь с пользователем-автором проекта (many-to-one)

## Категории проектов по тегам

### Web Applications
- React
- Next.js
- TypeScript
- TailwindCSS
- Full-stack

### Backend Services
- Node.js
- Python
- PostgreSQL
- API
- Microservices

### Mobile Development
- React Native
- Flutter
- Mobile Apps

### DevOps & Infrastructure
- Docker
- AWS
- CI/CD
- Infrastructure

### Open Source
- GitHub
- npm packages
- Libraries
- Tools

## Статусы и приоритеты

### Featured Projects
Проекты с `featured: true` отображаются в топе портфолио и имеют приоритет.

### Сортировка проектов
Рекомендуемая сортировка:
1. Избранные проекты первыми (`featured: true`)
2. По дате создания (новые первыми)
3. По алфавиту названий

## Отображение на главном сайте

### Карточка проекта

```typescript
interface ProjectCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  tags: string[];
  featured: boolean;
}
```

### Компоненты для отображения

- **ProjectGrid** - сетка всех проектов
- **FeaturedProjects** - секция избранных проектов
- **ProjectCard** - карточка отдельного проекта
- **ProjectModal** - детальный просмотр проекта

## Примеры данных

```json
[
  {
    "id": "cuid123",
    "title": "E-commerce Platform",
    "description": "Полнофункциональная платформа электронной коммерции с административной панелью, системой платежей и управлением заказами.",
    "imageUrl": "https://example.com/images/ecommerce-preview.png",
    "demoUrl": "https://demo.ecommerce.com",
    "githubUrl": "https://github.com/username/ecommerce-platform",
    "tags": ["React", "Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    "featured": true,
    "userId": "user123",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  },
  {
    "id": "cuid456",
    "title": "Task Management System",
    "description": "Система управления задачами с возможностью создания команд, трекинга времени и отчётности.",
    "imageUrl": "https://example.com/images/task-system.png",
    "demoUrl": "https://tasks.example.com",
    "githubUrl": "https://github.com/username/task-manager",
    "tags": ["React", "Node.js", "Express", "MongoDB", "Socket.io"],
    "featured": true,
    "userId": "user123",
    "createdAt": "2024-02-01T12:00:00Z",
    "updatedAt": "2024-02-05T16:45:00Z"
  },
  {
    "id": "cuid789",
    "title": "Weather Dashboard",
    "description": "Интерактивная панель погоды с геолокацией, прогнозами и красивыми анимациями.",
    "imageUrl": "https://example.com/images/weather-app.png",
    "demoUrl": "https://weather.example.com",
    "githubUrl": "https://github.com/username/weather-dashboard",
    "tags": ["Vue.js", "JavaScript", "Weather API", "Chart.js"],
    "featured": false,
    "userId": "user123",
    "createdAt": "2024-01-10T08:30:00Z",
    "updatedAt": "2024-01-12T10:15:00Z"
  }
]
```

## API для получения данных

### tRPC роутер для проектов

```typescript
export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.project.findMany({
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    }),

  getFeatured: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.project.findMany({
        where: { featured: true },
        orderBy: { createdAt: 'desc' },
        take: 6 // Ограничить количество избранных
      });
    }),

  getByTags: publicProcedure
    .input(z.object({
      tags: z.array(z.string())
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findMany({
        where: {
          tags: {
            hasSome: input.tags
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    }),

  getById: publicProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
    }),

  getAllTags: publicProcedure
    .query(async ({ ctx }) => {
      const projects = await ctx.db.project.findMany({
        select: { tags: true }
      });
      const allTags = projects.flatMap(p => p.tags);
      return [...new Set(allTags)].sort();
    })
});
```

## Интеграция с главным сайтом

### Компонент портфолио

```jsx
export function PortfolioSection({ projects }) {
  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <section className="portfolio-section">
      {featuredProjects.length > 0 && (
        <FeaturedProjectsGrid projects={featuredProjects} />
      )}
      
      <ProjectsGrid projects={regularProjects} />
    </section>
  );
}

export function ProjectCard({ project }) {
  return (
    <div className="project-card">
      {project.imageUrl && (
        <img src={project.imageUrl} alt={project.title} />
      )}
      
      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        
        <div className="project-tags">
          {project.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        
        <div className="project-links">
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener">
              Demo
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener">
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Оптимизация изображений

### Загрузка и хранение
- Использовать S3 или аналогичное облачное хранилище
- Оптимизировать размеры изображений (WebP, AVIF)
- Генерировать превью разных размеров

### Lazy loading
Реализовать отложенную загрузку изображений для улучшения производительности:

```jsx
<img 
  src={project.imageUrl}
  alt={project.title}
  loading="lazy"
  className="project-image"
/>
```

## SEO и метаданные

### Open Graph теги
Генерировать метатеги для каждого проекта:

```html
<meta property="og:title" content="Project Title" />
<meta property="og:description" content="Project description..." />
<meta property="og:image" content="project-image-url" />
<meta property="og:url" content="project-detail-url" />
```

## Замена моковых данных

При интеграции с реальными данными:

1. **Удалить статические массивы** проектов
2. **Подключить API** для получения данных из админки
3. **Добавить состояния загрузки** и обработку ошибок
4. **Реализовать кеширование** для быстрого отображения
5. **Добавить фильтрацию** по тегам и категориям
6. **Настроить пагинацию** для большого количества проектов