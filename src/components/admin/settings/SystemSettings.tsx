"use client";

import React, { useState, useCallback } from "react";
import { api } from "../../../utils/api";

interface SystemSettingsData {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  timezone: string;
  language: string;
}

interface SystemSettingsProps {
  onRestart: () => void;
}

/**
 * Компонент общих системных настроек
 * Конфигурация сайта, режимы работы, лимиты
 */
export function SystemSettings({ 
  onRestart 
}: SystemSettingsProps) {

  const [сохранение, setСохранение] = useState(false);

  // Загружаем настройки из API
  const { data: settings, isLoading, refetch } = api.settings.getSystemSettings.useQuery();
  
  // Создаем локальное состояние формы
  const [формаНастроек, setФормаНастроек] = useState<SystemSettingsData>({
    siteName: "Kirdro Portfolio Admin",
    siteDescription: "Административная панель портфолио",
    maintenanceMode: false,
    allowRegistration: false,
    maxFileSize: 10,
    timezone: "Europe/Moscow",
    language: "ru",
  });

  // Обновляем форму при загрузке данных
  React.useEffect(() => {
    if (settings) {
      setФормаНастроек(settings);
    }
  }, [settings]);

  // Мутация для сохранения настроек
  const saveSettingsMutation = api.settings.setSystemSettings.useMutation({
    onSuccess: () => {
      void refetch();
      setСохранение(false);
    },
    onError: (error) => {
      console.error("Ошибка сохранения настроек:", error);
      setСохранение(false);
    },
  });

  // Обработчик изменения значений формы
  const обработчикИзменения = useCallback((field: keyof SystemSettingsData, value: any) => {
    setФормаНастроек(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Обработчик сохранения настроек
  const обработчикСохранения = useCallback(() => {
    setСохранение(true);
    saveSettingsMutation.mutate(формаНастроек);
  }, [формаНастроек, saveSettingsMutation]);

  // Обработчик сброса к исходным значениям
  const обработчикСброса = useCallback(() => {
    if (settings) {
      setФормаНастроек(settings);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neon text-lg">
          ⏳ Загрузка настроек...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Основные настройки сайта */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🌐</span>
          <span>Основные настройки сайта</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Название сайта
            </label>
            <input
              type="text"
              value={формаНастроек.siteName}
              onChange={(e) => обработчикИзменения('siteName', e.target.value)}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Часовой пояс
            </label>
            <select
              value={формаНастроек.timezone}
              onChange={(e) => обработчикИзменения('timezone', e.target.value)}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon transition-colors"
            >
              <option value="Europe/Moscow">🇷🇺 Москва (UTC+3)</option>
              <option value="Europe/London">🇬🇧 Лондон (UTC+0)</option>
              <option value="America/New_York">🇺🇸 Нью-Йорк (UTC-5)</option>
              <option value="Asia/Tokyo">🇯🇵 Токио (UTC+9)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-soft mb-2">
              Описание сайта
            </label>
            <textarea
              value={формаНастроек.siteDescription}
              onChange={(e) => обработчикИзменения('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                       resize-vertical"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Язык интерфейса
            </label>
            <select
              value={формаНастроек.language}
              onChange={(e) => обработчикИзменения('language', e.target.value)}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon transition-colors"
            >
              <option value="ru">🇷🇺 Русский</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Максимальный размер файла (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={формаНастроек.maxFileSize}
              onChange={(e) => обработчикИзменения('maxFileSize', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Режимы работы */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Режимы работы системы</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Режим обслуживания</div>
                <div className="text-sm text-soft">Временное отключение сайта</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={формаНастроек.maintenanceMode}
                  onChange={(e) => обработчикИзменения('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                             peer-checked:bg-neon"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Регистрация пользователей</div>
                <div className="text-sm text-soft">Открытая регистрация</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={формаНастроек.allowRegistration}
                  onChange={(e) => обработчикИзменения('allowRegistration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                             peer-checked:bg-green-400"></div>
              </label>
            </div>
          </div>
        </div>
      </div>


      {/* Кнопки управления */}
      <div className="flex items-center justify-between p-4 bg-panel border border-line rounded-lg bevel">
        <div className="flex items-center space-x-3">
          <button
            onClick={обработчикСброса}
            className="px-4 py-2 bg-subtle border border-line text-soft
                     hover:border-soft hover:text-base rounded font-medium
                     transition-colors"
          >
            🔄 Сбросить
          </button>
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400
                     hover:bg-yellow-400/30 rounded font-medium transition-colors"
          >
            ⚡ Перезагрузить сервер
          </button>
        </div>

        <button
          onClick={обработчикСохранения}
          disabled={сохранение}
          className="px-6 py-2 bg-neon/20 border border-neon text-neon
                   hover:bg-neon/30 hover:shadow-neon disabled:opacity-50
                   disabled:cursor-not-allowed rounded font-medium
                   bevel transition-all duration-300"
        >
          {сохранение ? "💾 Сохранение..." : "💾 Сохранить настройки"}
        </button>
      </div>
    </div>
  );
}