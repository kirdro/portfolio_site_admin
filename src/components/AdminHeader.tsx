"use client";

import { signOut } from "next-auth/react";
import { useCallback } from "react";
import { NeonIcon } from "./ui/NeonIcon";
import { FaBars, FaUser, FaCog, FaGlobe, FaSignOutAlt } from "react-icons/fa";

interface AdminHeaderProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ user, onSidebarToggle, sidebarOpen }: AdminHeaderProps) {
  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  }, []);

  return (
    <header className="cyber-card bg-black/80 border-b-2 border-green-500/30 backdrop-blur-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть - переключатель сайдбара (мобильная версия) */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <NeonIcon 
                Icon={FaBars}
                size={18}
                variant="default"
                title="Переключить меню"
              />
            </button>
            
            <div>
              <h1 className="text-xl font-mono font-bold" style={{color: '#00FF99'}}>
                KIRDRO ADMIN PANEL
              </h1>
              <p className="text-sm text-gray-400">
                Управление портфолио-сайтом
              </p>
            </div>
          </div>

          {/* Правая часть - информация о пользователе */}
          <div className="flex items-center space-x-4">
            {/* Системные индикаторы */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: '#00FF99'}} />
                <span style={{color: '#B8C5C0'}}>ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <span style={{color: '#B8C5C0'}}>PORT:</span>
                <span style={{color: '#00FFCC'}}>3008</span>
              </div>
            </div>

            {/* Информация о пользователе */}
            <div className="flex items-center space-x-3">
              {/* Аватар */}
              <div className="w-10 h-10 rounded-full border-2 border-green-500/50 flex items-center justify-center bg-green-500/10">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <NeonIcon 
                    Icon={FaUser}
                    size={20}
                    variant="subtle"
                  />
                )}
              </div>

              {/* Информация */}
              <div className="hidden md:block">
                <div className="text-sm font-mono font-semibold" style={{color: '#00FF99'}}>
                  {user.name || "ADMIN"}
                </div>
                <div className="text-xs text-gray-400">
                  {user.email}
                </div>
                <div className="text-xs" style={{color: '#00FFCC'}}>
                  ROLE: {user.role || "USER"}
                </div>
              </div>

              {/* Меню действий */}
              <div className="relative group">
                <button 
                  className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <NeonIcon 
                    Icon={FaCog}
                    size={16}
                    variant="default"
                    title="Меню действий"
                  />
                </button>
                
                {/* Выпадающее меню */}
                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="cyber-card bg-black/90 border border-green-500/30 rounded-lg shadow-neon p-2">
                    <button
                      onClick={() => window.open('https://kirdro.ru', '_blank')}
                      className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-green-500/20 rounded transition-colors flex items-center gap-2"
                      style={{color: '#B8C5C0'}}
                    >
                      <NeonIcon Icon={FaGlobe} size={14} variant="cyan" />
                      Открыть сайт
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-red-500/20 rounded transition-colors text-red-400 flex items-center gap-2"
                    >
                      <NeonIcon Icon={FaSignOutAlt} size={14} variant="red" />
                      Выход
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}