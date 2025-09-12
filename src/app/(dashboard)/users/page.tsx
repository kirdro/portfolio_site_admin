"use client";

import React, { useState, useCallback } from "react";
import { api } from "../../../utils/api";
import { UsersTable, type UserTableData } from "../../../components/admin/users/UsersTable";
import { UserForm } from "../../../components/admin/users/UserForm";
import { NeonIcon } from "../../../components/ui/NeonIcon";
import { FaUsers } from "react-icons/fa";

/**
 * Страница управления пользователями портфолио
 * Отображает список пользователей с возможностью редактирования ролей и блокировки
 */
export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"USER" | "ADMIN" | undefined>();
  const [selectedUser, setSelectedUser] = useState<UserTableData | null>(null);

  const itemsPerPage = 20;
  const offset = (currentPage - 1) * itemsPerPage;

  // Подключаем реальные данные из БД
  const { 
    data: usersData, 
    isLoading, 
    refetch: обновитьПользователей 
  } = api.admin.users.getAll.useQuery({
    search: searchQuery.trim() || undefined,
    role: roleFilter,
    limit: itemsPerPage,
    offset: offset,
  });

  // Получение статистики пользователей
  const { data: статистика } = api.admin.users.getStats.useQuery();

  // Обработчики событий (используем useCallback для оптимизации)
  const обработчикПоиска = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setSearchQuery(target.value);
    setCurrentPage(1); // Сброс на первую страницу при поиске
  }, []);

  const обработчикФильтраРоли = useCallback((role: "USER" | "ADMIN" | "all") => {
    setRoleFilter(role === "all" ? undefined : role);
    setCurrentPage(1); // Сброс на первую страницу при фильтрации
  }, []);

  const обработчикВыбораПользователя = useCallback((user: UserTableData) => {
    setSelectedUser(user);
  }, []);

  const обработчикЗакрытияФормы = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const обработчикСохраненияПользователя = useCallback(() => {
    // Обновляем данные после сохранения
    обновитьПользователей();
    setSelectedUser(null);
  }, [обновитьПользователей]);

  const обработчикСменыСтраницы = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
      <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neon glyph-glow flex items-center gap-2">
            <NeonIcon Icon={FaUsers} size={24} variant="intense" />
            Управление пользователями
          </h1>
          <p className="text-soft text-sm mt-1">
            Просмотр и редактирование пользователей портфолио
          </p>
        </div>
        
        {/* Статистика */}
        {статистика && (
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-neon font-mono text-lg glyph-glow">
                {статистика.totalUsers}
              </div>
              <div className="text-soft">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-cyan font-mono text-lg">
                {статистика.adminUsers}
              </div>
              <div className="text-soft">Админы</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-mono text-lg">
                {статистика.blockedUsers}
              </div>
              <div className="text-soft">Заблокир.</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-mono text-lg">
                {статистика.activeUsersLast30Days}
              </div>
              <div className="text-soft">Активные</div>
            </div>
          </div>
        )}
      </div>

      {/* Панель фильтров и поиска */}
      <div className="bg-panel border border-line rounded-lg bevel p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-soft mb-2">
              Поиск пользователей:
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={обработчикПоиска}
              placeholder="Введите имя пользователя или email..."
              className="w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base placeholder-soft focus:border-neon focus:ring-1 focus:ring-neon
                       transition-colors"
            />
          </div>
          
          {/* Фильтр по ролям */}
          <div>
            <label className="block text-sm font-medium text-soft mb-2">
              Фильтр по роли:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => обработчикФильтраРоли("all")}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-all
                  ${!roleFilter 
                    ? "bg-neon/20 border-neon text-neon shadow-neon" 
                    : "bg-panel border-line text-soft hover:border-neon"}`}
              >
                Все
              </button>
              <button
                onClick={() => обработчикФильтраРоли("USER")}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-all
                  ${roleFilter === "USER" 
                    ? "bg-cyan/20 border-cyan text-cyan shadow-neon" 
                    : "bg-panel border-line text-soft hover:border-cyan"}`}
              >
                Пользователи
              </button>
              <button
                onClick={() => обработчикФильтраРоли("ADMIN")}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-all
                  ${roleFilter === "ADMIN" 
                    ? "bg-neon/20 border-neon text-neon shadow-neon glyph-glow" 
                    : "bg-panel border-line text-soft hover:border-neon"}`}
              >
                Админы
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <UsersTable
        users={(usersData?.users || []).map(user => ({
          ...user,
          name: user.name || "Без имени",
          email: user.email || "",
          _count: {
            projects: user._count.Project,
            generalMessages: user._count.ChatMessage,
            aiMessages: user._count.AiChatMessage,
          },
        }))}
        loading={isLoading}
        onUserClick={обработчикВыбораПользователя}
        pagination={usersData ? {
          currentPage: currentPage,
          totalPages: Math.ceil(usersData.totalCount / itemsPerPage),
          onPageChange: обработчикСменыСтраницы,
        } : undefined}
      />

      {/* Форма редактирования пользователя */}
      {selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={обработчикЗакрытияФормы}
          onSave={обработчикСохраненияПользователя}
        />
      )}
      </div>
  );
}