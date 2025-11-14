import { createTRPCRouter } from '../trpc';
import { shop3dServicesRouter } from './shop3d-services';
import { shop3dCategoriesRouter } from './shop3d-categories';
import { shop3dTagsRouter } from './shop3d-tags';
import { shop3dPlasticsRouter } from './shop3d-plastics';
import { shop3dProductsRouter } from './shop3d-products';
import { shop3dContactsRouter } from './shop3d-contacts';

/**
 * Main 3D Shop Router
 * Combines all 3D shop subsection routers:
 * - services: Управление услугами
 * - categories: Категории товаров
 * - tags: Теги (хит, премиум и т.д.)
 * - plastics: Пластики/материалы
 * - products: Продукты/детали 3D печати
 * - contacts: Контакты магазина
 */
export const shop3dRouter = createTRPCRouter({
	services: shop3dServicesRouter,
	categories: shop3dCategoriesRouter,
	tags: shop3dTagsRouter,
	plastics: shop3dPlasticsRouter,
	products: shop3dProductsRouter,
	contacts: shop3dContactsRouter,
});
