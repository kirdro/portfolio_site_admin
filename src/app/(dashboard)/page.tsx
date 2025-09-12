"use client";

import { api } from '../../utils/api';
import { NeonIcon } from '../../components/ui/NeonIcon';
import { 
  FaUsers, 
  FaFolder, 
  FaComments, 
  FaWrench, 
  FaBolt, 
  FaPen, 
  FaChartBar,
  FaChartLine,
  FaGlobe 
} from 'react-icons/fa';

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
              <NeonIcon Icon={FaUsers} size={32} variant="intense" />
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                TOTAL
              </div>
            </div>
            <div className="text-3xl font-bold font-mono" style={{color: '#00FF99'}}>
              {isLoading ? "..." : статистика?.users.total || 0}
            </div>
            <div className="text-sm" style={{color: '#B8C5C0'}}>
              Пользователей
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <NeonIcon Icon={FaFolder} size={32} variant="cyan" />
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                PROJECTS
              </div>
            </div>
            <div className="text-3xl font-bold font-mono" style={{color: '#00FF99'}}>
              {isLoading ? "..." : статистика?.projects.total || 0}
            </div>
            <div className="text-sm" style={{color: '#B8C5C0'}}>
              Проектов
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <NeonIcon Icon={FaComments} size={32} variant="purple" />
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                MESSAGES
              </div>
            </div>
            <div className="text-3xl font-bold font-mono" style={{color: '#00FF99'}}>
              {isLoading ? "..." : (статистика ? статистика.messages.general + статистика.messages.ai : 0)}
            </div>
            <div className="text-sm" style={{color: '#B8C5C0'}}>
              Сообщений
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <NeonIcon Icon={FaWrench} size={32} variant="orange" />
              <div className="text-xs font-mono" style={{color: '#B8C5C0'}}>
                SYSTEM
              </div>
            </div>
            <div className="text-3xl font-bold font-mono" style={{color: '#00FF99'}}>
              {isLoading ? "..." : "OK"}
            </div>
            <div className="text-sm" style={{color: '#B8C5C0'}}>
              Система
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="cyber-card p-6">
            <div className="flex items-center mb-4">
              <NeonIcon Icon={FaBolt} size={24} variant="intense" className="mr-3" />
              <div>
                <h3 className="font-bold" style={{color: '#00FF99'}}>
                  Быстрые действия
                </h3>
                <p className="text-sm" style={{color: '#B8C5C0'}}>
                  Основные операции
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button className="btn-glitch w-full p-2 rounded text-left">
                <NeonIcon Icon={FaPen} size={16} variant="default" className="inline mr-2" />
                Создать проект
              </button>
              <button className="btn-glitch w-full p-2 rounded text-left">
                <NeonIcon Icon={FaComments} size={16} variant="default" className="inline mr-2" />
                Модерация чата
              </button>
              <button className="btn-glitch w-full p-2 rounded text-left">
                <NeonIcon Icon={FaChartBar} size={16} variant="default" className="inline mr-2" />
                Просмотр аналитики
              </button>
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center mb-4">
              <NeonIcon Icon={FaChartLine} size={24} variant="cyan" className="mr-3" />
              <div>
                <h3 className="font-bold" style={{color: '#00FF99'}}>
                  Последние активности
                </h3>
                <p className="text-sm" style={{color: '#B8C5C0'}}>
                  Недавние изменения
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Новый пользователь</span>
                <span className="font-mono text-sm" style={{color: '#B8C5C0'}}>2ч назад</span>
              </div>
              <div className="flex justify-between">
                <span>Обновление проекта</span>
                <span className="font-mono text-sm" style={{color: '#B8C5C0'}}>5ч назад</span>
              </div>
              <div className="flex justify-between">
                <span>Новое сообщение</span>
                <span className="font-mono text-sm" style={{color: '#B8C5C0'}}>1д назад</span>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center mb-4">
              <NeonIcon Icon={FaGlobe} size={24} variant="purple" className="mr-3" />
              <div>
                <h3 className="font-bold" style={{color: '#00FF99'}}>
                  Статус системы
                </h3>
                <p className="text-sm" style={{color: '#B8C5C0'}}>
                  Мониторинг сервисов
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">База данных</span>
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ОНЛАЙН</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API сервер</span>
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ОНЛАЙН</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Основной сайт</span>
                <span className="font-mono text-sm" style={{color: '#00FF99'}}>ОНЛАЙН</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}