import { createTRPCRouter } from "./trpc";
import { adminRouter } from "./routers/admin";
import { chatRouter } from "./routers/chat";
import { contactsRouter } from "./routers/contacts";
import { aiChatRouter } from "./routers/aiChat";

/**
 * Главный tRPC роутер для админ-панели
 * Здесь объединяются все sub-роутеры приложения
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  chat: chatRouter,
  contacts: contactsRouter,
  aiChat: aiChatRouter,
});

// Экспортируем типы роутера для использования на клиенте
export type AppRouter = typeof appRouter;