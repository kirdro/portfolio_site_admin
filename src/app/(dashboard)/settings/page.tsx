"use client";

import React, { useState, useCallback } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { SystemSettings } from "../../../components/admin/settings/SystemSettings";
import { DatabaseStatus } from "../../../components/admin/settings/DatabaseStatus";
import { SecuritySettings } from "../../../components/admin/settings/SecuritySettings";

// Типы данных для системных настроек
export interface SettingsData {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  allowRegistration: boolean;
  maxFileUploadSize: number; // в MB
  sessionTimeout: number; // в минутах
  backupFrequency: "daily" | "weekly" | "monthly";
  emailNotifications: boolean;
  darkMode: boolean;
  language: "ru" | "en";
}

// Типы данных для статуса системы
export interface SystemStatus {
  server: {
    status: "online" | "offline" | "maintenance";
    uptime: string;
    version: string;
    port: number;
  };
  database: {
    status: "connected" | "disconnected" | "error";
    version: string;
    connections: number;
    size: string;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: string;
    total: string;
    usage: number;
  };
}

/**
 * Страница системных настроек админ-панели
 * Конфигурация сервера, база данных, безопасность
 */
export default function SettingsPage() {

  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState<"general" | "database" | "security">("general");

  // Mock данные для тестирования интерфейса
  const mockSettings: SettingsData = {
    siteName: "KIRDRO.RU Admin Panel",
    siteDescription: "Административная панель портфолио-сайта с киберпанк дизайном",
    adminEmail: "kirdro@yandex.ru",
    maintenanceMode: false,
    debugMode: false,
    allowRegistration: false,
    maxFileUploadSize: 10,
    sessionTimeout: 60,
    backupFrequency: "daily",
    emailNotifications: true,
    darkMode: true,
    language: "ru",
  };

  const mockSystemStatus: SystemStatus = {
    server: {
      status: "online",
      uptime: "3 дня 14 часов",
      version: "Next.js 15.5.2",
      port: 3007,
    },
    database: {
      status: "connected",
      version: "PostgreSQL 15.3",
      connections: 12,
      size: "47.2 MB",
    },
    memory: {
      used: 234,
      total: 512,
      usage: 46,
    },
    disk: {
      used: "1.2 GB",
      total: "10 GB",
      usage: 12,
    },
  };

  // Обработчик переключения вкладок
  const обработчикПереключенияВкладки = useCallback((tab: "general" | "database" | "security") => {
    setActiveTab(tab);
  }, []);

  // Обработчик сохранения настроек
  const обработчикСохраненияНастроек = useCallback((updatedSettings: Partial<SettingsData>) => {
    // В будущем здесь будет вызов tRPC мутации
    console.log("Сохранение настроек:", updatedSettings);
  }, []);

  // Обработчик перезагрузки системы
  const обработчикПерезагрузкиСистемы = useCallback(() => {
    if (confirm("Перезагрузить систему? Это может занять несколько минут.")) {
      // В будущем здесь будет вызов tRPC мутации
      console.log("Перезагрузка системы...");
    }
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neon glyph-glow">
              ⚙️ Системные настройки
            </h1>
            <p className="text-soft text-sm mt-1">
              Конфигурация и мониторинг админ-панели
            </p>
          </div>
        </div>

        {/* Статус системы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold glyph-glow ${
                  mockSystemStatus.server.status === "online" ? "text-green-400" : 
                  mockSystemStatus.server.status === "maintenance" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {mockSystemStatus.server.status === "online" && "ONLINE"}
                  {mockSystemStatus.server.status === "maintenance" && "MAINT"}
                  {mockSystemStatus.server.status === "offline" && "OFFLINE"}
                </div>
                <div className="text-sm text-soft">Статус сервера</div>
              </div>
              <div className={`text-2xl ${
                mockSystemStatus.server.status === "online" ? "text-green-400" : 
                mockSystemStatus.server.status === "maintenance" ? "text-yellow-400" : "text-red-400"
              }`}>
                🖥️
              </div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold glyph-glow ${
                  mockSystemStatus.database.status === "connected" ? "text-green-400" : "text-red-400"
                }`}>
                  {mockSystemStatus.database.connections}
                </div>
                <div className="text-sm text-soft">Подключения БД</div>
              </div>
              <div className={`text-2xl ${
                mockSystemStatus.database.status === "connected" ? "text-green-400" : "text-red-400"
              }`}>
                🗄️
              </div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold glyph-glow ${
                  mockSystemStatus.memory.usage < 50 ? "text-green-400" :
                  mockSystemStatus.memory.usage < 80 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {mockSystemStatus.memory.usage}%
                </div>
                <div className="text-sm text-soft">Память</div>
              </div>
              <div className={`text-2xl ${
                mockSystemStatus.memory.usage < 50 ? "text-green-400" :
                mockSystemStatus.memory.usage < 80 ? "text-yellow-400" : "text-red-400"
              }`}>
                💾
              </div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold glyph-glow ${
                  mockSystemStatus.disk.usage < 50 ? "text-green-400" :
                  mockSystemStatus.disk.usage < 80 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {mockSystemStatus.disk.usage}%
                </div>
                <div className="text-sm text-soft">Диск</div>
              </div>
              <div className={`text-2xl ${
                mockSystemStatus.disk.usage < 50 ? "text-green-400" :
                mockSystemStatus.disk.usage < 80 ? "text-yellow-400" : "text-red-400"
              }`}>
                💽
              </div>
            </div>
          </div>
        </div>

        {/* Вкладки настроек */}
        <div className="bg-panel border border-line rounded-lg bevel">
          <div className="flex border-b border-line">
            <button
              onClick={() => обработчикПереключенияВкладки("general")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${activeTab === "general" 
                           ? "text-neon border-neon bg-neon/10" 
                           : "text-soft hover:text-base hover:bg-subtle/50"
                         }`}
            >
              ⚙️ Общие настройки
            </button>
            <button
              onClick={() => обработчикПереключенияВкладки("database")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${activeTab === "database" 
                           ? "text-cyan border-cyan bg-cyan/10" 
                           : "text-soft hover:text-base hover:bg-subtle/50"
                         }`}
            >
              🗄️ База данных
            </button>
            <button
              onClick={() => обработчикПереключенияВкладки("security")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${activeTab === "security" 
                           ? "text-red-400 border-red-400 bg-red-400/10" 
                           : "text-soft hover:text-base hover:bg-subtle/50"
                         }`}
            >
              🔒 Безопасность
            </button>
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <SystemSettings
                settings={mockSettings}
                onSave={обработчикСохраненияНастроек}
                onRestart={обработчикПерезагрузкиСистемы}
              />
            )}

            {activeTab === "database" && (
              <DatabaseStatus
                systemStatus={mockSystemStatus}
                onRestart={обработчикПерезагрузкиСистемы}
              />
            )}

            {activeTab === "security" && (
              <SecuritySettings
                settings={mockSettings}
                onSave={обработчикСохраненияНастроек}
              />
            )}
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-subtle border border-line rounded-lg bevel p-4">
          <h3 className="text-lg font-bold text-base mb-4 flex items-center space-x-2">
            <span>🚀</span>
            <span>Быстрые действия</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={обработчикПерезагрузкиСистемы}
              className="px-4 py-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400
                       hover:bg-yellow-400/30 rounded font-medium transition-colors"
            >
              🔄 Перезагрузить сервер
            </button>
            <button
              onClick={() => console.log("Очистка кеша...")}
              className="px-4 py-2 bg-cyan/20 border border-cyan text-cyan
                       hover:bg-cyan/30 rounded font-medium transition-colors"
            >
              🗑️ Очистить кеш
            </button>
            <button
              onClick={() => console.log("Создание бекапа...")}
              className="px-4 py-2 bg-green-400/20 border border-green-400 text-green-400
                       hover:bg-green-400/30 rounded font-medium transition-colors"
            >
              💾 Создать бекап
            </button>
            <button
              onClick={() => console.log("Просмотр логов...")}
              className="px-4 py-2 bg-purple-400/20 border border-purple-400 text-purple-400
                       hover:bg-purple-400/30 rounded font-medium transition-colors"
            >
              📋 Просмотр логов
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}