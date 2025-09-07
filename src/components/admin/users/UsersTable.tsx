"use client";

import React, { useMemo } from "react";
import { DataTable, type DataTableColumn } from "../shared/DataTable";
import { UserStatusBadge } from "./UserStatusBadge";

// Типы для данных пользователя (из tRPC)
export interface UserTableData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  image?: string | null;
  _count: {
    projects: number;
    generalMessages: number;
    aiMessages: number;
  };
}

// Пропсы для UsersTable
interface UsersTableProps {
  users: UserTableData[];
  loading?: boolean;
  onUserClick?: (user: UserTableData) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * Таблица пользователей портфолио для админ-панели
 * Отображает список пользователей с аватарами, ролями и статистикой
 */
export function UsersTable({ 
  users, 
  loading = false, 
  onUserClick,
  pagination 
}: UsersTableProps) {
  
  // Определяем колонки таблицы (мемоизируем для производительности)
  const колонкиТаблицы: DataTableColumn<UserTableData>[] = useMemo(() => [
    {
      key: "avatar",
      header: "",
      className: "w-12",
      render: (user) => (
        <div className="flex-shrink-0 h-10 w-10">
          {user.image ? (
            <img
              className="h-10 w-10 rounded-full border-2 border-line"
              src={user.image}
              alt={`Аватар ${user.name}`}
              onError={(e) => {
                // Fallback при ошибке загрузки изображения
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B0D0E&color=00FF99&size=40`;
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-subtle border-2 border-line flex items-center justify-center">
              <span className="text-sm font-medium text-neon glyph-glow">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Пользователь",
      sortable: true,
      render: (user) => (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-base">{user.name}</p>
          <p className="text-sm text-soft truncate">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Роль",
      sortable: true,
      className: "text-center",
      render: (user) => <UserStatusBadge role={user.role} isBlocked={false} />,
    },
    {
      key: "stats",
      header: "Активность",
      className: "text-center",
      render: (user) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-soft">Проекты:</span>
            <span className="text-neon font-mono glyph-glow">{user._count.projects}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-soft">Сообщения:</span>
            <span className="text-cyan font-mono glyph-glow">
              {user._count.generalMessages + user._count.aiMessages}
            </span>
          </div>
        </div>
      ),
    },
  ], []);

  return (
    <DataTable
      data={users}
      columns={колонкиТаблицы}
      loading={loading}
      emptyMessage="Пользователи не найдены"
      onRowClick={onUserClick}
      pagination={pagination}
      className="shadow-neon"
    />
  );
}