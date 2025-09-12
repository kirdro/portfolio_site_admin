# ✅ ЧЕК-ЛИСТ: РЕАЛИЗАЦИЯ ФАЙЛОВОГО ХРАНИЛИЩА S3 С TRPC

> **Цель**: Создать полноценную систему загрузки файлов в S3 хранилище с отдельными tRPC эндпоинтами и интеграцией во все разделы админки

## 📋 КОНФИГУРАЦИОННЫЕ ДАННЫЕ

### S3 Настройки (ТВК Сервис)
```
S3_URL: https://s3.twcstorage.ru
S3_BUCKET: 4509b86b-9c6fee05-61b9-415d-b140-df489303583d  
S3_ACCESS_KEY: RC2KKQA8WR9OBCC4MJE2
S3_SECRET_KEY: IEQK64xFuPgTXFa2rZ3DWtumlcYdCl9WrpWeNQqN
S3_REGION: ru-1
```

## 🗄️ АНАЛИЗ БАЗЫ ДАННЫХ И ТРЕБУЕМЫХ ПОЛЕЙ

### 1. Анализ существующих таблиц для файлов
- [ ] **Project** - уже есть `imageUrl: String?` (строка 73)
- [ ] **Skill** - уже есть `icon: String?` (строка 92)
- [ ] **BlogPost** - уже есть `coverImage: String?` (строка 153)
- [ ] **User** - уже есть `image: String?` (строка 17)
- [ ] **files** - полная таблица для S3 файлов уже существует (строки 235-248)

### 2. Анализ существующей таблицы files
- [ ] **Проверить структуру**: id, size, uploadedBy, mimeType, originalName, s3Key, s3Url
- [ ] **Связи**: связана с users, electricity_readings, products
- [ ] **Готовность**: таблица полностью готова для использования!

### 3. Определить места для добавления загрузки файлов

#### Проекты (Projects)
- [ ] **Поле**: `imageUrl` (уже существует)
- [ ] **Типы файлов**: изображения (PNG, JPG, WEBP)  
- [ ] **Максимальный размер**: 5MB
- [ ] **Описание**: скриншоты, превью проектов

#### Навыки (Skills) 
- [ ] **Поле**: `icon` (уже существует)
- [ ] **Типы файлов**: изображения, SVG
- [ ] **Максимальный размер**: 1MB  
- [ ] **Описание**: иконки технологий

#### Блог (BlogPost)
- [ ] **Поле**: `coverImage` (уже существует)
- [ ] **Типы файлов**: изображения
- [ ] **Максимальный размер**: 10MB
- [ ] **Описание**: обложки статей

#### Чаты (общий и AI)
- [ ] **Требование**: добавить поля для файлов в сообщения
- [ ] **Новые поля в ChatMessage**: `attachments: String[]?`
- [ ] **Новые поля в AiChatMessage**: `attachments: String[]?`
- [ ] **Типы файлов**: изображения, документы
- [ ] **Максимальный размер**: 20MB

#### Главная страница сайта (Settings)
- [ ] **Поле в Settings**: key = "main_photo", value = { url: string }
- [ ] **Типы файлов**: изображения высокого качества
- [ ] **Максимальный размер**: 15MB
- [ ] **Описание**: фото владельца для главной страницы

## 🛠️ ТЕХНИЧЕСКАЯ РЕАЛИЗАЦИЯ

### 4. Установка и настройка пакетов
- [ ] Установить AWS SDK: `bun add @aws-sdk/client-s3`
- [ ] Установить multer для Next.js: `bun add multer @types/multer`
- [ ] Установить sharp для оптимизации изображений: `bun add sharp`

### 5. Создание S3 сервиса
- [ ] Создать `src/lib/s3.ts`:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const s3Client = new S3Client({
  endpoint: 'https://s3.twcstorage.ru',
  region: 'ru-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export const BUCKET_NAME = '4509b86b-9c6fee05-61b9-415d-b140-df489303583d';

export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ s3Key: string; s3Url: string }> {
  const s3Key = `portfolio-admin/${Date.now()}-${uuidv4()}-${fileName}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file,
      ContentType: mimeType,
    })
  );

  return {
    s3Key,
    s3Url: `https://s3.twcstorage.ru/${BUCKET_NAME}/${s3Key}`
  };
}

export async function deleteFileFromS3(s3Key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    })
  );
}
```

### 6. Создание файлового роутера tRPC
- [ ] Создать `src/server/api/routers/files.ts`:

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { uploadFileToS3, deleteFileFromS3 } from "../../../lib/s3";
import sharp from "sharp";

export const filesRouter = createTRPCRouter({
  // Загрузка файла
  upload: protectedProcedure
    .input(z.object({
      file: z.string(), // base64 encoded file
      fileName: z.string(),
      mimeType: z.string(),
      maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB default
      category: z.enum(['project', 'skill', 'blog', 'chat', 'main_photo']),
      optimizeImage: z.boolean().optional().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверка размера файла
      const fileBuffer = Buffer.from(input.file, 'base64');
      if (fileBuffer.length > input.maxSize) {
        throw new Error(`Файл слишком большой. Максимум: ${input.maxSize / 1024 / 1024}MB`);
      }

      // Оптимизация изображений
      let finalBuffer = fileBuffer;
      if (input.optimizeImage && input.mimeType.startsWith('image/')) {
        finalBuffer = await sharp(fileBuffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Загрузка в S3
      const { s3Key, s3Url } = await uploadFileToS3(
        finalBuffer,
        input.fileName,
        input.mimeType
      );

      // Сохранение в БД
      const fileRecord = await ctx.db.files.create({
        data: {
          s3Key,
          s3Url,
          size: finalBuffer.length,
          mimeType: input.mimeType,
          originalName: input.fileName,
          uploadedBy: ctx.session.user.id,
        },
      });

      return {
        id: fileRecord.id,
        url: s3Url,
        s3Key,
        size: finalBuffer.length,
      };
    }),

  // Удаление файла
  delete: protectedProcedure
    .input(z.object({
      fileId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.files.findUnique({
        where: { id: input.fileId }
      });

      if (!file) {
        throw new Error('Файл не найден');
      }

      // Удаление из S3
      await deleteFileFromS3(file.s3Key);

      // Удаление из БД
      await ctx.db.files.delete({
        where: { id: input.fileId }
      });

      return { success: true };
    }),

  // Получение файлов пользователя
  getUserFiles: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.files.findMany({
        where: {
          uploadedBy: ctx.session.user.id,
          ...(input.category && { originalName: { contains: input.category } }),
        },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      });
    }),
});
```

### 7. Подключение файлового роутера
- [ ] Добавить в `src/server/api/root.ts`:
```typescript
import { filesRouter } from "./routers/files";

export const appRouter = createTRPCRouter({
  // ... существующие роутеры
  files: filesRouter,
});
```

### 8. Обновление переменных окружения
- [ ] Добавить в `.env.admin`:
```env
S3_URL=https://s3.twcstorage.ru
S3_BUCKET=4509b86b-9c6fee05-61b9-415d-b140-df489303583d
S3_ACCESS_KEY=RC2KKQA8WR9OBCC4MJE2
S3_SECRET_KEY=IEQK64xFuPgTXFa2rZ3DWtumlcYdCl9WrpWeNQqN
S3_REGION=ru-1
```

## 🎨 UI КОМПОНЕНТЫ

### 9. Создание универсального компонента загрузки
- [ ] Создать `src/components/ui/FileUpload.tsx`:

```typescript
import React, { useState, useRef } from 'react';
import { api } from '../../utils/api';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

interface FileUploadProps {
  onFileUploaded: (fileUrl: string) => void;
  onFileDeleted?: () => void;
  currentFileUrl?: string;
  category: 'project' | 'skill' | 'blog' | 'chat' | 'main_photo';
  acceptedTypes?: string;
  maxSize?: number;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  currentFileUrl,
  category,
  acceptedTypes = 'image/*',
  maxSize = 10 * 1024 * 1024,
  preview = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadMutation = api.files.upload.useMutation({
    onSuccess: (data) => {
      onFileUploaded(data.url);
      setUploading(false);
    },
    onError: (error) => {
      console.error('Ошибка загрузки:', error);
      setUploading(false);
    },
  });

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      alert(`Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);
    
    // Конвертация файла в base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        file: base64,
        fileName: file.name,
        mimeType: file.type,
        category,
        maxSize,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Превью текущего файла */}
      {currentFileUrl && preview && (
        <div className="relative">
          <img 
            src={currentFileUrl} 
            alt="Предпросмотр"
            className="w-full h-48 object-cover rounded-lg border border-line"
          />
          {onFileDeleted && (
            <button
              onClick={onFileDeleted}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <FaTrash size={14} />
            </button>
          )}
        </div>
      )}

      {/* Зона загрузки */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-neon bg-neon/5' 
            : 'border-line hover:border-neon/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-neon border-t-transparent rounded-full mx-auto"></div>
            <p className="text-soft">Загрузка файла...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <FaUpload className="mx-auto text-4xl text-soft" />
            <div>
              <p className="text-base font-medium">Перетащите файл сюда</p>
              <p className="text-soft text-sm mt-1">или</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-neon/20 border border-neon text-neon rounded hover:bg-neon/30"
            >
              Выберите файл
            </button>
            <p className="text-xs text-soft">
              Макс. размер: {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};
```

## 🔗 ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩИЕ КОМПОНЕНТЫ

### 10. Интеграция в проекты
- [ ] Обновить `src/components/admin/projects/ProjectForm.tsx`:
  - [ ] Добавить FileUpload компонент
  - [ ] Связать с полем imageUrl
  - [ ] Обновить mutation для сохранения URL

### 11. Интеграция в навыки  
- [ ] Обновить `src/components/admin/skills/SkillForm.tsx`:
  - [ ] Добавить FileUpload для иконок
  - [ ] Поддержка SVG файлов

### 12. Интеграция в блог
- [ ] Обновить `src/components/admin/blog/BlogEditor.tsx`:
  - [ ] Добавить FileUpload для обложки
  - [ ] Интегрировать в BlockNote для изображений в контенте

### 13. Интеграция в чаты
- [ ] **Обновить схему БД** - добавить поля attachments:
```sql
ALTER TABLE "ChatMessage" ADD COLUMN "attachments" TEXT[];
ALTER TABLE "AiChatMessage" ADD COLUMN "attachments" TEXT[];
```

- [ ] Обновить `src/components/admin/chat/ChatMessages.tsx`:
  - [ ] Добавить отображение вложений
  - [ ] Кнопку загрузки файлов в сообщения

### 14. Настройки главной страницы
- [ ] Создать `src/components/admin/settings/MainPhotoSettings.tsx`:
  - [ ] FileUpload для фото владельца
  - [ ] Сохранение в Settings таблицу
  - [ ] Предпросмотр и кроппинг

## 🗄️ ОБНОВЛЕНИЯ БАЗЫ ДАННЫХ

### 15. Prisma схема - новые поля
- [ ] Добавить в `schema.prisma`:

```prisma
model ChatMessage {
  // ... существующие поля
  attachments String[] @default([])
}

model AiChatMessage {
  // ... существующие поля  
  attachments String[] @default([])
}
```

- [ ] Выполнить: `bunx prisma db push`
- [ ] Проверить изменения в базе данных

### 16. Обновление tRPC роутеров
- [ ] **admin.ts роутер**:
  - [ ] Обновить projects.create/update для работы с imageUrl
  - [ ] Обновить skills.create/update для работы с icon
  - [ ] Добавить поддержку attachments в чаты

- [ ] **blog.ts роутер**:
  - [ ] Обновить создание/редактирование постов с coverImage

- [ ] **settings.ts роутер**:
  - [ ] Добавить методы для main_photo

## 🧪 ТЕСТИРОВАНИЕ И БЕЗОПАСНОСТЬ

### 17. Безопасность загрузки
- [ ] Валидация типов файлов по MIME
- [ ] Проверка расширений файлов
- [ ] Ограничение размеров по категориям
- [ ] Антивирусная проверка (опционально)
- [ ] Rate limiting для загрузок

### 18. Оптимизация изображений
- [ ] Автоматическое сжатие через Sharp
- [ ] Генерация thumbnail'ов
- [ ] Конвертация в WebP
- [ ] Lazy loading в UI

### 19. Обработка ошибок
- [ ] Обработка ошибок S3
- [ ] Откат при неуспешной загрузке
- [ ] Пользовательские сообщения об ошибках
- [ ] Логирование всех операций

## 📊 МОНИТОРИНГ И СТАТИСТИКА

### 20. Аналитика файлов
- [ ] Добавить в дашборд статистику по файлам:
  - [ ] Общее количество файлов
  - [ ] Занятое место в S3
  - [ ] Самые популярные типы файлов
  - [ ] Активность загрузок по дням

### 21. Управление хранилищем
- [ ] Создать страницу управления файлами
- [ ] Возможность массового удаления
- [ ] Поиск файлов по названию/типу
- [ ] Просмотр орфанных файлов

## ✅ ФИНАЛЬНАЯ ВАЛИДАЦИЯ

### 22. Проверка всех интеграций
- [ ] **Проекты**: загрузка и отображение изображений ✓
- [ ] **Навыки**: иконки технологий ✓  
- [ ] **Блог**: обложки статей ✓
- [ ] **Чаты**: вложения в сообщениях ✓
- [ ] **Главная**: фото владельца ✓

### 23. Производительность
- [ ] Время загрузки файлов < 5 сек
- [ ] Прогресс-бары работают корректно  
- [ ] Превью генерируются быстро
- [ ] Нет блокировки UI при загрузке

### 24. Пользовательский опыт
- [ ] Интуитивный drag&drop
- [ ] Понятные сообщения об ошибках
- [ ] Прогресс загрузки
- [ ] Возможность отмены загрузки

---

## 📈 СТАТИСТИКА РЕАЛИЗАЦИИ

**Новых компонентов**: 5  
**Обновляемых компонентов**: 12  
**Новых tRPC эндпоинтов**: 3  
**Обновляемых схем БД**: 2  
**Ожидаемое время**: 8-10 часов  

---

## 🔐 ВАЖНЫЕ ЗАМЕЧАНИЯ

- **S3 ключи**: использовать только через переменные окружения
- **Безопасность**: все загрузки только для авторизованных пользователей  
- **Лимиты**: соблюдать размеры файлов по категориям
- **Архитектура**: следовать существующим паттернам проекта
- **Дизайн**: поддерживать киберпанк стиль с неоновыми акцентами

---

> **⚠️ КРИТИЧЕСКИ ВАЖНО**: Всегда держать в контексте `@docs/PROJECT_DOCUMENTATION_INDEX.md` и соблюдать все архитектурные требования!