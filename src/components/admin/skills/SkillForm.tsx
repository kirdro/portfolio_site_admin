"use client";

import React, { useState, useCallback } from "react";
import { z } from "zod";
import type { SkillData } from "../../../app/(dashboard)/skills/page";
import { api } from "../../../utils/api";
import { FileUpload } from "../../ui/FileUpload";

interface SkillFormProps {
  skill?: SkillData | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Zod схема валидации навыка
const skillSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(50, "Название слишком длинное"),
  category: z.enum(["Frontend", "Backend", "DevOps", "Tools", "Other"], {
    message: "Выберите категорию"
  }),
  level: z.number().min(1, "Минимальный уровень: 1%").max(100, "Максимальный уровень: 100%"),
  icon: z.string().min(1, "Выберите иконку").max(10, "Иконка слишком длинная"),
});

/**
 * Форма создания/редактирования навыка
 * Поддержка валидации, слайдера уровня и выбора иконки
 */
export function SkillForm({ skill, isCreating, onClose, onSave }: SkillFormProps) {
  
  // Подключаем tRPC мутации
  const createMutation = api.admin.skills.create.useMutation({
    onSuccess: () => {
      onSave();
    },
    onError: (error) => {
      console.error("Ошибка создания навыка:", error);
      alert(`Ошибка: ${error.message}`);
    }
  });

  const updateMutation = api.admin.skills.update.useMutation({
    onSuccess: () => {
      onSave();
    },
    onError: (error) => {
      console.error("Ошибка обновления навыка:", error);
      alert(`Ошибка: ${error.message}`);
    }
  });
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: skill?.name || "",
    category: skill?.category || "Frontend" as const,
    level: skill?.level || 50,
    icon: skill?.icon || "⚡",
  });
  
  const [useCustomIcon, setUseCustomIcon] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Доступные категории
  const категории = [
    { value: "Frontend", label: "Frontend", icon: "🎨" },
    { value: "Backend", label: "Backend", icon: "⚙️" },
    { value: "DevOps", label: "DevOps", icon: "🚀" },
    { value: "Tools", label: "Инструменты", icon: "🛠️" },
    { value: "Other", label: "Другое", icon: "💡" },
  ] as const;

  // Популярные иконки для навыков
  const популярныеИконки = [
    "⚛️", "📘", "🟨", "🔷", "🟢", "🔥", "⚡", "💎", 
    "🚀", "🛠️", "🐳", "☁️", "🔧", "📊", "🎨", "💻",
    "🌐", "🗄️", "🔒", "📱", "⭐", "🎯", "💡", "🏆"
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

  // Валидация формы
  const валидироватьФорму = () => {
    try {
      skillSchema.parse(formData);
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
    
    try {
      if (isCreating) {
        // Создание нового навыка
        await createMutation.mutateAsync(formData);
      } else if (skill) {
        // Обновление существующего навыка
        await updateMutation.mutateAsync({
          id: skill.id,
          ...formData
        });
      }
    } catch (error) {
      // Ошибки уже обрабатываются в onError мутаций
      console.error("Ошибка при сохранении:", error);
    }
  }, [formData, isCreating, skill, createMutation, updateMutation, валидироватьФорму]);

  // Определение цвета уровня
  const определитьЦветУровня = (level: number) => {
    if (level >= 90) return "text-green-400 bg-green-400";
    if (level >= 70) return "text-yellow-400 bg-yellow-400";
    if (level >= 50) return "text-orange-400 bg-orange-400";
    return "text-red-400 bg-red-400";
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-panel border border-line rounded-lg bevel max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-neon/10">
        <div className="p-6">
          {/* Заголовок формы */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neon glyph-glow">
              {isCreating ? "➕ Добавить навык" : "✏️ Редактировать навык"}
            </h2>
            <button
              onClick={onClose}
              className="text-soft hover:text-base transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={обработчикОтправки} className="space-y-6">
            {/* Название навыка */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Название навыка *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => обработчикИзмененияПоля("name", e.target.value)}
                className={`w-full px-3 py-2 bg-subtle border rounded-md text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                           ${errors.name ? "border-red-500" : "border-line"}`}
                placeholder="React, TypeScript, Docker..."
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Категория */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Категория *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {категории.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => обработчикИзмененияПоля("category", category.value)}
                    className={`p-3 border rounded-md transition-all duration-300 text-center
                               ${formData.category === category.value
                                 ? "border-neon bg-neon/20 text-neon shadow-neon"
                                 : "border-line bg-subtle text-soft hover:border-soft"
                               }`}
                  >
                    <div className="text-xl mb-1">{category.icon}</div>
                    <div className="text-xs">{category.label}</div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Уровень владения */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Уровень владения * ({formData.level}%)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => обработчикИзмененияПоля("level", parseInt(e.target.value))}
                  className="w-full h-2 bg-subtle rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-soft">
                  <span>1% (Новичок)</span>
                  <span className={`font-bold ${определитьЦветУровня(formData.level).split(' ')[0]} glyph-glow`}>
                    {formData.level >= 90 ? "Эксперт" : 
                     formData.level >= 70 ? "Продвинутый" :
                     formData.level >= 50 ? "Средний" : "Начинающий"}
                  </span>
                  <span>100% (Эксперт)</span>
                </div>
                {/* Прогресс бар */}
                <div className="w-full bg-panel rounded-full h-3 border border-line">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${определитьЦветУровня(formData.level).split(' ')[1]}`}
                    style={{ width: `${formData.level}%` }}
                  />
                </div>
              </div>
              {errors.level && (
                <p className="text-red-400 text-sm mt-1">{errors.level}</p>
              )}
            </div>

            {/* Иконка */}
            <div>
              <label className="block text-sm font-medium text-base mb-2">
                Иконка навыка *
              </label>
              
              {/* Переключатель типа иконки */}
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUseCustomIcon(false)}
                  className={`px-3 py-2 rounded border transition-colors ${
                    !useCustomIcon
                      ? "border-neon bg-neon/20 text-neon"
                      : "border-line bg-subtle text-soft hover:border-soft"
                  }`}
                >
                  🎨 Эмодзи
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomIcon(true)}
                  className={`px-3 py-2 rounded border transition-colors ${
                    useCustomIcon
                      ? "border-neon bg-neon/20 text-neon"
                      : "border-line bg-subtle text-soft hover:border-soft"
                  }`}
                >
                  📁 Загрузить файл
                </button>
              </div>
              
              {!useCustomIcon ? (
                <div className="space-y-3">
                  {/* Текущая иконка */}
                  <div className="flex items-center space-x-3 p-3 bg-subtle border border-line rounded-md">
                    <div className="text-3xl">{formData.icon}</div>
                    <div>
                      <div className="text-sm font-medium">Выбрана иконка</div>
                      <div className="text-xs text-soft">Нажмите на иконку ниже для изменения</div>
                    </div>
                  </div>
                  
                  {/* Популярные иконки */}
                  <div className="grid grid-cols-8 gap-2">
                    {популярныеИконки.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => обработчикИзмененияПоля("icon", icon)}
                        className={`p-2 border rounded-md transition-all duration-300 text-xl
                                   hover:scale-110 active:scale-95
                                   ${formData.icon === icon
                                     ? "border-neon bg-neon/20 text-neon shadow-neon"
                                     : "border-line bg-subtle text-base hover:border-soft"
                                   }`}
                        title={`Выбрать ${icon}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Загрузка файла иконки */
                <FileUpload
                  currentFileUrl={formData.icon.startsWith('http') ? formData.icon : ''}
                  onFileUploaded={(url) => обработчикИзмененияПоля("icon", url)}
                  onFileDeleted={() => обработчикИзмененияПоля("icon", "⚡")}
                  category="skill"
                  acceptedTypes="image/*,.svg"
                  maxSize={1 * 1024 * 1024}
                  preview={true}
                />
              )}
              {errors.icon && (
                <p className="text-red-400 text-sm mt-1">{errors.icon}</p>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-neon/20 border border-neon text-neon
                         hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         bevel transition-all duration-300"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Сохранение..." : (isCreating ? "Создать" : "Сохранить")}
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