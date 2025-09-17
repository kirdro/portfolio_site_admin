# Структура данных для навыков (Skills)

## Описание модели данных

Таблица `Skill` содержит информацию о технических навыках разработчика, которые отображаются на главном сайте портфолио.

### Схема базы данных

```prisma
model Skill {
  id       String  @id @default(cuid())
  name     String  @unique
  category String
  level    Int
  icon     String?

  @@index([category])
  @@map("Skill")
}
```

### Поля модели

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | String | Да | Уникальный идентификатор навыка (автогенерируемый CUID) |
| `name` | String | Да | Название навыка (уникальное) |
| `category` | String | Да | Категория навыка для группировки |
| `level` | Int | Да | Уровень владения навыком (1-100) |
| `icon` | String | Нет | URL или название иконки для отображения |

### Индексы

- `@@index([category])` - для быстрой фильтрации по категориям

## Рекомендуемые категории навыков

### Frontend
- React
- Next.js
- TypeScript
- TailwindCSS
- HTML/CSS
- JavaScript

### Backend
- Node.js
- Python
- PostgreSQL
- tRPC
- Prisma ORM
- RESTful APIs

### DevOps & Tools
- Docker
- Git
- Linux
- AWS/Cloud Services
- CI/CD

### Design & UI/UX
- Figma
- Photoshop
- UI/UX Design
- Responsive Design

## Уровни навыков

Рекомендуемая шкала от 1 до 100:

- **1-25**: Начинающий (Beginner) - базовые знания
- **26-50**: Средний (Intermediate) - практический опыт
- **51-75**: Продвинутый (Advanced) - глубокое понимание
- **76-100**: Эксперт (Expert) - профессиональное мастерство

## Отображение на главном сайте

### Группировка по категориям
Навыки должны группироваться по полю `category` и отображаться в виде секций:

```typescript
const skillsByCategory = skills.reduce((acc, skill) => {
  if (!acc[skill.category]) {
    acc[skill.category] = [];
  }
  acc[skill.category].push(skill);
  return acc;
}, {} as Record<string, Skill[]>);
```

### Визуализация уровня
Уровень навыка можно отображать как:
- Progress bar (полоса прогресса)
- Звёздочки (1-5 звёзд)
- Процентная шкала
- Цветовая индикация

### Иконки
Поле `icon` может содержать:
- URL изображения
- Название иконки из библиотеки (например, React Icons)
- Класс CSS иконки

## Примеры данных

```json
[
  {
    "id": "cuid123",
    "name": "React",
    "category": "Frontend",
    "level": 95,
    "icon": "SiReact"
  },
  {
    "id": "cuid456", 
    "name": "PostgreSQL",
    "category": "Backend",
    "level": 80,
    "icon": "SiPostgresql"
  },
  {
    "id": "cuid789",
    "name": "Docker",
    "category": "DevOps & Tools", 
    "level": 70,
    "icon": "SiDocker"
  }
]
```

## API для получения данных

### tRPC роутер для навыков

```typescript
export const skillsRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.skill.findMany({
        orderBy: [
          { category: 'asc' },
          { level: 'desc' },
          { name: 'asc' }
        ]
      });
    }),

  getByCategory: publicProcedure
    .input(z.object({
      category: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.skill.findMany({
        where: { category: input.category },
        orderBy: [
          { level: 'desc' },
          { name: 'asc' }
        ]
      });
    }),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const skills = await ctx.db.skill.findMany({
        select: { category: true }
      });
      return [...new Set(skills.map(s => s.category))];
    })
});
```

## Интеграция с главным сайтом

1. **Создать API эндпоинт** на главном сайте для получения навыков
2. **Подключиться к той же БД** что и админка
3. **Кешировать данные** для быстрой загрузки
4. **Обновлять автоматически** при изменениях в админке

### Пример компонента для главного сайта

```jsx
export function SkillsSection({ skills }) {
  const skillsByCategory = groupSkillsByCategory(skills);
  
  return (
    <section className="skills-section">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <div key={category} className="skill-category">
          <h3 className="category-title">{category}</h3>
          <div className="skills-grid">
            {categorySkills.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
```

## Замена моковых данных

При интеграции с реальными данными:

1. Удалить все моковые массивы навыков
2. Заменить на API вызовы к админке
3. Добавить загрузочные состояния
4. Обработать ошибки загрузки данных
5. Кешировать результаты для производительности