import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { PrismaClient } from "../generated/prisma";

// Создаем глобальную переменную для Prisma клиента
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Инициализируем Prisma клиент с синглтон паттерном
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
export const db = prisma; // Экспорт для совместимости с другими частями приложения

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Yandex OAuth провайдер (кастомная реализация) с подробным логированием
const YandexProvider = {
  id: "yandex",
  name: "Yandex",
  type: "oauth" as const,
  authorization: {
    url: "https://oauth.yandex.ru/authorize",
    params: {
      scope: "login:email login:info",
      response_type: "code",
    },
  },
  token: "https://oauth.yandex.ru/token",
  userinfo: "https://login.yandex.ru/info?format=json",
  clientId: process.env.AUTH_YANDEX_ID!,
  clientSecret: process.env.AUTH_YANDEX_SECRET!,
  profile(profile: any) {
    console.log("🔍 Yandex profile received:", JSON.stringify(profile, null, 2));
    const result = {
      id: profile.id,
      name: profile.display_name || profile.real_name,
      email: profile.default_email,
      image: profile.is_avatar_empty ? null : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`,
    };
    console.log("✨ Processed profile:", JSON.stringify(result, null, 2));
    return result;
  },
};

export const authOptions: NextAuthOptions = {
  // ПОЛНОСТЬЮ убираем Prisma адаптер - используем только JWT
  // adapter: PrismaAdapter(prisma),
  
  // Настройки сессии
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 часа
  },
  
  // Настройки JWT
  jwt: {
    maxAge: 24 * 60 * 60, // 24 часа
  },
  
  // Обработка ошибок
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`📅 SignIn event: ${user.email} via ${account?.provider}`);
    },
    async signOut({ session, token }) {
      console.log(`👋 SignOut event: ${token?.email}`);
    },
    async createUser({ user }) {
      console.log(`👤 New user created: ${user.email}`);
    },
    async updateUser({ user }) {
      console.log(`🔄 User updated: ${user.email}`);
    },
    async linkAccount({ user, account, profile }) {
      console.log(`🔗 Account linked: ${user.email} -> ${account.provider}`);
    },
    async session({ session, token }) {
      console.log(`📋 Session accessed: ${token?.email}`);
    },
  },
  
  // Провайдеры аутентификации
  providers: [
    // Только Яндекс OAuth для админ-панели (Email временно отключен)
    YandexProvider as any,
    
    // ВРЕМЕННО ОТКЛЮЧЕН: Email провайдер тормозит OAuth процесс
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST!,
    //     port: Number(process.env.EMAIL_SERVER_PORT!),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER!,
    //       pass: process.env.EMAIL_SERVER_PASSWORD!,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM!,
    // }),
  ],
  
  // Callbacks для обработки сессии и JWT с подробным логированием
  callbacks: {
    // Проверяем доступ только для kirdro@yandex.ru
    async signIn({ user, account, profile }) {
      const startTime = Date.now();
      console.log(`🔐 SignIn callback started for: ${user?.email}`);
      console.log(`📋 Account provider: ${account?.provider}`);
      console.log(`👤 User data:`, JSON.stringify(user, null, 2));
      
      try {
        // Разрешаем доступ ТОЛЬКО для kirdro@yandex.ru
        if (user.email !== "kirdro@yandex.ru") {
          console.log(`❌ Заблокирован доступ для: ${user.email}`);
          return false;
        }
        
        console.log(`✅ Разрешен доступ для: ${user.email} (${Date.now() - startTime}ms)`);
        return true;
      } catch (error) {
        console.error(`💥 SignIn callback error:`, error);
        return false;
      }
    },
    
    // Настраиваем JWT токен
    async jwt({ token, user, account }) {
      const startTime = Date.now();
      console.log(`🎫 JWT callback started for: ${token?.email || user?.email}`);
      
      try {
        if (user) {
          console.log(`🔍 Setting role for: ${user.email}`);
          
          // УПРОЩЕННО: пропускаем БД, назначаем роль напрямую для скорости
          token.role = user.email === "kirdro@yandex.ru" ? "ADMIN" : "USER";
          console.log(`🎭 Role assigned: ${token.role} (fast mode)`);
        }
        
        console.log(`✨ JWT callback completed (${Date.now() - startTime}ms)`);
        return token;
      } catch (error) {
        console.error(`💥 JWT callback error:`, error);
        return token;
      }
    },
    
    // Настраиваем сессию пользователя
    async session({ session, token }) {
      const startTime = Date.now();
      console.log(`📝 Session callback started for: ${token?.email}`);
      
      try {
        if (token) {
          session.user.id = token.sub!;
          session.user.role = token.role as string;
        }
        
        console.log(`✨ Session callback completed (${Date.now() - startTime}ms)`);
        console.log(`🎪 Final session:`, JSON.stringify(session, null, 2));
        return session;
      } catch (error) {
        console.error(`💥 Session callback error:`, error);
        return session;
      }
    },
  },
  
  // Страницы аутентификации
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  // Настройки безопасности и cookies
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".kirdro.ru" : undefined,
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900,
      },
    },
  },
  
  // Секретный ключ
  secret: process.env.NEXTAUTH_SECRET,
};

// Типизация для сессии
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}