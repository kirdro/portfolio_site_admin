import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Получаем токен из JWT
  const token = await getToken({ req: request });
  
  // Исключаем определенные пути от проверки
  const isPublicPath = 
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Логируем информацию о запросе
  console.log(`🛡️  Middleware: ${request.nextUrl.pathname}`);
  console.log(`👤 Пользователь: ${token?.email || 'Не авторизован'}`);
  console.log(`🎭 Роль: ${token?.role || 'Нет роли'}`);

  // Если нет токена - редиректим на страницу входа
  if (!token) {
    console.log(`❌ Пользователь не авторизован`);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // ВРЕМЕННО: разрешаем доступ любому авторизованному пользователю для тестирования
  // TODO: вернуть строгую проверку: token.email !== "kirdro@yandex.ru" || token.role !== "ADMIN"
  console.log(`🔓 ТЕСТОВЫЙ РЕЖИМ: Доступ разрешен для ${token.email} (роль: ${token.role})`);

  console.log(`✅ Доступ разрешен для ${token.email}`);
  return NextResponse.next();
}

// Настройка матчера - применяется ко всем маршрутам
export const config = {
  matcher: [
    // Применяется ко всем маршрутам
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};