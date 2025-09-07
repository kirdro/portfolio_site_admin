"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "loading") return; // Ждем загрузки
    
    if (session) {
      // Если пользователь авторизован - редиректим на dashboard
      router.push('/dashboard');
    } else {
      // Если не авторизован - редиректим на страницу входа
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Показываем загрузку
  return (
    <main className="min-h-screen flex items-center justify-center relative" style={{backgroundColor: '#0B0D0E', color: '#E6F4EF'}}>
      {/* Сканлайн эффект */}
      <div className="scanline absolute inset-0 pointer-events-none" />
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-mono font-bold glyph-glow mb-4" style={{color: '#00FF99'}}>
          KIRDRO ADMIN
        </h1>
        <div className="animate-pulse text-lg font-mono" style={{color: '#B8C5C0'}}>
          Инициализация системы...
        </div>
        <div className="mt-6 w-64 h-1 bg-gray-800 rounded-full mx-auto">
          <div className="h-1 rounded-full animate-pulse" style={{backgroundColor: '#00FF99', width: '60%'}}></div>
        </div>
      </div>
    </main>
  );
}