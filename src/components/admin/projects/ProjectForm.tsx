import React, { useState, useCallback } from "react";
import { z } from "zod";
import type { ProjectData } from "../../../app/(dashboard)/projects/page";
import { FileUploadDeferred } from "../../ui/FileUploadDeferred";
import { api } from "../../../utils/api";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../ui/Modal";
import { useToasts } from "../../ui/Toast";

interface ProjectFormProps {
  project?: ProjectData | null;
  isCreating: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Zod схема валидации проекта
const projectSchema = z.object({
  title: z.string().min(1, "Название обязательно").max(100, "Название слишком длинное"),
  description: z.string().min(10, "Описание минимум 10 символов").max(500, "Описание слишком длинное"),
  imageUrl: z.string().url("Некорректный URL изображения").or(z.literal("")).optional().nullable(),
  demoUrl: z.string().url("Некорректный URL демо").or(z.literal("")).optional().nullable(),
  githubUrl: z.string().url("Некорректный URL репозитория").or(z.literal("")).optional().nullable(),
  featured: z.boolean(),
  tags: z.array(z.string()).min(1, "Добавьте хотя бы один тег"),
});

/**
 * Форма создания/редактирования проекта
 * Поддержка валидации, загрузки изображений и управления тегами
 */
export function ProjectForm({ project, isCreating, isOpen, onClose, onSave }: ProjectFormProps) {
  
  const { success, error: showError } = useToasts();
  
  // Подключаем tRPC мутации
  const uploadFileMutation = api.files.upload.useMutation();
  
  const createMutation = api.admin.projects.create.useMutation({
    onSuccess: () => {
      success("Проект создан", "Новый проект успешно добавлен в портфолио");
      onSave();
    },
    onError: (error) => {
      console.error("Ошибка создания проекта:", error);
      showError("Ошибка создания", error.message);
    }
  });

  const updateMutation = api.admin.projects.update.useMutation({
    onSuccess: () => {
      success("Проект обновлен", "Изменения успешно сохранены");
      onSave();
    },
    onError: (error) => {
      console.error("Ошибка обновления проекта:", error);
      showError("Ошибка обновления", error.message);
    }
  });
  
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
  const [currentTag, setCurrentTag] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Расширенный список доступных технологий для автодополнения
  const availableTags = [
    // Frontend фреймворки и библиотеки
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "Remix", "Astro", "Gatsby", "Nuxt.js",
    // Языки программирования
    "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust", "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin",
    // Backend фреймворки
    "Node.js", "Express", "Fastify", "NestJS", "Strapi", "Django", "FastAPI", "Spring Boot", "Laravel",
    // Стилизация
    "TailwindCSS", "CSS", "SASS", "SCSS", "Styled Components", "Emotion", "Material-UI", "Ant Design", "Bootstrap",
    // Базы данных
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "DynamoDB", "Supabase", "PlanetScale",
    // ORM и ODM
    "Prisma", "TypeORM", "Sequelize", "Mongoose", "Drizzle", "MikroORM",
    // Инструменты сборки
    "Webpack", "Vite", "Parcel", "Rollup", "esbuild", "Turbopack", "Bun",
    // Облачные сервисы
    "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Railway", "Render", "Fly.io", "Heroku",
    // DevOps и контейнеризация
    "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Terraform", "Ansible",
    // API технологии
    "REST API", "GraphQL", "tRPC", "gRPC", "WebSocket", "Socket.io", "WebRTC",
    // Тестирование
    "Jest", "Vitest", "Cypress", "Playwright", "Testing Library", "Mocha", "Chai",
    // Другие технологии
    "AI", "Machine Learning", "Blockchain", "Web3", "Solidity", "IPFS", "Three.js", "WebGL",
    // Мобильная разработка
    "React Native", "Flutter", "Ionic", "Expo",
    // Сборщики и пакетные менеджеры
    "npm", "yarn", "pnpm",
    // Версионный контроль
    "Git", "GitHub", "GitLab", "Bitbucket",
    // Аналитика и мониторинг
    "Sentry", "DataDog", "New Relic", "Grafana", "Prometheus"
  ];

  // Состояние загрузки файла
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Обработчик изменения полей формы
  const handleFieldChange = useCallback((field: string, value: any) => {
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
  const handleAddTag = useCallback(() => {
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
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Обработчик выбора изображения
  const handleImageSelect = useCallback((file: File | null, previewUrl: string | null) => {
    setSelectedImageFile(file);
    setPreviewImageUrl(previewUrl);
  }, []);


  // Валидация формы
  const validateForm = () => {
    try {
      projectSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Обработчик отправки формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Если выбран новый файл изображения, загружаем его сначала в S3
      if (selectedImageFile) {
        setIsFileUploading(true);
        console.log('🔄 Загружаем изображение в S3...');
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]!;
            resolve(base64);
          };
        });
        reader.readAsDataURL(selectedImageFile);
        
        const base64 = await base64Promise;
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: base64,
          fileName: selectedImageFile.name,
          mimeType: selectedImageFile.type,
          category: 'project',
          maxSize: 5 * 1024 * 1024, // 5MB для проектов
        });
        
        imageUrl = uploadResult.url;
        setIsFileUploading(false);
        console.log('✅ Изображение загружено:', imageUrl);
      }

      // Подготавливаем данные для отправки
      const dataToSubmit = {
        title: formData.title,
        description: formData.description,
        imageUrl: imageUrl || null,
        demoUrl: formData.demoUrl || null,
        githubUrl: formData.githubUrl || null,
        featured: formData.featured,
        tags: formData.tags
      };

      if (isCreating) {
        // Создание нового проекта
        await createMutation.mutateAsync(dataToSubmit);
      } else if (project) {
        // Обновление существующего проекта
        await updateMutation.mutateAsync({
          id: project.id,
          ...dataToSubmit
        });
      }
    } catch (error) {
      // Ошибки уже обрабатываются в onError мутаций
      console.error("Ошибка при сохранении:", error);
      setIsFileUploading(false);
    }
  }, [formData, isCreating, project, createMutation, updateMutation, validateForm, selectedImageFile, uploadFileMutation]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "➕ Создать проект" : "✏️ Редактировать проект"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Название проекта *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
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
                onChange={(e) => handleFieldChange("description", e.target.value)}
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
              <FileUploadDeferred
                currentFileUrl={formData.imageUrl}
                onFileSelected={handleImageSelect}
                category="project"
                acceptedTypes="image/*"
                maxSize={5 * 1024 * 1024}
                preview={true}
              />
              {errors.imageUrl && (
                <p className="text-red-400 text-sm mt-1">{errors.imageUrl}</p>
              )}
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
                  onChange={(e) => handleFieldChange("demoUrl", e.target.value)}
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
                  onChange={(e) => handleFieldChange("githubUrl", e.target.value)}
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
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 bg-subtle border border-line rounded-md text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
                  placeholder="Добавить технологию"
                  list="available-tags"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
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
                      onClick={() => handleRemoveTag(tag)}
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
                onChange={(e) => handleFieldChange("featured", e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm text-base">
                ⭐ Отметить как избранный проект
              </label>
            </div>

        {/* Кнопки действий */}
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-subtle border border-line text-base
                     hover:border-soft rounded-md transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending || isFileUploading}
            className="px-6 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     bevel transition-all duration-300 flex items-center gap-2"
          >
            {isFileUploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-neon border-t-transparent"></div>
            )}
            {isFileUploading ? "Загрузка изображения..." : (createMutation.isPending || updateMutation.isPending) ? "Сохранение..." : (isCreating ? "Создать" : "Сохранить")}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}