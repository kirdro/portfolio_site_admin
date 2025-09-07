"use client";

import React, { useCallback } from "react";
import type { SystemStatus } from "../../../app/(dashboard)/settings/page";

interface DatabaseStatusProps {
  systemStatus: SystemStatus;
  onRestart: () => void;
}

/**
 * Компонент статуса базы данных и системной информации
 * Мониторинг подключения, производительности, ресурсов
 */
export function DatabaseStatus({ 
  systemStatus, 
  onRestart 
}: DatabaseStatusProps) {

  // Функция получения цвета статуса
  const получитьЦветСтатуса = useCallback((usage: number) => {
    if (usage < 50) return "green-400";
    if (usage < 80) return "yellow-400";
    return "red-400";
  }, []);

  // Обработчик создания бекапа
  const обработчикСозданияБекапа = useCallback(() => {
    if (confirm("Создать резервную копию базы данных? Это может занять несколько минут.")) {
      console.log("Создание бекапа базы данных...");
    }
  }, []);

  // Обработчик оптимизации БД
  const обработчикОптимизацииБД = useCallback(() => {
    if (confirm("Оптимизировать базу данных? Это может временно замедлить работу системы.")) {
      console.log("Оптимизация базы данных...");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Статус подключения к БД */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🗄️</span>
          <span>Статус базы данных</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Статус подключения</div>
                <div className="text-sm text-soft">PostgreSQL соединение</div>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded 
                ${systemStatus.database.status === 'connected' 
                  ? 'bg-green-400/20 border border-green-400/50 text-green-400' 
                  : 'bg-red-400/20 border border-red-400/50 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.database.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`}></div>
                <span className="font-medium">
                  {systemStatus.database.status === 'connected' ? 'ПОДКЛЮЧЕНО' : 'ОТКЛЮЧЕНО'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Версия PostgreSQL</div>
                <div className="text-sm text-soft">Текущая версия СУБД</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-cyan">{systemStatus.database.version}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Размер базы данных</div>
                <div className="text-sm text-soft">Общий объем данных</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-purple-400">{systemStatus.database.size}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-panel rounded border border-line">
              <div>
                <div className="font-medium text-base">Активные соединения</div>
                <div className="text-sm text-soft">Текущие подключения к БД</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-neon">{systemStatus.database.connections}</div>
                <div className="text-xs text-soft">из 100 максимум</div>
              </div>
            </div>

            <div className="p-4 bg-panel rounded border border-line">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-base">Нагрузка на БД</div>
                <div className="text-sm text-soft">
                  {Math.round((systemStatus.database.connections / 100) * 100)}%
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 
                    bg-${получитьЦветСтатуса((systemStatus.database.connections / 100) * 100)}`}
                  style={{ 
                    width: `${(systemStatus.database.connections / 100) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Системные ресурсы */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>💻</span>
          <span>Системные ресурсы</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Использование памяти */}
          <div className="p-4 bg-panel rounded border border-line">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💾</span>
                <span className="font-medium text-base">Память</span>
              </div>
              <div className="text-sm text-soft">
                {systemStatus.memory.used}MB / {systemStatus.memory.total}MB
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 
                  bg-${получитьЦветСтатуса(systemStatus.memory.usage)}`}
                style={{ width: `${systemStatus.memory.usage}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-soft mt-2">
              {systemStatus.memory.usage}% использовано
            </div>
          </div>

          {/* Использование диска */}
          <div className="p-4 bg-panel rounded border border-line">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💽</span>
                <span className="font-medium text-base">Дисковое пространство</span>
              </div>
              <div className="text-sm text-soft">
                {systemStatus.disk.used} / {systemStatus.disk.total}
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 
                  bg-${получитьЦветСтатуса(systemStatus.disk.usage)}`}
                style={{ width: `${systemStatus.disk.usage}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-soft mt-2">
              {systemStatus.disk.usage}% использовано
            </div>
          </div>
        </div>
      </div>

      {/* Информация о сервере */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🖥️</span>
          <span>Информация о сервере</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium text-base mb-1">Статус сервера</div>
            <div className={`font-mono text-sm px-2 py-1 rounded
              ${systemStatus.server.status === 'online' 
                ? 'bg-green-400/20 text-green-400 border border-green-400/50' 
                : 'bg-red-400/20 text-red-400 border border-red-400/50'}`}>
              {systemStatus.server.status.toUpperCase()}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">🕐</div>
            <div className="font-medium text-base mb-1">Время работы</div>
            <div className="font-mono text-sm text-cyan">
              {systemStatus.server.uptime}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-base mb-1">Версия Next.js</div>
            <div className="font-mono text-sm text-purple-400">
              {systemStatus.server.version}
            </div>
          </div>

          <div className="p-4 bg-panel rounded border border-line text-center">
            <div className="text-2xl mb-2">🚪</div>
            <div className="font-medium text-base mb-1">Порт сервера</div>
            <div className="font-mono text-sm text-yellow-400">
              :{systemStatus.server.port}
            </div>
          </div>
        </div>
      </div>

      {/* Действия по управлению БД */}
      <div className="bg-subtle border border-line rounded-lg bevel p-6">
        <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
          <span>🔧</span>
          <span>Управление базой данных</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={обработчикСозданияБекапа}
            className="p-4 bg-panel border border-line rounded hover:border-green-400 
                     hover:bg-green-400/10 transition-colors group"
          >
            <div className="text-center">
              <div className="text-2xl mb-2 group-hover:text-green-400 transition-colors">💾</div>
              <div className="font-medium text-base mb-1">Создать бекап</div>
              <div className="text-sm text-soft">Резервная копия БД</div>
            </div>
          </button>

          <button
            onClick={обработчикОптимизацииБД}
            className="p-4 bg-panel border border-line rounded hover:border-cyan 
                     hover:bg-cyan/10 transition-colors group"
          >
            <div className="text-center">
              <div className="text-2xl mb-2 group-hover:text-cyan transition-colors">⚡</div>
              <div className="font-medium text-base mb-1">Оптимизировать</div>
              <div className="text-sm text-soft">Улучшить производительность</div>
            </div>
          </button>

          <button
            onClick={onRestart}
            className="p-4 bg-panel border border-line rounded hover:border-yellow-400 
                     hover:bg-yellow-400/10 transition-colors group"
          >
            <div className="text-center">
              <div className="text-2xl mb-2 group-hover:text-yellow-400 transition-colors">🔄</div>
              <div className="font-medium text-base mb-1">Перезагрузить</div>
              <div className="text-sm text-soft">Перезапуск сервера</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}