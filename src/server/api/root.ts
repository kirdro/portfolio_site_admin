import { createTRPCRouter } from './trpc';
import { adminRouter } from './routers/admin';
import { chatRouter } from './routers/chat';
import { contactsRouter } from './routers/contacts';
import { aiChatRouter } from './routers/aiChat';
import { blogRouter } from './routers/blog-simple';
import { settingsRouter } from './routers/settings';
import { filesRouter } from './routers/files';
import { profileRouter } from './routers/profile';
import { shop3dRouter } from './routers/shop3d';

/**
 * Главный tRPC роутер для админ-панели
 * Здесь объединяются все sub-роутеры приложения
 */
export const appRouter = createTRPCRouter({
	admin: adminRouter,
	chat: chatRouter,
	contacts: contactsRouter,
	aiChat: aiChatRouter,
	blog: blogRouter,
	settings: settingsRouter,
	files: filesRouter,
	profile: profileRouter,
	shop3d: shop3dRouter,
});

// Экспортируем типы роутера для использования на клиенте
export type AppRouter = typeof appRouter;
