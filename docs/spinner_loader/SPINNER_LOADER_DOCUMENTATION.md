# 🌀 Киберпанк Спиннер-Лоадер - Документация

## 📋 Обзор

Проект использует кастомный киберпанк спиннер-лоадер с DNA анимацией из библиотеки `react-loader-spinner`, стилизованный под неоновую эстетику с зелёными и циановыми цветами. Система загрузки интегрирована с общей киберпанк темой проекта.

## 🎨 Визуальные характеристики

### Цветовая схема
```css
--neon-green: #00FF99  /* Основной неоновый зелёный */
--neon-cyan: #00FFCC   /* Дополнительный циановый */
```

### Эффекты свечения
- Drop shadow с неоновым свечением: `0 0 20px rgba(0, 255, 153, 0.5)`
- Радиальный градиент для пульсации
- Анимированное неоновое свечение текста

## 🏗️ Архитектура компонента

### Основной компонент: `/src/components/ui/loaders/Spinner.tsx`

```tsx
import React, { memo, useMemo } from 'react';
import { DNA } from 'react-loader-spinner';
import { cn } from '../../../lib/utils';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  label?: string;
  variant?: 'inline' | 'overlay' | 'fullscreen';
  className?: string;
}
```

### Размеры спиннера
```typescript
const sizes = {
  small: 40,     // Компактный размер для инлайн-загрузки
  medium: 60,    // Стандартный размер
  large: 80,     // Увеличенный для модальных окон
  xlarge: 120,   // Максимальный для полноэкранной загрузки
};
```

## 🚀 Варианты использования

### 1. Inline Spinner (По умолчанию)
```tsx
import { Spinner } from '@/components/ui/loaders';

// Простой инлайн спиннер
<Spinner size="small" label="Загрузка..." />

// В кнопке
<button disabled={isLoading}>
  {isLoading ? (
    <Spinner size="small" variant="inline" />
  ) : (
    'Сохранить'
  )}
</button>
```

### 2. Overlay Spinner
```tsx
// Модальное окно с затемнением фона
<Spinner
  size="medium"
  label="Сохранение проекта..."
  variant="overlay"
/>

// Эффекты:
// - Затемнение фона (85% непрозрачности)
// - Blur эффект на фоне (4px)
// - Неоновая рамка вокруг спиннера
// - Box shadow с многослойным свечением
```

### 3. Fullscreen Spinner
```tsx
// Полноэкранная загрузка
<Spinner
  size="xlarge"
  label="Инициализация системы..."
  variant="fullscreen"
/>

// Особенности:
// - Фиксированное позиционирование на весь экран
// - Анимированные сканлайны для киберпанк эффекта
// - Z-index: 50 для отображения поверх всего контента
```

## 🎭 Анимации и эффекты

### DNA Loader
Используется компонент `DNA` из `react-loader-spinner`:
```tsx
<DNA
  visible={true}
  height={spinnerSize}
  width={spinnerSize}
  ariaLabel='dna-loading'
  wrapperStyle={{}}
  wrapperClass='dna-wrapper'
/>
```

### Cyber Pulse Animation
```css
@keyframes cyber-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
    filter: brightness(1.2) saturate(1.5);
    box-shadow: var(--glow-shadow);
  }
}

.cyber-pulse {
  animation: cyber-pulse 2s ease-in-out infinite;
}
```

### Анимированные точки загрузки
```tsx
{[0, 1, 2].map((i) => (
  <span
    key={i}
    className='inline-block w-1 h-1 rounded-full animate-bounce'
    style={{
      backgroundColor: NEON_CYAN,
      animationDelay: `${i * 150}ms`,
      boxShadow: `0 0 5px ${NEON_CYAN}`,
    }}
  />
))}
```

## 📦 Зависимости

### NPM пакеты
```json
{
  "react-loader-spinner": "^6.1.6"
}
```

### Установка
```bash
bun add react-loader-spinner
```

## 🎨 Дополнительные CSS классы

### Файл: `/src/styles/cyber-animations.css`

#### Состояния загрузки
```css
.loading-critical {
  animation:
    cyber-glitch-critical 0.5s ease-in-out infinite,
    cyber-pulse 1s ease-in-out infinite;
}

.loading-normal {
  animation: cyber-pulse 2s ease-in-out infinite;
}

.loading-background {
  animation: cyber-scanlines 3s linear infinite;
  opacity: 0.7;
}

.loading-upload {
  animation:
    cyber-scan 2s linear infinite,
    energy-shield 1.5s ease-in-out infinite;
}

.loading-complete {
  animation:
    cyber-save 1s ease-in-out,
    neon-glow 0.5s ease-in-out;
}
```

## 💡 Примеры интеграции

### В формах
```tsx
const ProjectForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* Поля формы */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Spinner
            size="small"
            label="Сохранение..."
            variant="inline"
          />
        ) : (
          'Сохранить проект'
        )}
      </button>
    </form>
  );
};
```

### В таблицах данных
```tsx
const DataTable = ({ loading, data }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner
          size="medium"
          label="Загрузка данных..."
        />
      </div>
    );
  }

  return <table>{/* Контент таблицы */}</table>;
};
```

### При загрузке страницы
```tsx
const ProjectsPage = () => {
  const { data, isLoading } = useQuery();

  if (isLoading) {
    return (
      <Spinner
        size="large"
        label="Загрузка проектов..."
        variant="fullscreen"
      />
    );
  }

  return <ProjectsGrid projects={data} />;
};
```

## 📱 Адаптивность

### Мобильные устройства (< 768px)
- Уменьшенный размер спиннера (scale 0.8)
- Упрощённые анимации для экономии батареи
- Отключены сложные фоновые эффекты
- Минимальный размер touch-зон: 44x44px

### Планшеты (769px - 1024px)
- Средний размер спиннера (scale 0.9)
- Оптимизированные анимации
- Padding для overlay: 2rem

### Десктоп (> 1025px)
- Полноразмерный спиннер
- Все визуальные эффекты активны
- Дополнительные детали загрузки
- Matrix rain и scanlines эффекты

## ⚡ Оптимизация производительности

### Мемоизация
```tsx
export const Spinner = memo(function Spinner({ ... }) {
  const spinnerSize = useMemo(() => sizes[size], [size]);
  // ...
});
```

### Учёт предпочтений пользователя
```css
@media (prefers-reduced-motion: reduce) {
  .cyber-pulse, .cyber-scan, .cyber-load {
    animation: none;
  }
}
```

### Низкая производительность
```css
@media (max-resolution: 1dppx) {
  .matrix-rain, .cyber-scanlines, .holographic {
    display: none;
  }
}
```

## 🔧 Кастомизация

### Создание собственного варианта
```tsx
const CustomSpinner = ({ ...props }) => {
  return (
    <Spinner
      {...props}
      className="custom-spinner-class"
      style={{
        filter: 'hue-rotate(45deg)', // Изменить цвет
      }}
    />
  );
};
```

### Добавление новых размеров
```tsx
const customSizes = {
  ...sizes,
  tiny: 30,
  massive: 150,
};
```

## 🚨 Важные замечания

1. **Z-index управление**: Overlay и fullscreen варианты используют z-index: 50
2. **Доступность**: Все спиннеры имеют aria-label для screen readers
3. **SEO**: Спиннеры не блокируют индексацию контента
4. **Производительность**: DNA анимация оптимизирована для 60fps

## 📚 Связанные компоненты

- `SkeletonLoader` - Для placeholder загрузки
- `ProgressLoader` - Для отображения прогресса
- `UploadProgress` - Специально для загрузки файлов

## 🔗 Полезные ссылки

- [react-loader-spinner документация](https://mhnpd.github.io/react-loader-spinner/)
- [TailwindCSS анимации](https://tailwindcss.com/docs/animation)
- [CSS анимации MDN](https://developer.mozilla.org/ru/docs/Web/CSS/CSS_Animations)