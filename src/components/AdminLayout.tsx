"use client";

import { useSession, signOut } from "next-auth/react";
import { type ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ToastContainer, useToasts } from "./ui/Toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toastApi = useToasts();

  // Показываем загрузку
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#0B0D0E'}}>
        <div className="text-center">
          <div className="animate-pulse text-2xl font-mono" style={{color: '#00FF99'}}>
            ЗАГРУЗКА СИСТЕМЫ...
          </div>
          <div className="mt-4 w-64 h-1 bg-gray-800 rounded-full mx-auto">
            <div className="h-1 rounded-full animate-pulse" style={{backgroundColor: '#00FF99', width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Если не авторизован - не показываем админку
  if (!session) {
    return null; // Middleware перенаправит на вход
  }

  return (
    <div className="min-h-screen relative" style={{backgroundColor: '#0B0D0E', color: '#E6F4EF'}}>
      {/* Сканлайн эффект */}
      <div className="scanline absolute inset-0 pointer-events-none" />
      
      {/* Основная структура */}
      <div className="relative z-10 flex">
        {/* Боковая панель */}
        <AdminSidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Основной контент */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          {/* Верхняя панель */}
          <AdminHeader 
            user={session.user}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          
          {/* Контент */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Toast уведомления */}
      <ToastContainer
        toasts={toastApi.toasts}
        onRemove={toastApi.removeToast}
      />
    </div>
  );
}