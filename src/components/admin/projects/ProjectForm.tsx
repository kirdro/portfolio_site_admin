import React, { useState, useCallback } from "react";
import { z } from "zod";
import type { ProjectData } from "../../../app/(dashboard)/projects/page";
import { ImageUpload } from "../shared/ImageUpload";

interface ProjectFormProps {
  project?: ProjectData | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Zod схема валидации проекта
const projectSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(100, "Название слишком длинное"),
  description: z.string().min(10, "Описание минимум 10 символов").max(500, "Описание слишком длинное"),
  imageUrl: z.string().url("Некорректный URL изображения").optional().nullable(),
  demoUrl: z.string().url("Некорректный URL демо").optional().nullable(),
  githubUrl: z.string().url("Некорректный URL репозитория").optional().nullable(),
  featured: z.boolean(),
  tags: z.array(z.string()).min(1, "Добавьте хотя бы один тег"),
});

/**
 * Форма создания/редактирования проекта
 * Поддержка валидации, загрузки изображений и управления тегами
 */
export function ProjectForm({ project, isCreating, onClose, onSave }: ProjectFormProps) {
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    imageUrl: project?.imageUrl || "",
    demoUrl: project?.demoUrl || "",
    githubUrl: project?.githubUrl || "",
    featured: project?.featured || false,
    tags: project?.tags || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState("");

  // Доступные теги для автодополнения
  const availableTags = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
    "TailwindCSS", "CSS", "HTML", "Vue.js", "Angular", "Express",
    "MongoDB", "PostgreSQL", "MySQL", "AI", "Machine Learning", "Blockchain",
    "DevOps", "Docker", "AWS", "Firebase", "Vercel", "API"
  ];

  // Обработчик изменения полей формы
  const обработчикИзмененияПоля = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку поля при изменении
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Обработчик добавления тега
  const обработчикДобавленияТега = useCallback(() => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag("");
    }
  }, [currentTag, formData.tags]);

  // Обработчик удаления тега
  const обработчикУдаленияТега = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Обработчик загрузки изображения
  const обработчикЗагрузкиИзображения = useCallback((imageUrl: string) => {
    обработчикИзмененияПоля("imageUrl", imageUrl);
  }, [обработчикИзмененияПоля]);

  // Валидация формы
  const валидироватьФорму = () => {
    try {
      projectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Обработчик отправки формы
  const обработчикОтправки = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!валидироватьФорму()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Здесь будет вызов tRPC мутации для создания/обновления проекта
      console.log("Сохранение проекта:", formData);
      
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave();
    } catch (error) {
      console.error("Ошибка сохранения проекта:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, валидироватьФорму]);

  return (
    <div className="fixed inset-0 bg-bg/80 flex items-center justify-center p-4 z-50">
      <div className="bg-panel border border-line rounded-lg bevel max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Заголовок формы */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neon glyph-glow">
              {isCreating ? "➕ Создать проект" : "✏️ Редактировать проект"}
            </h2>
            <button
              onClick={onClose}
              className="text-soft hover:text-base transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={обработчикОтправки} className="space-y-6">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Название проекта *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => обработчикИзмененияПоля("title", e.target.value)}
                className={`w-full px-3 py-2 bg-subtle border rounded-md text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                           ${errors.title ? "border-red-500" : "border-line"}`}
                placeholder="Введите название проекта"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Описание *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => обработчикИзмененияПоля("description", e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 bg-subtle border rounded-md text-base resize-none
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                           ${errors.description ? "border-red-500" : "border-line"}`}
                placeholder="Подробное описание проекта"
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-red-400 text-sm">{errors.description}</p>
                ) : (
                  <div />
                )}
                <span className="text-xs text-soft">
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Загрузка изображения */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Изображение проекта
              </label>
              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUpload={обработчикЗагрузкиИзображения}
              />
            </div>

            {/* URL ссылки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-base mb-2">
                  Ссылка на демо
                </label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => обработчикИзмененияПоля("demoUrl", e.target.value)}
                  className={`w-full px-3 py-2 bg-subtle border rounded-md text-base
                             focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                             ${errors.demoUrl ? "border-red-500" : "border-line"}`}
                  placeholder="https://example.com"
                />
                {errors.demoUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.demoUrl}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-base mb-2">
                  Ссылка на GitHub
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => обработчикИзмененияПоля("githubUrl", e.target.value)}
                  className={`w-full px-3 py-2 bg-subtle border rounded-md text-base
                             focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                             ${errors.githubUrl ? "border-red-500" : "border-line"}`}
                  placeholder="https://github.com/user/repo"
                />
                {errors.githubUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.githubUrl}</p>
                )}
              </div>
            </div>

            {/* Теги */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Технологии *
              </label>
              
              {/* Поле добавления тега */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), обработчикДобавленияТега())}
                  className="flex-1 px-3 py-2 bg-subtle border border-line rounded-md text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
                  placeholder="Добавить технологию"
                  list="available-tags"
                />
                <button
                  type="button"
                  onClick={обработчикДобавленияТега}
                  className="px-3 py-2 bg-neon/20 border border-neon text-neon rounded-md
                           hover:bg-neon/30 transition-colors"
                >
                  ➕
                </button>
              </div>

              {/* Автодополнение */}
              <datalist id="available-tags">
                {availableTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>

              {/* Список текущих тегов */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center px-3 py-1 bg-panel border border-line 
                             rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => обработчикУдаленияТега(tag)}
                      className="ml-2 text-soft hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              {errors.tags && (
                <p className="text-red-400 text-sm mt-1">{errors.tags}</p>
              )}
            </div>

            {/* Избранный проект */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => обработчикИзмененияПоля("featured", e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm text-base">
                ⭐ Отметить как избранный проект
              </label>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-neon/20 border border-neon text-neon
                         hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         bevel transition-all duration-300"
              >
                {isSubmitting ? "Сохранение..." : (isCreating ? "Создать" : "Сохранить")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-subtle border border-line text-base
                         hover:border-soft rounded-md
                         transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}