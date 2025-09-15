# 📚 РУКОВОДСТВО ПО ИСПОЛЬЗОВАНИЮ СИСТЕМЫ СПИННЕРОВ И ИНДИКАТОРОВ ЗАГРУЗКИ

> **Версия**: 2.0  
> **Дата создания**: 15.09.2025  
> **Статус**: Готово к использованию

---

## 🎯 ОБЗОР СИСТЕМЫ

Система спиннеров и индикаторов загрузки обеспечивает единообразное отображение состояний загрузки во всей админ-панели kirdro.ru. Система автоматически интегрирована с tRPC и поддерживает киберпанк дизайн.

### ✅ Что включено:
- **DNA спиннеры** с анимированными киберпанк эффектами
- **Прогресс-бары** с процентами и временными оценками  
- **Скелетоны** с shimmer-эффектом для разных типов контента
- **Глобальное управление** через LoadingContext
- **Автоматическое отслеживание** всех tRPC запросов
- **Адаптивный дизайн** для мобильных, планшетов и десктопа

---

## 🚀 БЫСТРЫЙ СТАРТ

### Импорт компонентов
```tsx
import { 
  Spinner, 
  ProgressLoader, 
  SkeletonLoader, 
  UploadProgress 
} from '@/components/ui/loaders';
```

### Базовое использование спиннера
```tsx
{isLoading ? (
  <Spinner 
    size="medium" 
    label="Загрузка данных..."
    variant="inline"
  />
) : (
  <YourContent />
)}
```

---

## 📖 ПОДРОБНОЕ РУКОВОДСТВО

### 🔄 Компонент Spinner

**Основной компонент для отображения DNA спиннера**

```tsx
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  label?: string;
  variant?: 'inline' | 'overlay' | 'fullscreen';
  className?: string;
}
```

#### Примеры использования:

**Inline спиннер в компоненте:**
```tsx
<Spinner 
  size="small" 
  label="Загрузка..."
  variant="inline"
/>
```

**Overlay спиннер для критических операций:**
```tsx
<Spinner 
  size="large" 
  label="Сохранение проекта..."
  variant="overlay"
/>
```

**Полноэкранный спиннер:**
```tsx
<Spinner 
  size="xlarge" 
  label="Инициализация системы..."
  variant="fullscreen"
/>
```

### 📊 Компонент ProgressLoader

**Спиннер с прогресс-баром для операций с измеримым прогрессом**

```tsx
interface ProgressLoaderProps {
  progress?: number; // 0-100
  label?: string;
  subLabel?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'inline' | 'overlay' | 'fullscreen';
  showPercentage?: boolean;
  estimatedTime?: string;
  className?: string;
}
```

#### Пример:
```tsx
<ProgressLoader
  progress={75}
  label="Загрузка файла"
  subLabel="Обработка изображения..."
  size="medium"
  variant="inline"
  showPercentage={true}
  estimatedTime="30 сек"
/>
```

### 💀 Компонент SkeletonLoader

**Скелетоны для placeholder контента**

```tsx
interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'avatar' | 'custom';
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}
```

#### Примеры:
```tsx
// Текстовый скелетон
<SkeletonLoader 
  variant="text" 
  width="200px" 
  height="1rem" 
/>

// Аватар
<SkeletonLoader 
  variant="avatar" 
  width="64px" 
  height="64px" 
  rounded 
/>

// Карточка
<SkeletonLoader 
  variant="card" 
  width="100%" 
  height="200px" 
/>
```

### 📁 Компонент UploadProgress

**Продвинутый индикатор загрузки файлов**

```tsx
interface UploadProgressProps {
  progress: number;
  fileName: string;
  fileSize?: number;
  uploadSpeed?: number;
  estimatedTime?: string;
  onCancel?: () => void;
  className?: string;
}
```

#### Пример:
```tsx
<UploadProgress
  progress={65}
  fileName="project-image.png"
  fileSize={2048000}
  uploadSpeed={512000}
  estimatedTime="15 сек"
  onCancel={handleCancel}
/>
```

---

## 🔧 АВТОМАТИЧЕСКАЯ ИНТЕГРАЦИЯ С tRPC

Система автоматически отслеживает все tRPC запросы и показывает соответствующие индикаторы загрузки.

### Категории запросов:

#### 🚨 Критические (overlay спиннер)
- Авторизация (`auth.*`)
- Создание/обновление/удаление (`*.create`, `*.update`, `*.delete`)
- Загрузка файлов (`files.upload`)

#### 📊 Обычные (inline спиннер)
- Получение данных (`*.getAll`, `*.getById`)  
- Статистика (`*.getStats`)

#### 🔍 Фоновые (минимальная индикация)
- Prefetch операции
- Обновление кэша

### Пример tRPC с автоматической загрузкой:
```tsx
// Автоматически показывает спиннер
const { data, isLoading } = api.projects.getAll.useQuery();

// Автоматически показывает overlay при сохранении
const createMutation = api.projects.create.useMutation({
  onSuccess: () => {
    // Спиннер автоматически скроется
  }
});
```

---

## 🌐 ГЛОБАЛЬНОЕ УПРАВЛЕНИЕ ЗАГРУЗКОЙ

### Использование LoadingContext

```tsx
import { useLoadingContext } from '@/contexts/LoadingContext';

function MyComponent() {
  const { addLoadingTask, removeLoadingTask } = useLoadingContext();
  
  const handleOperation = async () => {
    const taskId = 'my-operation';
    addLoadingTask(taskId, 'Выполнение операции...', 'inline');
    
    try {
      await myAsyncOperation();
    } finally {
      removeLoadingTask(taskId);
    }
  };
}
```

### Хук useUploadProgress

```tsx
import { useUploadProgress } from '@/hooks/useUploadProgress';

function FileUploadComponent() {
  const { 
    isUploading, 
    progress, 
    uploadSpeed, 
    estimatedTime,
    startUpload, 
    cancelUpload 
  } = useUploadProgress();
  
  const handleUpload = (file: File) => {
    startUpload(
      file, 
      (result) => console.log('Загрузка завершена:', result),
      (error) => console.error('Ошибка:', error)
    );
  };
  
  return (
    <div>
      {isUploading ? (
        <UploadProgress
          progress={progress}
          fileName={file.name}
          uploadSpeed={uploadSpeed}
          estimatedTime={estimatedTime}
          onCancel={cancelUpload}
        />
      ) : (
        <input type="file" onChange={handleUpload} />
      )}
    </div>
  );
}
```

---

## 🎨 КИБЕРПАНК СТИЛИЗАЦИЯ

### Доступные CSS классы:

```css
/* Анимации */
.cyber-pulse          /* Пульсация для ожидания */
.cyber-scan           /* Сканирование для поиска */  
.cyber-load           /* Загрузка данных */
.cyber-save           /* Сохранение */
.cyber-glitch         /* Glitch эффект */

/* Состояния */
.loading-critical     /* Критические операции */
.loading-normal       /* Обычные операции */
.loading-background   /* Фоновые процессы */
.loading-upload       /* Загрузка файлов */
.loading-complete     /* Завершение */

/* Эффекты */
.neon-glow           /* Неоновое свечение */
.energy-shield       /* Энергетический щит */
.holographic         /* Голографический эффект */
.cyber-scanlines     /* Сканлайны */
```

### Пример использования:
```tsx
<div className="cyber-pulse neon-glow">
  <Spinner size="large" label="Критическая операция" />
</div>
```

---

## 📱 АДАПТИВНОСТЬ

Система автоматически адаптируется к разным устройствам:

### 📱 Мобильные устройства (< 768px)
- Уменьшенные размеры спиннеров
- Упрощенные анимации (экономия батареи)
- Touch-friendly элементы (минимум 44px)
- Отключение сложных эффектов

### 📟 Планшеты (769px - 1024px)  
- Средние размеры компонентов
- Оптимизированное расположение
- Сбалансированные анимации

### 💻 Десктоп (> 1025px)
- Полноразмерные спиннеры
- Все анимации и эффекты
- Детальная информация о процессах
- Дополнительные визуальные эффекты

### ♿ Accessibility
- Поддержка `prefers-reduced-motion`
- ARIA labels для всех индикаторов
- Клавиатурная навигация
- Высокий контраст

---

## 🛠️ BEST PRACTICES

### ✅ Рекомендации:

1. **Используйте правильные размеры:**
   - `small` - для кнопок и мелких элементов
   - `medium` - для карточек и секций  
   - `large` - для страниц и модальных окон
   - `xlarge` - только для полноэкранных операций

2. **Выбирайте подходящий variant:**
   - `inline` - для контента внутри компонентов
   - `overlay` - для критических операций
   - `fullscreen` - только для инициализации системы

3. **Добавляйте осмысленные labels:**
   ```tsx
   // ✅ Хорошо
   <Spinner label="Загрузка списка проектов..." />
   
   // ❌ Плохо  
   <Spinner label="Загрузка..." />
   ```

4. **Используйте скелетоны для контента:**
   ```tsx
   // ✅ Хорошо - показываем структуру
   {loading ? (
     <div>
       <SkeletonLoader variant="text" width="200px" height="2rem" />
       <SkeletonLoader variant="text" width="300px" height="1rem" />
     </div>
   ) : (
     <div>
       <h2>{data.title}</h2>
       <p>{data.description}</p>
     </div>
   )}
   ```

5. **Оптимизируйте производительность:**
   ```tsx
   // ✅ Мемоизируйте дорогие компоненты
   const MemoizedSpinner = memo(Spinner);
   ```

### ❌ Чего избегать:

1. **Не показывайте несколько overlay спиннеров одновременно**
2. **Не используйте fullscreen для обычных операций**
3. **Не забывайте убирать спиннеры после завершения**
4. **Не используйте слишком длинные labels**

---

## 🐛 TROUBLESHOOTING

### Проблема: Спиннер не исчезает
```tsx
// ❌ Проблема
useEffect(() => {
  loadData(); // async функция
}, []);

// ✅ Решение  
useEffect(() => {
  const loadData = async () => {
    try {
      await fetchData();
    } finally {
      setLoading(false); // Всегда убираем спиннер
    }
  };
  loadData();
}, []);
```

### Проблема: Множественные спиннеры
```tsx
// ❌ Проблема - показывает несколько overlay
{isLoading1 && <Spinner variant="overlay" />}
{isLoading2 && <Spinner variant="overlay" />}

// ✅ Решение - один общий индикатор
{(isLoading1 || isLoading2) && (
  <Spinner 
    variant="overlay" 
    label={isLoading1 ? "Операция 1..." : "Операция 2..."}
  />
)}
```

### Проблема: Плохая производительность
```tsx
// ❌ Проблема - создается новый компонент каждый раз
const MyComponent = () => {
  return (
    <div>
      {isLoading && <Spinner size="large" />}
    </div>
  );
};

// ✅ Решение - мемоизация
const LoadingSpinner = memo(() => <Spinner size="large" />);

const MyComponent = () => {
  return (
    <div>
      {isLoading && <LoadingSpinner />}
    </div>
  );
};
```

---

## 📊 МЕТРИКИ И МОНИТОРИНГ

### Проверка корректности работы:

1. **Все tRPC запросы имеют индикацию:**
   ```bash
   # Поиск tRPC хуков без спиннеров
   grep -r "useQuery\|useMutation" src/ | grep -v "Spinner\|SkeletonLoader"
   ```

2. **Нет заблокированных UI:**
   - Все overlay спиннеры исчезают после завершения операций
   - Пользователь может отменить длительные операции

3. **Производительность:**
   - Анимации отключаются на слабых устройствах
   - Поддержка `prefers-reduced-motion`

---

## 🔄 ОБНОВЛЕНИЯ

### v2.0 (15.09.2025):
- ✅ Автоматическая интеграция с tRPC
- ✅ Компонент UploadProgress  
- ✅ Киберпанк анимации
- ✅ Полная адаптивность
- ✅ Оптимизация производительности

### Планируемые улучшения:
- Интеграция с Storybook
- Unit тесты для всех компонентов
- ESLint правила для корректного использования

---

*Документ подготовлен для системы индикаторов загрузки админ-панели kirdro.ru*  
*Версия: 2.0 | Автор: AI Assistant | Дата: 15.09.2025*