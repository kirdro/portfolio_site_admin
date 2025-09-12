"use client";

import { api } from '../../../utils/api';

export default function DashboardPage() {
  // Подключаем реальную статистику из БД
  const { data: статистика, isLoading } = api.admin.getStats.useQuery();

  return (
      <div className="space-y-6">
        {/* Заголовок Dashboard */}
        <div className="text-center">
          <h1 className="text-4xl font-mono font-bold glyph-glow mb-2" style={{color: '#00FF99'}}>
            DASHBOARD
          </h1>
          <p className="text-lg" style={{color: '#B8C5C0'}}>
            Панель управления портфолио-сайтом kirdro.ru
          </p>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">👥</div>
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                TOTAL
              </div>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 glyph-glow" style={{color: '#00FF99'}}>
              {isLoading ? "..." : статистика?.users.total.toLocaleString() || 0}
            </div>
            <div className="text-sm font-mono" style={{color: '#B8C5C0'}}>
              Пользователи
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">🚀</div>
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                ACTIVE
              </div>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 glyph-glow" style={{color: '#00FF99'}}>
              {isLoading ? "..." : статистика?.projects.total || 0}
            </div>
            <div className="text-sm font-mono" style={{color: '#B8C5C0'}}>
              Проекты
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">💬</div>
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                TODAY
              </div>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 glyph-glow" style={{color: '#00FF99'}}>
              {isLoading ? "..." : (статистика ? (статистика.messages.general + статистика.messages.ai).toLocaleString() : 0)}
            </div>
            <div className="text-sm font-mono" style={{color: '#B8C5C0'}}>
              Сообщения
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">📧</div>
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                NEW
              </div>
            </div>
            <div className="text-3xl font-mono font-bold mb-1 glyph-glow" style={{color: '#00FF99'}}>
              {isLoading ? "..." : статистика?.contacts.newCount || 0}
            </div>
            <div className="text-sm font-mono" style={{color: '#B8C5C0'}}>
              Обращения
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-mono font-bold mb-4" style={{color: '#00FF99'}}>
            БЫСТРЫЕ ДЕЙСТВИЯ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-glitch bevel p-4 font-mono text-sm transition-all">
              <div className="text-2xl mb-2">➕</div>
              ДОБАВИТЬ ПРОЕКТ
            </button>
            <button className="btn-glitch bevel p-4 font-mono text-sm transition-all">
              <div className="text-2xl mb-2">⚡</div>
              ОБНОВИТЬ НАВЫКИ
            </button>
            <button className="btn-glitch bevel p-4 font-mono text-sm transition-all">
              <div className="text-2xl mb-2">💬</div>
              МОДЕРАЦИЯ ЧАТА
            </button>
            <button 
              onClick={() => window.open('https://kirdro.ru', '_blank')}
              className="btn-glitch bevel p-4 font-mono text-sm transition-all"
            >
              <div className="text-2xl mb-2">🌐</div>
              ОТКРЫТЬ САЙТ
            </button>
          </div>
        </div>

        {/* Системный статус */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-mono font-bold mb-4" style={{color: '#00FF99'}}>
            СИСТЕМНЫЙ СТАТУС
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono" style={{color: '#B8C5C0'}}>База данных</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00FF99'}} />
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ПОДКЛЮЧЕНА</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono" style={{color: '#B8C5C0'}}>Аутентификация</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00FF99'}} />
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>АКТИВНА</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono" style={{color: '#B8C5C0'}}>Email сервис</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00FF99'}} />
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ДОСТУПЕН</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono" style={{color: '#B8C5C0'}}>Основной сайт</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00FF99'}} />
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ОНЛАЙН</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}