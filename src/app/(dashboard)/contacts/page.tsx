"use client";

import React, { useState, useCallback } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { api } from "../../../utils/api";
import { ContactsList } from "../../../components/admin/contacts/ContactsList";
import { ContactDetail } from "../../../components/admin/contacts/ContactDetail";

// Типы данных для контактных обращений (обновленные под реальную схему БД)
export interface ContactData {
  id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  company?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status: "new" | "in_progress" | "completed" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
  responseText?: string;
  respondedAt?: Date;
}

/**
 * Страница управления контактными обращениями
 * Просмотр, фильтрация, ответы на обращения
 */
export default function ContactsPage() {

  // Состояние выбранного обращения для просмотра
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Получаем реальные данные из БД
  const { 
    data: contactsData, 
    isLoading: loadingContacts,
    refetch: обновитьОбращения 
  } = api.contacts.getContacts.useQuery({
    page: 1,
    limit: 50,
    status: "all",
  });

  // Получаем статистику обращений  
  const { data: contactStats, isLoading: loadingStats } = api.contacts.getStats.useQuery();

  // Преобразуем данные для совместимости с интерфейсом
  const mockContacts: ContactData[] = (contactsData?.contacts || []).map(contact => ({
    ...contact,
    createdAt: new Date(contact.createdAt),
    updatedAt: new Date(contact.createdAt), // Используем createdAt как fallback
  }));

  // Обработчик выбора обращения для просмотра
  const обработчикВыбораОбращения = useCallback((contact: ContactData) => {
    setSelectedContact(contact);
    setShowDetail(true);
  }, []);

  // Обработчик закрытия детального просмотра
  const обработчикЗакрытияДеталей = useCallback(() => {
    setShowDetail(false);
    setSelectedContact(null);
  }, []);

  // Обработчик обновления статуса обращения
  const обработчикОбновленияСтатуса = useCallback((contactId: string, status: ContactData["status"]) => {
    // В будущем здесь будет вызов tRPC мутации
    console.log("Обновление статуса обращения:", contactId, status);
  }, []);

  // Обработчик отправки ответа
  const обработчикОтправкиОтвета = useCallback((contactId: string, responseText: string) => {
    // В будущем здесь будет вызов tRPC мутации
    console.log("Отправка ответа:", contactId, responseText);
    setShowDetail(false);
    setSelectedContact(null);
  }, []);

  // Статистика обращений из API
  const статистика = contactStats ? {
    всего: contactStats.totalContacts,
    новые: contactStats.byStatus?.new || 0,
    вРаботе: contactStats.byStatus?.inProgress || 0,
    завершенные: contactStats.byStatus?.completed || 0,
    отклоненные: contactStats.byStatus?.rejected || 0,
    поПриоритету: {
      низкий: 0,
      средний: 0,
      высокий: 0,
      срочный: 0,
    },
    сОтветом: 0,
  } : {
    всего: 0,
    новые: 0,
    вРаботе: 0,
    завершенные: 0,
    отклоненные: 0,
    поПриоритету: {
      низкий: 0,
      средний: 0,
      высокий: 0,
      срочный: 0,
    },
    сОтветом: 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neon glyph-glow">
              📧 Контактные обращения
            </h1>
            <p className="text-soft text-sm mt-1">
              Управление и ответы на обращения с сайта
            </p>
          </div>
        </div>

        {/* Статистика обращений */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-neon glyph-glow">
                  {loadingStats ? "..." : статистика.всего}
                </div>
                <div className="text-sm text-soft">Всего обращений</div>
              </div>
              <div className="text-2xl text-neon">📧</div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400 glyph-glow">
                  {loadingStats ? "..." : статистика.новые}
                </div>
                <div className="text-sm text-soft">Новые</div>
              </div>
              <div className="text-2xl text-yellow-400">🔔</div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan glyph-glow">
                  {loadingStats ? "..." : статистика.вРаботе}
                </div>
                <div className="text-sm text-soft">В работе</div>
              </div>
              <div className="text-2xl text-cyan">⚙️</div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400 glyph-glow">
                  {loadingStats ? "..." : статистика.завершенные}
                </div>
                <div className="text-sm text-soft">Завершенные</div>
              </div>
              <div className="text-2xl text-green-400">✅</div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg bevel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400 glyph-glow">
                  {loadingStats ? "..." : статистика.поПриоритету.срочный}
                </div>
                <div className="text-sm text-soft">Срочные</div>
              </div>
              <div className="text-2xl text-red-400">🚨</div>
            </div>
          </div>
        </div>

        {/* Быстрые фильтры */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-base">
              Обращения
            </h2>
            <div className="flex items-center space-x-2 text-sm text-soft">
              <span className="px-2 py-1 bg-subtle border border-line rounded">
                Ответов: {статистика.сОтветом}
              </span>
              <span className="px-2 py-1 bg-subtle border border-line rounded">
                Требуют внимания: {статистика.новые + статистика.поПриоритету.срочный}
              </span>
            </div>
          </div>
        </div>

        {/* Список обращений */}
        <ContactsList 
          contacts={mockContacts}
          loading={loadingContacts}
          onContactSelect={обработчикВыбораОбращения}
          onStatusUpdate={обработчикОбновленияСтатуса}
        />

        {/* Детальный просмотр обращения */}
        {showDetail && selectedContact && (
          <ContactDetail
            contact={selectedContact}
            onClose={обработчикЗакрытияДеталей}
            onSendResponse={обработчикОтправкиОтвета}
            onStatusUpdate={обработчикОбновленияСтатуса}
          />
        )}
      </div>
    </AdminLayout>
  );
}