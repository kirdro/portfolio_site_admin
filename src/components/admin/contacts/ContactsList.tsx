"use client";

import React, { useState, useCallback } from "react";
import type { ContactData } from "../../../app/(dashboard)/contacts/page";

interface ContactsListProps {
  contacts: ContactData[];
  loading: boolean;
  onContactSelect: (contact: ContactData) => void;
  onStatusUpdate: (contactId: string, status: ContactData["status"]) => void;
}

/**
 * Компонент списка контактных обращений
 * Фильтрация, поиск, быстрые действия по статусам
 */
export function ContactsList({ 
  contacts, 
  loading, 
  onContactSelect,
  onStatusUpdate 
}: ContactsListProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ContactData["status"] | "all">("all");
  const [filterPriority, setFilterPriority] = useState<ContactData["priority"] | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  // Обработчик клика по обращению
  const обработчикКликаПоОбращению = useCallback((contact: ContactData) => {
    onContactSelect(contact);
  }, [onContactSelect]);

  // Обработчик быстрого изменения статуса
  const обработчикИзмененияСтатуса = useCallback((contactId: string, status: ContactData["status"], e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusUpdate(contactId, status);
  }, [onStatusUpdate]);

  // Функция получения цвета статуса
  const получитьЦветСтатуса = useCallback((status: ContactData["status"]) => {
    switch (status) {
      case "new": return "yellow-400";
      case "in_progress": return "cyan";
      case "completed": return "green-400";
      case "rejected": return "red-400";
      default: return "soft";
    }
  }, []);

  // Функция получения цвета приоритета
  const получитьЦветПриоритета = useCallback((priority: ContactData["priority"]) => {
    switch (priority) {
      case "low": return "blue-400";
      case "medium": return "yellow-400";
      case "high": return "orange-400";
      case "urgent": return "red-400";
      default: return "soft";
    }
  }, []);

  // Функция получения иконки статуса
  const получитьИконкуСтатуса = useCallback((status: ContactData["status"]) => {
    switch (status) {
      case "new": return "🔔";
      case "in_progress": return "⚙️";
      case "completed": return "✅";
      case "rejected": return "❌";
      default: return "📧";
    }
  }, []);

  // Фильтрация и сортировка обращений
  const отфильтрованныеОбращения = contacts
    .filter(contact => {
      const matchesSearch = searchQuery === "" || 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
      const matchesPriority = filterPriority === "all" || contact.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = a.priority || "medium";
        const bPriority = b.priority || "medium";
        return priorityOrder[bPriority as keyof typeof priorityOrder] - priorityOrder[aPriority as keyof typeof priorityOrder];
      }
    });

  // Loading состояние
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-subtle rounded-lg p-6 border border-line">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 bg-panel rounded w-32" />
                    <div className="h-4 bg-panel rounded w-48" />
                  </div>
                  <div className="h-3 bg-panel rounded w-full" />
                  <div className="h-3 bg-panel rounded w-2/3" />
                </div>
                <div className="w-20 h-6 bg-panel rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Пустое состояние
  if (отфильтрованныеОбращения.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-xl font-bold text-base mb-2">
          Обращения не найдены
        </h3>
        <p className="text-soft">
          {contacts.length === 0 
            ? "Пока нет контактных обращений" 
            : "Попробуйте изменить фильтры поиска"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Панель фильтров и поиска */}
      <div className="bg-subtle border border-line rounded-lg bevel p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск */}
          <div>
            <input
              type="text"
              placeholder="Поиск по имени, email, теме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-panel border border-line rounded text-sm text-base
                       focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
            />
          </div>

          {/* Фильтр по статусу */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContactData["status"] | "all")}
              className="w-full px-3 py-2 bg-panel border border-line rounded text-sm text-base
                       focus:border-neon transition-colors"
            >
              <option value="all">Все статусы</option>
              <option value="new">🔔 Новые</option>
              <option value="in_progress">⚙️ В работе</option>
              <option value="completed">✅ Завершенные</option>
              <option value="rejected">❌ Отклоненные</option>
            </select>
          </div>

          {/* Фильтр по приоритету */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as ContactData["priority"] | "all")}
              className="w-full px-3 py-2 bg-panel border border-line rounded text-sm text-base
                       focus:border-neon transition-colors"
            >
              <option value="all">Все приоритеты</option>
              <option value="urgent">🚨 Срочные</option>
              <option value="high">🔥 Высокие</option>
              <option value="medium">📋 Средние</option>
              <option value="low">📌 Низкие</option>
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "priority")}
              className="w-full px-3 py-2 bg-panel border border-line rounded text-sm text-base
                       focus:border-neon transition-colors"
            >
              <option value="date">📅 По дате</option>
              <option value="priority">🎯 По приоритету</option>
            </select>
          </div>
        </div>
      </div>

      {/* Заголовок с результатами */}
      <div className="flex items-center justify-between text-sm text-soft">
        <div>
          Показано {отфильтрованныеОбращения.length} из {contacts.length} обращений
        </div>
        <div className="flex items-center space-x-2">
          <span>Сортировка:</span>
          <span className="text-base">{sortBy === "date" ? "По дате" : "По приоритету"}</span>
        </div>
      </div>

      {/* Список обращений */}
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {отфильтрованныеОбращения.map((contact) => (
          <div
            key={contact.id}
            onClick={() => обработчикКликаПоОбращению(contact)}
            className="bg-subtle border border-line rounded-lg bevel p-6 cursor-pointer
                     hover:border-neon hover:shadow-neon/20 hover:bg-panel/50
                     transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              {/* Основная информация */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-base group-hover:text-neon transition-colors">
                    {contact.name}
                  </h3>
                  <span className="text-sm text-soft font-mono">
                    {contact.email}
                  </span>
                  {contact.company && (
                    <span className="px-2 py-1 bg-panel border border-line rounded text-xs text-soft">
                      {contact.company}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <h4 className="text-lg font-medium text-base mb-1">
                    {contact.subject}
                  </h4>
                  <p className="text-soft text-sm line-clamp-2">
                    {contact.message}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-soft font-mono">
                      {contact.createdAt.toLocaleDateString("ru-RU")} {contact.createdAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {contact.responseText && (
                      <span className="text-green-400 flex items-center space-x-1">
                        <span>💬</span>
                        <span>Отвечено</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Приоритет */}
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      bg-${получитьЦветПриоритета(contact.priority || "medium")}/20 
                      border border-${получитьЦветПриоритета(contact.priority || "medium")}/50
                      text-${получитьЦветПриоритета(contact.priority || "medium")}`}>
                      {(contact.priority || "medium").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Статус и быстрые действия */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {получитьИконкуСтатуса(contact.status)}
                  </span>
                  <span className={`px-3 py-1 rounded font-medium text-sm
                    bg-${получитьЦветСтатуса(contact.status)}/20 
                    border border-${получитьЦветСтатуса(contact.status)}/50
                    text-${получитьЦветСтатуса(contact.status)}`}>
                    {contact.status === "new" && "Новое"}
                    {contact.status === "in_progress" && "В работе"}
                    {contact.status === "completed" && "Завершено"}
                    {contact.status === "rejected" && "Отклонено"}
                  </span>
                </div>

                {/* Быстрые действия */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {contact.status === "new" && (
                    <button
                      onClick={(e) => обработчикИзмененияСтатуса(contact.id, "in_progress", e)}
                      className="p-1 text-cyan hover:bg-cyan/20 rounded transition-colors"
                      title="Взять в работу"
                    >
                      ⚙️
                    </button>
                  )}
                  {contact.status === "in_progress" && (
                    <button
                      onClick={(e) => обработчикИзмененияСтатуса(contact.id, "completed", e)}
                      className="p-1 text-green-400 hover:bg-green-400/20 rounded transition-colors"
                      title="Завершить"
                    >
                      ✅
                    </button>
                  )}
                  <button
                    onClick={(e) => обработчикИзмененияСтатуса(contact.id, "rejected", e)}
                    className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                    title="Отклонить"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}