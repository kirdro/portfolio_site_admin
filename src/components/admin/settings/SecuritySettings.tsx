"use client";

import React, { useState, useCallback } from "react";
import type { SettingsData } from "../../../app/(dashboard)/settings/page";

interface SecuritySettingsProps {
  settings: SettingsData;
  onSave: (updatedSettings: Partial<SettingsData>) => void;
}

/**
 * Компонент настроек безопасности
 * Управление доступом, логи, блокировки
 */
export function SecuritySettings({ 
  settings, 
  onSave 
}: SecuritySettingsProps) {

  const [настройкиБезопасности, setНастройкиБезопасности] = useState(settings);
  const [сохранение, setСохранение] = useState(false);

  // Mock данные для демонстрации безопасности
  const данныеБезопасности = {
    активныеСессии: 3,
    неудачныеВходы: 12,
    заблокированныеIP: [
      { ip: "192.168.1.100", reason: "Подбор пароля", blockedAt: "2024-09-06 10:30" },
      { ip: "10.0.0.15", reason: "Спам запросы", blockedAt: "2024-09-06 09:15" }
    ],
    последнийВход: "2024-09-06 14:30:00",
    логиБезопасности: [
      { time: "14:30", event: "Успешный вход", user: "kirdro@yandex.ru", ip: "127.0.0.1" },
      { time: "12:15", event: "Неудачная попытка входа", user: "admin@test.com", ip: "192.168.1.100" },
      { time: "10:45", event: "Изменение настроек", user: "kirdro@yandex.ru", ip: "127.0.0.1" },
      { time: "09:20", event: "Создание проекта", user: "kirdro@yandex.ru", ip: "127.0.0.1" }
    ]
  };

  // Обработчик изменения настроек
  const обработчикИзменения = useCallback((field: keyof SettingsData, value: any) => {
    setНастройкиБезопасности(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Обработчик сохранения настроек
  const обработчикСохранения = useCallback(async () => {
    setСохранение(true);
    try {
      await onSave(настройкиБезопасности);
    } catch (error) {
      console.error("Ошибка сохранения настроек безопасности:", error);
    } finally {
      setСохранение(false);
    }
  }, [настройкиБезопасности, onSave]);

  // Обработчик разблокировки IP
  const обработчикРазблокировки = useCallback((ip: string) => {
    if (confirm(`Разблокировать IP адрес ${ip}?`)) {
      console.log("Разблокировка IP:", ip);
    }
  }, []);

  // Обработчик завершения всех сессий
  const обработчикЗавершенияСессий = useCallback(() => {
    if (confirm("Завершить все активные сессии? Потребуется повторный вход.")) {
      console.log("Завершение всех сессий...");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Статус безопасности */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🛡️</span>
          <span>Статус безопасности</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-base mb-1">Активные сессии</div>
            <div className="font-mono text-lg text-green-400">
              {данныеБезопасности.активныеСессии}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">❌</div>
            <div className="font-medium text-base mb-1">Неудачные входы</div>
            <div className="font-mono text-lg text-red-400">
              {данныеБезопасности.неудачныеВходы}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">🚫</div>
            <div className="font-medium text-base mb-1">Заблокированные IP</div>
            <div className="font-mono text-lg text-orange-400">
              {данныеБезопасности.заблокированныеIP.length}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">🕐</div>
            <div className="font-medium text-base mb-1">Последний вход</div>
            <div className="font-mono text-sm text-cyan">
              {данныеБезопасности.последнийВход}
            </div>
          </div>
        </div>
      </div>

      {/* Настройки аутентификации */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🔐</span>
          <span>Настройки аутентификации</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-soft mb-2">
                Время жизни сессии (минуты)
              </label>
              <input
                type="number"
                min="15"
                max="1440"
                value={настройкиБезопасности.sessionTimeout}
                onChange={(e) => обработчикИзменения('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              />
              <div className="text-xs text-soft mt-1">
                Текущее значение: {настройкиБезопасности.sessionTimeout} минут
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Двухфакторная аутентификация</div>
                <div className="text-sm text-soft">2FA для администраторов</div>
              </div>
              <div className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 rounded text-sm">
                В РАЗРАБОТКЕ
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Email уведомления</div>
                <div className="text-sm text-soft">Уведомления о входе в систему</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={настройкиБезопасности.emailNotifications}
                  onChange={(e) => обработчикИзменения('emailNotifications', e.target.checked)}
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
            <div className="p-4 bg-panel rounded border border-line">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-base">Доступ к админ-панели</span>
                <div className="px-2 py-1 bg-green-400/20 border border-green-400/50 text-green-400 rounded text-xs">
                  ОГРАНИЧЕН
                </div>
              </div>
              <div className="text-sm text-soft space-y-1">
                <div>Только: <span className="font-mono text-cyan">kirdro@yandex.ru</span></div>
                <div>Роль: <span className="font-mono text-neon">ADMIN</span></div>
                <div>IP ограничения: <span className="text-orange-400">Отключены</span></div>
              </div>
            </div>

            <button
              onClick={обработчикЗавершенияСессий}
              className="w-full p-3 bg-red-400/20 border border-red-400 text-red-400
                       hover:bg-red-400/30 rounded font-medium transition-colors"
            >
              🔴 Завершить все активные сессии
            </button>
          </div>
        </div>
      </div>

      {/* Заблокированные IP */}
      {данныеБезопасности.заблокированныеIP.length > 0 && (
        <div className="bg-subtle border border-line rounded-lg bevel p-6">
          <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
            <span>🚫</span>
            <span>Заблокированные IP адреса</span>
          </h3>

          <div className="space-y-3">
            {данныеБезопасности.заблокированныеIP.map((blocked, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-panel rounded border border-line">
                <div className="flex-1">
                  <div className="font-mono text-red-400 font-medium">{blocked.ip}</div>
                  <div className="text-sm text-soft">
                    Причина: {blocked.reason} • Заблокирован: {blocked.blockedAt}
                  </div>
                </div>
                <button
                  onClick={() => обработчикРазблокировки(blocked.ip)}
                  className="px-3 py-1 bg-green-400/20 border border-green-400 text-green-400
                           hover:bg-green-400/30 rounded text-sm font-medium transition-colors"
                >
                  Разблокировать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Логи безопасности */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>📋</span>
          <span>Логи безопасности</span>
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {данныеБезопасности.логиБезопасности.map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-panel rounded border border-line text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-mono text-soft">{log.time}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium
                  ${log.event.includes('Успешный') ? 'bg-green-400/20 text-green-400 border border-green-400/50' :
                    log.event.includes('Неудачная') ? 'bg-red-400/20 text-red-400 border border-red-400/50' :
                    'bg-cyan/20 text-cyan border border-cyan/50'}`}>
                  {log.event}
                </span>
                <span className="text-base">{log.user}</span>
              </div>
              <span className="font-mono text-soft text-xs">{log.ip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка сохранения */}
      <div className="flex items-center justify-end p-4 bg-panel border border-line rounded-lg bevel">
        <button
          onClick={обработчикСохранения}
          disabled={сохранение}
          className="px-6 py-2 bg-red-400/20 border border-red-400 text-red-400
                   hover:bg-red-400/30 hover:shadow-neon disabled:opacity-50
                   disabled:cursor-not-allowed rounded font-medium
                   bevel transition-all duration-300"
        >
          {сохранение ? "🔒 Сохранение..." : "🔒 Сохранить настройки безопасности"}
        </button>
      </div>
    </div>
  );
}