# Архитектурные и кодовые требования для проекта kirdro.ru

> **⚠️ КРИТИЧЕСКИ ВАЖНО**: Эти требования ОБЯЗАТЕЛЬНЫ для выполнения! Любое отклонение недопустимо!

---

## 🚫 КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО

### ❌ useEffect и зависимости
**ПРАВИЛО**: В массив зависимостей useEffect НЕЛЬЗЯ передавать функции - это вызывает бесконечные перерендеры!

```typescript
// ❌ НЕПРАВИЛЬНО - функция в зависимостях
const handleSomething = () => { /* логика */ };
useEffect(() => {
  // что-то делаем
}, [handleSomething]); // ЭТО ВЫЗОВЕТ ПЕРЕРЕНДЕР!

// ✅ ПРАВИЛЬНО - используем useCallback или выносим функцию наружу  
const handleSomething = useCallback(() => {
  // логика
}, []); // фиксируем зависимости

useEffect(() => {
  // что-то делаем  
}, [handleSomething]); // Теперь безопасно

// ✅ ПРАВИЛЬНО - функция вне компонента
const externalFunction = () => { /* логика */ };

function Component() {
  useEffect(() => {
    // что-то делаем
  }, []); // без функций в зависимостях
}
```

### ❌ Стрелочные функции в рендере
**ПРАВИЛО**: ЗАПРЕЩЕНО создавать стрелочные функции внутри JSX рендера - каждый рендер создает новую функцию!

```typescript
// ❌ НЕПРАВИЛЬНО - создание функции на каждом рендере
function Component({ items }: Props) {
  return (
    <div>
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => handleClick(item.id)} // НОВАЯ ФУНКЦИЯ НА КАЖДОМ РЕНДЕРЕ!
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// ✅ ПРАВИЛЬНО - функция создается один раз с useCallback
function Component({ items }: Props) {
  const обработчикКлика = useCallback((id: string) => {
    handleClick(id);
  }, []); // фиксируем зависимости

  return (
    <div>
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => обработчикКлика(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

// ✅ ПРАВИЛЬНО - еще лучше, выносим в отдельный компонент
function ItemButton({ item, onItemClick }: Props) {
  const handleClick = useCallback(() => {
    onItemClick(item.id);
  }, [item.id, onItemClick]);

  return (
    <button onClick={handleClick}>
      {item.name}
    </button>
  );
}

function Component({ items }: Props) {
  const обработчикКликаПоЭлементу = useCallback((id: string) => {
    handleClick(id);
  }, []);

  return (
    <div>
      {items.map((item) => (
        <ItemButton 
          key={item.id}
          item={item}
          onItemClick={обработчикКликаПоЭлементу}
        />
      ))}
    </div>
  );
}
```

### ❌ Объекты в рендере  
**ПРАВИЛО**: ЗАПРЕЩЕНО создавать объекты внутри JSX рендера - каждый рендер создает новый объект!

```typescript
// ❌ НЕПРАВИЛЬНО - создание объектов в рендере
function Component({ user }: Props) {
  return (
    <div>
      <UserCard 
        user={user}
        style={{ padding: '16px', margin: '8px' }} // НОВЫЙ ОБЪЕКТ НА КАЖДОМ РЕНДЕРЕ!
        config={{ showAvatar: true, showEmail: false }} // НОВЫЙ ОБЪЕКТ!
      />
    </div>
  );
}

// ✅ ПРАВИЛЬНО - объекты выносим за рендер
const стилиКарточки = { 
  padding: '16px', 
  margin: '8px' 
};

const конфигурацияКарточки = { 
  showAvatar: true, 
  showEmail: false 
};

function Component({ user }: Props) {
  return (
    <div>
      <UserCard 
        user={user}
        style={стилиКарточки}
        config={конфигурацияКарточки}
      />
    </div>
  );
}

// ✅ ПРАВИЛЬНО - для динамических объектов используем useMemo
function Component({ user, theme }: Props) {
  const динамическиеСтили = useMemo(() => ({
    padding: '16px',
    margin: '8px',
    backgroundColor: theme.background,
    color: theme.text,
  }), [theme]); // пересоздаем только при изменении темы

  const конфигурация = useMemo(() => ({
    showAvatar: user.role === 'admin',
    showEmail: user.emailVisible,
  }), [user.role, user.emailVisible]); // пересоздаем только при изменении зависимостей

  return (
    <div>
      <UserCard 
        user={user}
        style={динамическиеСтили}
        config={конфигурация}
      />
    </div>
  );
}

// ❌ НЕПРАВИЛЬНО - массивы тоже нельзя создавать в рендере  
function Component({ selectedIds }: Props) {
  return (
    <FilterComponent 
      excludeIds={[1, 2, 3]} // НОВЫЙ МАССИВ НА КАЖДОМ РЕНДЕРЕ!
      includeIds={selectedIds.concat([999])} // НОВЫЙ МАССИВ!
    />
  );
}

// ✅ ПРАВИЛЬНО - массивы выносим за рендер или мемоизируем
const исключенныеАйди = [1, 2, 3];

function Component({ selectedIds }: Props) {
  const включенныеАйди = useMemo(() => 
    selectedIds.concat([999]), 
    [selectedIds]
  );

  return (
    <FilterComponent 
      excludeIds={исключенныеАйди}
      includeIds={включенныеАйди}
    />
  );
}
```

---

## 📏 ОГРАНИЧЕНИЯ НА РАЗМЕР ФАЙЛОВ

### 📝 Максимум 300 строк кода в файле
**ПРИЧИНА**: Файлы больше 300 строк ухудшают читаемость и поддержку кода.

**РЕШЕНИЯ при превышении лимита:**

#### Для компонентов:
```typescript
// ❌ НЕПРАВИЛЬНО - большой компонент в одном файле
function LargeComponent() {
  // 400+ строк кода
  return (
    <div>
      {/* огромный JSX */}
    </div>
  );
}

// ✅ ПРАВИЛЬНО - разбиваем на подкомпоненты
// components/LargeComponent/index.tsx (< 300 строк)
function LargeComponent() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

// components/LargeComponent/Header.tsx (< 300 строк)
// components/LargeComponent/Content.tsx (< 300 строк)  
// components/LargeComponent/Footer.tsx (< 300 строк)
```

#### Для функций:
```typescript
// ❌ НЕПРАВИЛЬНО - одна большая функция
function processComplexData(data: any[]) {
  // 200+ строк логики
}

// ✅ ПРАВИЛЬНО - разбиваем на мелкие функции
function processComplexData(data: any[]) {
  const validated = validateData(data);
  const transformed = transformData(validated);  
  const processed = applyBusinessLogic(transformed);
  return processed;
}

// Каждая функция в отдельном файле или секции
function validateData(data: any[]) { /* < 50 строк */ }
function transformData(data: any[]) { /* < 50 строк */ } 
function applyBusinessLogic(data: any[]) { /* < 50 строк */ }
```

---

## 🎯 ПРИНЦИП ЕДИНОЙ ОТВЕТСТВЕННОСТИ

### 📋 Одна функция = одна задача
**ПРАВИЛО**: Каждая функция должна выполнять только одну конкретную задачу!

```typescript
// ❌ НЕПРАВИЛЬНО - функция делает слишком много
function handleUserAction(user: User, action: string) {
  // валидирует данные
  if (!user.email) return;
  
  // отправляет на сервер
  api.updateUser(user);
  
  // обновляет UI
  setUser(user);
  setLoading(false);
  
  // логирует действие
  console.log(`User ${user.id} performed ${action}`);
}

// ✅ ПРАВИЛЬНО - разбиваем на отдельные функции
function validateUser(user: User): boolean {
  return Boolean(user.email);
}

function updateUserOnServer(user: User): Promise<User> {
  return api.updateUser(user);
}

function updateUserInUI(user: User, setUser: Function, setLoading: Function) {
  setUser(user);
  setLoading(false);
}

function logUserAction(userId: string, action: string) {
  console.log(`User ${userId} performed ${action}`);
}

// Главная функция координирует вызовы
function handleUserAction(user: User, action: string) {
  if (!validateUser(user)) return;
  
  updateUserOnServer(user);
  updateUserInUI(user, setUser, setLoading);
  logUserAction(user.id, action);
}
```

---

## 🎨 КАЧЕСТВО И ЧИТАЕМОСТЬ КОДА

### 📖 Код для людей, не только для машин
**ТРЕБОВАНИЯ:**
- Понятные названия переменных и функций (НА РУССКОМ ЯЗЫКЕ!)
- Логическая структура кода
- Достаточные комментарии (НА РУССКОМ ЯЗЫКЕ!)

```typescript
// ❌ НЕПРАВИЛЬНО - непонятные названия
function calc(x: number, y: number): number {
  return x * y * 0.2; // что это за магическое число?
}

const data = getData(); // какие данные?
const result = process(data); // что происходит?

// ✅ ПРАВИЛЬНО - понятные названия и комментарии
/**
 * Рассчитывает налог с продаж для товара
 * @param цена - стоимость товара в рублях  
 * @param количество - количество единиц товара
 * @returns сумма налога в рублях
 */
function рассчитатьНалогСПродаж(цена: number, количество: number): number {
  const ставкаНалога = 0.2; // 20% налог с продаж
  return цена * количество * ставкаНалога;
}

// Получаем данные о товарах из API
const товары = await получитьСписокТоваров();

// Обрабатываем каждый товар и добавляем расчет налога  
const товарыСНалогом = обработатьТовары(товары);
```

---

## ♻️ ПЕРЕИСПОЛЬЗОВАНИЕ КОМПОНЕНТОВ И ФУНКЦИЙ

### 🔄 DRY принцип (Don't Repeat Yourself)
**ПРАВИЛО**: Если код повторяется в двух местах - выносим в общий компонент/функцию!

```typescript
// ❌ НЕПРАВИЛЬНО - дублирование кода
function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bevel bg-bg-subtle p-4 hover:shadow-neon transition-all">
      <h3 className="text-neon-green font-semibold">{project.title}</h3>
      <p className="text-text-muted">{project.description}</p>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="bevel bg-bg-subtle p-4 hover:shadow-neon transition-all">
      <h3 className="text-neon-green font-semibold">{skill.name}</h3>  
      <p className="text-text-muted">{skill.description}</p>
    </div>
  );
}

// ✅ ПРАВИЛЬНО - универсальный компонент
interface UniversalCardProps {
  заголовок: string;
  описание: string;
  дополнительныйКласс?: string;
  children?: React.ReactNode;
}

function УниверсальнаяКарточка({ 
  заголовок, 
  описание, 
  дополнительныйКласс = "",
  children 
}: UniversalCardProps) {
  return (
    <div className={`bevel bg-bg-subtle p-4 hover:shadow-neon transition-all ${дополнительныйКласс}`}>
      <h3 className="text-neon-green font-semibold">{заголовок}</h3>
      <p className="text-text-muted">{описание}</p>
      {children}
    </div>
  );
}

// Теперь используем везде один компонент
function КарточкаПроекта({ проект }: { проект: Project }) {
  return (
    <УниверсальнаяКарточка 
      заголовок={проект.title}
      описание={проект.description}
    />
  );
}

function КарточкаНавыка({ навык }: { навык: Skill }) {
  return (
    <УниверсальнаяКарточка
      заголовок={навык.name} 
      описание={навык.description}
    />
  );
}
```

---

## ⚡ ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ

### 🚀 Код должен работать быстро
**ТРЕБОВАНИЯ:**
- Избегать лишних перерендеров
- Использовать мемоизацию для тяжелых вычислений
- Lazy loading для больших компонентов

```typescript
// ❌ НЕПРАВИЛЬНО - компонент перерендеривается без необходимости
function ExpensiveComponent({ data, onUpdate }: Props) {
  const expensiveValue = calculateSomethingHeavy(data); // каждый рендер!
  
  return (
    <div onClick={() => onUpdate(data)}>
      {expensiveValue}
    </div>
  );
}

// ✅ ПРАВИЛЬНО - оптимизированная версия  
const OptimizedComponent = memo(function OptimizedComponent({ 
  данные, 
  приОбновлении 
}: Props) {
  // Мемоизируем тяжелые вычисления
  const дорогоеЗначение = useMemo(
    () => рассчитатьТяжелоеЗначение(данные),
    [данные] // пересчитываем только при изменении данных
  );
  
  // Мемоизируем обработчик событий
  const обработчикКлика = useCallback(
    () => приОбновлении(данные),
    [данные, приОбновлении]
  );
  
  return (
    <div onClick={обработчикКлика}>
      {дорогоеЗначение}
    </div>
  );
});

// Lazy loading для больших компонентов
const ТяжелыйКомпонент = lazy(() => import('./ТяжелыйКомпонент'));

function Приложение() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ТяжелыйКомпонент />
    </Suspense>
  );
}
```

---

## 💬 ЯЗЫКОВЫЕ ТРЕБОВАНИЯ

### 🇷🇺 Русский язык ВЕЗДЕ!
**ОБЯЗАТЕЛЬНО:**
- Все комментарии на русском языке  
- Названия переменных и функций на русском (где это улучшает понимание)
- Общение с разработчиком только на русском

```typescript
// ❌ НЕПРАВИЛЬНО - английские комментарии
function calculateUserAge(birthDate: Date): number {
  // Calculate current age based on birth date
  const currentDate = new Date();
  const age = currentDate.getFullYear() - birthDate.getFullYear();
  return age;
}

// ✅ ПРАВИЛЬНО - русские комментарии и понятные названия
function рассчитатьВозрастПользователя(датаРождения: Date): number {
  // Рассчитываем текущий возраст на основе даты рождения
  const текущаяДата = new Date();
  const возраст = текущаяДата.getFullYear() - датаРождения.getFullYear();
  
  // Проверяем, был ли уже день рождения в этом году
  if (текущаяДата.getMonth() < датаРождения.getMonth() || 
      (текущаяДата.getMonth() === датаРождения.getMonth() && 
       текущаяДата.getDate() < датаРождения.getDate())) {
    возраст--;
  }
  
  return возраст;
}
```

---

## 📦 STATE MANAGEMENT - ТОЛЬКО TANSTACK QUERY

### 🚫 Запрещенные state менеджеры
**КАТЕГОРИЧЕСКИ НЕЛЬЗЯ использовать:**
- Redux / Redux Toolkit  
- Zustand
- Valtio
- Jotai
- Context API для глобального состояния

### ✅ ТОЛЬКО TanStack Query (React Query)
**ПРАВИЛО**: Для всего серверного состояния используем исключительно TanStack Query!

```typescript
// ❌ НЕПРАВИЛЬНО - Redux для серверных данных
const userSlice = createSlice({
  name: 'user',
  initialState: { users: [], loading: false },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;  
    }
  }
});

// ❌ НЕПРАВИЛЬНО - Zustand для серверных данных  
const useUserStore = create((set) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    const users = await api.getUsers();
    set({ users, loading: false });
  }
}));

// ✅ ПРАВИЛЬНО - TanStack Query
function useПользователи() {
  return useQuery({
    queryKey: ['пользователи'],
    queryFn: () => api.получитьПользователей(),
    staleTime: 5 * 60 * 1000, // кэш на 5 минут
    cacheTime: 10 * 60 * 1000, // хранить в кэше 10 минут
  });
}

// Использование в компоненте
function СписокПользователей() {
  const { 
    data: пользователи, 
    isLoading: загружается, 
    error: ошибка 
  } = useПользователи();

  if (загружается) return <div>Загружается...</div>;
  if (ошибка) return <div>Ошибка: {ошибка.message}</div>;

  return (
    <div>
      {пользователи?.map(пользователь => (
        <div key={пользователь.id}>{пользователь.name}</div>
      ))}
    </div>
  );
}

// Мутации также через TanStack Query
function useСозданиеПользователя() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (новыйПользователь: User) => api.создатьПользователя(новыйПользователь),
    onSuccess: () => {
      // Обновляем кэш после создания
      queryClient.invalidateQueries({ queryKey: ['пользователи'] });
    },
    onError: (ошибка) => {
      console.error('Ошибка создания пользователя:', ошибка);
    }
  });
}
```

---

## 🎨 ВЕРСТКА - ПРИОРИТЕТ CSS GRID

### 🥇 CSS Grid - основной инструмент
**ПРАВИЛО**: Везде где возможно используем CSS Grid, Flexbox только в исключительных случаях!

```css
/* ✅ ПРАВИЛЬНО - Grid для сеток и макетов */
.проекты-сетка {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.макет-страницы {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }  
.main { grid-area: main; }
.footer { grid-area: footer; }

/* ❌ ИЗБЕГАЕМ - Flexbox для сложных макетов */
.плохой-макет {
  display: flex; /* Grid был бы лучше */
  flex-direction: column;
}

/* ✅ ДОПУСТИМО - Flexbox для центрирования и простого выравнивания */
.кнопка {
  display: flex; /* Здесь flex оправдан */
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.навигация {
  display: flex; /* Простое горизонтальное меню */
  gap: 1rem;
  align-items: center;
}
```

**Когда можно использовать Flexbox:**
- ✅ Центрирование элементов
- ✅ Простые горизонтальные/вертикальные списки
- ✅ Выравнивание содержимого в кнопках
- ✅ Навигационные меню
- ❌ Сложные макеты страниц (используй Grid!)
- ❌ Сетки карточек (используй Grid!)

---

## 🎭 АНИМАЦИИ И ЭФФЕКТЫ

### ✨ Красивые анимации там, где уместно
**ТРЕБОВАНИЯ:**
- Анимации должны улучшать UX, а не мешать
- 60fps для всех анимаций
- Поддержка prefers-reduced-motion

```typescript
// ✅ ПРАВИЛЬНО - плавные анимации с учетом предпочтений
const АнимированнаяКарточка = styled.div`
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-neon);
  }
  
  /* Уважаем настройки пользователя */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

// Framer Motion с правильными настройками
function АнимированныйКомпонент() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1] // плавная кривая
      }}
      // Отключаем анимации если пользователь предпочитает
      {...(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
        initial: false,
        animate: false
      } : {})}
    >
      Контент
    </motion.div>
  );
}
```

---

## 📱 АДАПТИВНОСТЬ И ПРОИЗВОДИТЕЛЬНОСТЬ

### 📏 Mobile-first подход
**ПРАВИЛО**: Сначала мобильная версия, потом десктопная!

```css
/* ✅ ПРАВИЛЬНО - Mobile-first */
.компонент {
  /* Базовые стили для мобильных */
  padding: 1rem;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .компонент {
    /* Стили для планшетов */
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .компонент {
    /* Стили для десктопа */  
    padding: 2rem;
    font-size: 1.125rem;
  }
}

/* ❌ НЕПРАВИЛЬНО - Desktop-first */
.плохой-компонент {
  padding: 2rem; /* Много места на мобильных */
  font-size: 1.125rem; /* Слишком большой шрифт */
}

@media (max-width: 768px) {
  .плохой-компонент {
    padding: 1rem; /* Переопределяем - неэффективно */
    font-size: 0.875rem;
  }
}
```

---

## 🔍 КОНТРОЛЬ КАЧЕСТВА

### 📊 Обязательные метрики
- **Lighthouse Performance**: ≥ 90
- **Lighthouse Accessibility**: ≥ 90  
- **Bundle size**: < 200KB gzipped initial
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

### 🧪 Обязательные проверки перед коммитом
```bash
# Проверка типов TypeScript
npx tsc --noEmit

# Проверка линтера  
npm run lint

# Форматирование кода
npm run format

# Сборка проекта
npm run build

# Проверка bundle size
npm run analyze
```

---

## 📋 ЧЕКЛИСТ ПЕРЕД КАЖДЫМ PULL REQUEST

### ✅ Код качество
- [ ] Все файлы < 300 строк кода
- [ ] Функции имеют единую ответственность  
- [ ] Нет функций в useEffect зависимостях
- [ ] НЕТ стрелочных функций в JSX рендере (только useCallback)
- [ ] НЕТ объектов и массивов создаваемых в рендере (вынесены за рендер или useMemo)
- [ ] Используются переиспользуемые компоненты
- [ ] Все комментарии на русском языке

### ✅ Технические требования
- [ ] CSS Grid используется везде где возможно
- [ ] TanStack Query для всех серверных данных  
- [ ] Анимации с поддержкой prefers-reduced-motion
- [ ] Mobile-first адаптивность
- [ ] Оптимизация производительности (memo, useMemo, useCallback)

### ✅ Тестирование  
- [ ] Компоненты работают на мобильных устройствах
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Контрастность цветов соответствует WCAG
- [ ] Lighthouse оценки ≥ 90 по всем метрикам

**Любое несоответствие этим требованиям является блокером для мержа кода!** 🚫