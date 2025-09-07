"use client";

import React, { useState, useCallback } from "react";
import type { SettingsData } from "../../../app/(dashboard)/settings/page";

interface SystemSettingsProps {
  settings: SettingsData;
  onSave: (updatedSettings: Partial<SettingsData>) => void;
  onRestart: () => void;
}

/**
 * Компонент общих системных настроек
 * Конфигурация сайта, режимы работы, лимиты
 */
export function SystemSettings({ 
  settings, 
  onSave,
  onRestart 
}: SystemSettingsProps) {

  const [формаНастроек, setФормаНастроек] = useState<SettingsData>(settings);
  const [сохранение, setСохранение] = useState(false);

  // Обработчик изменения значений формы
  const обработчикИзменения = useCallback((field: keyof SettingsData, value: any) => {
    setФормаНастроек(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Обработчик сохранения настроек
  const обработчикСохранения = useCallback(async () => {
    setСохранение(true);
    try {
      await onSave(формаНастроек);
      // Здесь можно показать уведомление об успехе
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
    } finally {
      setСохранение(false);
    }
  }, [формаНастроек, onSave]);

  // Обработчик сброса к исходным значениям
  const обработчикСброса = useCallback(() => {
    setФормаНастроек(settings);
  }, [settings]);

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
              Email администратора
            </label>
            <input
              type="email"
              value={формаНастроек.adminEmail}
              onChange={(e) => обработчикИзменения('adminEmail', e.target.value)}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
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
              onChange={(e) => обработчикИзменения('language', e.target.value as "ru" | "en")}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon transition-colors"
            >
              <option value="ru">🇷🇺 Русский</option>
              <option value="en">🇺🇸 English</option>
            </select>
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

            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Режим отладки</div>
                <div className="text-sm text-soft">Подробные логи ошибок</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={формаНастроек.debugMode}
                  onChange={(e) => обработчикИзменения('debugMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                             peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Темная тема</div>
                <div className="text-sm text-soft">Киберпанк дизайн</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={формаНастроек.darkMode}
                  onChange={(e) => обработчикИзменения('darkMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                             peer-checked:bg-purple-400"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Email уведомления</div>
                <div className="text-sm text-soft">Отправка системных писем</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={формаНастроек.emailNotifications}
                  onChange={(e) => обработчикИзменения('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                             peer-checked:after:translate-x-full peer-checked:after:border-white 
                             after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                             peer-checked:bg-cyan"></div>
              </label>
            </div>

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

      {/* Лимиты и ограничения */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>📊</span>
          <span>Лимиты и ограничения</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Максимальный размер файла (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={формаНастроек.maxFileUploadSize}
              onChange={(e) => обработчикИзменения('maxFileUploadSize', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Время сессии (минуты)
            </label>
            <input
              type="number"
              min="15"
              max="1440"
              value={формаНастроек.sessionTimeout}
              onChange={(e) => обработчикИзменения('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Частота бекапов
            </label>
            <select
              value={формаНастроек.backupFrequency}
              onChange={(e) => обработчикИзменения('backupFrequency', e.target.value as "daily" | "weekly" | "monthly")}
              className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                       focus:border-neon transition-colors"
            >
              <option value="daily">📅 Ежедневно</option>
              <option value="weekly">📆 Еженедельно</option>
              <option value="monthly">🗓️ Ежемесячно</option>
            </select>
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