"use client";

import React from "react";

// Пропсы для компонента статуса пользователя
interface UserStatusBadgeProps {
  role: "USER" | "ADMIN";
  isBlocked?: boolean;
}

/**
 * Компонент бейджа статуса пользователя
 * Отображает роль и статус блокировки с киберпанк стилизацией
 */
export function UserStatusBadge({ role, isBlocked = false }: UserStatusBadgeProps) {
  // Если пользователь заблокирован - показываем красный бейдж
  if (isBlocked) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium 
                       bg-red-900/20 text-red-400 border border-red-800/30
                       bevel shadow-neon">
        🚫 Заблокирован
      </span>
    );
  }

  // Стили для разных ролей
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium 
                       bg-neon/10 text-neon border border-neon/30
                       bevel shadow-neon glyph-glow">
        ⚡ Администратор
      </span>
    );
  }

  // Обычный пользователь
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium 
                     bg-cyan/10 text-cyan border border-cyan/30
                     bevel">
      👤 Пользователь
    </span>
  );
}