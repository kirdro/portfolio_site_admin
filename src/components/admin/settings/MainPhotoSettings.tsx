"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { FileUpload } from "../../ui/FileUpload";
import { useToasts } from "../../ui/Toast";

/**
 * Компонент настроек главной страницы сайта
 * Управление фото владельца для главной страницы
 */
export function MainPhotoSettings() {
  const { success, error: showError } = useToasts();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Получение текущих настроек
  const { data: settings, refetch: refetchSettings } = api.settings.getAll.useQuery() as any;
  
  // Мутации для управления настройками  
  const updateSettingMutation = api.settings.update.useMutation() as any;
  
  // Колбэки для успеха и ошибки
  updateSettingMutation.onSuccess = () => {
    success("Настройки сохранены", "Фото владельца успешно обновлено");
    refetchSettings();
  };
  
  updateSettingMutation.onError = (error: any) => {
    console.error("Ошибка сохранения настроек:", error);
    showError("Ошибка сохранения", error.message);
  };

  // Загрузка текущего фото при получении настроек
  useEffect(() => {
    if (settings) {
      const mainPhotoSetting = settings.find((setting: any) => setting.key === "main_photo");
      if (mainPhotoSetting && mainPhotoSetting.value) {
        try {
          const photoData = typeof mainPhotoSetting.value === 'string' 
            ? JSON.parse(mainPhotoSetting.value)
            : mainPhotoSetting.value;
          setCurrentPhotoUrl(photoData.url || "");
        } catch (error) {
          console.error("Ошибка парсинга настроек фото:", error);
        }
      }
      setIsLoading(false);
    }
  }, [settings]);

  // Обработчик загрузки нового фото
  const handlePhotoUploaded = async (newPhotoUrl: string) => {
    const photoData = {
      url: newPhotoUrl,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await updateSettingMutation.mutateAsync({
        key: "main_photo",
        value: photoData
      });
      setCurrentPhotoUrl(newPhotoUrl);
    } catch (error) {
      console.error("Ошибка сохранения фото:", error);
    }
  };

  // Обработчик удаления фото
  const handlePhotoDeleted = async () => {
    try {
      await updateSettingMutation.mutateAsync({
        key: "main_photo", 
        value: { url: "", uploadedAt: null }
      });
      setCurrentPhotoUrl("");
    } catch (error) {
      console.error("Ошибка удаления фото:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="cyber-card p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-neon border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-mono" style={{color: '#B8C5C0'}}>ЗАГРУЗКА НАСТРОЕК...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6">
      {/* Заголовок секции */}
      <div className="mb-6">
        <h3 className="text-xl font-mono font-bold glyph-glow mb-2" style={{color: '#00FF99'}}>
          ФОТО ВЛАДЕЛЬЦА
        </h3>
        <p className="text-sm font-mono" style={{color: '#B8C5C0'}}>
          Загрузите фото для отображения на главной странице портфолио-сайта kirdro.ru
        </p>
      </div>

      {/* Текущее состояние */}
      <div className="mb-6 p-4 bg-bg-subtle border border-line rounded bevel">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: currentPhotoUrl ? '#00FF99' : '#FF8C00'}}></div>
            <span className="font-mono" style={{color: '#B8C5C0'}}>
              Статус: {currentPhotoUrl ? "ФОТО УСТАНОВЛЕНО" : "ФОТО НЕ ВЫБРАНО"}
            </span>
          </div>
          {currentPhotoUrl && (
            <a 
              href="https://kirdro.ru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-sm hover:text-neon transition-colors" 
              style={{color: '#00FFCC'}}
            >
              ПОСМОТРЕТЬ НА САЙТЕ ↗
            </a>
          )}
        </div>
      </div>

      {/* Компонент загрузки файла */}
      <div className="space-y-4">
        <FileUpload
          currentFileUrl={currentPhotoUrl}
          onFileUploaded={handlePhotoUploaded}
          onFileDeleted={handlePhotoDeleted}
          category="main_photo"
          acceptedTypes="image/*"
          maxSize={15 * 1024 * 1024}
          preview={true}
          className="cyber-border"
        />

        {/* Рекомендации */}
        <div className="bg-bg-subtle border border-line rounded p-4 bevel">
          <h4 className="font-mono font-bold mb-3 text-cyan">РЕКОМЕНДАЦИИ:</h4>
          <div className="space-y-2 text-sm font-mono" style={{color: '#B8C5C0'}}>
            <div className="flex items-center">
              <span className="text-neon mr-2">▸</span>
              Разрешение: минимум 800x800px
            </div>
            <div className="flex items-center">
              <span className="text-neon mr-2">▸</span>
              Соотношение: квадратное (1:1) или портретное (3:4)
            </div>
            <div className="flex items-center">
              <span className="text-neon mr-2">▸</span>
              Формат: JPG, PNG, WEBP
            </div>
            <div className="flex items-center">
              <span className="text-neon mr-2">▸</span>
              Максимальный размер: 15MB
            </div>
            <div className="flex items-center">
              <span className="text-neon mr-2">▸</span>
              Стиль: профессиональное фото в соответствии с киберпанк темой
            </div>
          </div>
        </div>

        {/* Предварительный просмотр в контексте сайта */}
        {currentPhotoUrl && (
          <div className="bg-bg-subtle border border-line rounded p-4 bevel">
            <h4 className="font-mono font-bold mb-3 text-purple-400">ПРЕДПРОСМОТР НА САЙТЕ:</h4>
            <div className="flex items-center space-x-4 p-4 bg-bg border border-line rounded">
              <img
                src={currentPhotoUrl}
                alt="Предпросмотр на сайте"
                className="w-16 h-16 rounded-full object-cover border-2 border-neon"
              />
              <div>
                <div className="font-mono text-lg glyph-glow" style={{color: '#00FF99'}}>
                  Кирилл Дроздов
                </div>
                <div className="font-mono text-sm" style={{color: '#00FFCC'}}>
                  Full-Stack Developer
                </div>
                <div className="font-mono text-xs" style={{color: '#B8C5C0'}}>
                  kirdro@yandex.ru
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Статус операции */}
      {updateSettingMutation.isPending && (
        <div className="mt-4 p-3 bg-neon/10 border border-neon/50 rounded">
          <div className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-neon border-t-transparent rounded-full mr-3"></div>
            <span className="font-mono text-neon">СОХРАНЕНИЕ ИЗМЕНЕНИЙ...</span>
          </div>
        </div>
      )}
    </div>
  );
}