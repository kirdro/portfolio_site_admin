/**
 * tRPC Middleware для автоматического управления индикаторами загрузки
 * Перехватывает все tRPC запросы и показывает соответствующие спиннеры
 */

import type { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AnyRouter } from '@trpc/server';

// Типы операций и их приоритеты
export type OperationType = 'query' | 'mutation' | 'subscription';
export type OperationPriority = 'critical' | 'normal' | 'background';

// Конфигурация для категоризации запросов
interface LoadingConfig {
	priority: OperationPriority;
	label: string;
	showGlobal: boolean; // Показывать глобальный оверлей
	category: 'data' | 'auth' | 'file' | 'crud';
}

// Карта endpoint'ов и их конфигураций
const endpointLoadingConfig: Record<string, LoadingConfig> = {
	// Критические операции - блокирующий оверлей
	'auth.signIn': {
		priority: 'critical',
		label: 'Авторизация...',
		showGlobal: true,
		category: 'auth',
	},
	'auth.signOut': {
		priority: 'critical',
		label: 'Выход из системы...',
		showGlobal: true,
		category: 'auth',
	},
	'projects.create': {
		priority: 'critical',
		label: 'Создание проекта...',
		showGlobal: true,
		category: 'crud',
	},
	'projects.update': {
		priority: 'critical',
		label: 'Сохранение проекта...',
		showGlobal: true,
		category: 'crud',
	},
	'projects.delete': {
		priority: 'critical',
		label: 'Удаление проекта...',
		showGlobal: true,
		category: 'crud',
	},
	'skills.create': {
		priority: 'critical',
		label: 'Создание навыка...',
		showGlobal: true,
		category: 'crud',
	},
	'skills.update': {
		priority: 'critical',
		label: 'Сохранение навыка...',
		showGlobal: true,
		category: 'crud',
	},
	'skills.delete': {
		priority: 'critical',
		label: 'Удаление навыка...',
		showGlobal: true,
		category: 'crud',
	},
	'files.upload': {
		priority: 'critical',
		label: 'Загрузка файла...',
		showGlobal: true,
		category: 'file',
	},
	'users.updateRole': {
		priority: 'critical',
		label: 'Обновление роли пользователя...',
		showGlobal: true,
		category: 'crud',
	},
	'contacts.respond': {
		priority: 'critical',
		label: 'Отправка ответа...',
		showGlobal: true,
		category: 'crud',
	},
	'blog.create': {
		priority: 'critical',
		label: 'Создание поста...',
		showGlobal: true,
		category: 'crud',
	},
	'blog.update': {
		priority: 'critical',
		label: 'Сохранение поста...',
		showGlobal: true,
		category: 'crud',
	},
	'blog.delete': {
		priority: 'critical',
		label: 'Удаление поста...',
		showGlobal: true,
		category: 'crud',
	},

	// Обычные операции - локальные спиннеры
	'admin.getStats': {
		priority: 'normal',
		label: 'Загрузка статистики...',
		showGlobal: false,
		category: 'data',
	},
	'projects.getAll': {
		priority: 'normal',
		label: 'Загрузка проектов...',
		showGlobal: false,
		category: 'data',
	},
	'projects.getById': {
		priority: 'normal',
		label: 'Загрузка проекта...',
		showGlobal: false,
		category: 'data',
	},
	'skills.getAll': {
		priority: 'normal',
		label: 'Загрузка навыков...',
		showGlobal: false,
		category: 'data',
	},
	'skills.getById': {
		priority: 'normal',
		label: 'Загрузка навыка...',
		showGlobal: false,
		category: 'data',
	},
	'users.getAll': {
		priority: 'normal',
		label: 'Загрузка пользователей...',
		showGlobal: false,
		category: 'data',
	},
	'contacts.getContacts': {
		priority: 'normal',
		label: 'Загрузка обращений...',
		showGlobal: false,
		category: 'data',
	},
	'contacts.getStats': {
		priority: 'normal',
		label: 'Загрузка статистики обращений...',
		showGlobal: false,
		category: 'data',
	},
	'blog.getAll': {
		priority: 'normal',
		label: 'Загрузка постов...',
		showGlobal: false,
		category: 'data',
	},
	'blog.getById': {
		priority: 'normal',
		label: 'Загрузка поста...',
		showGlobal: false,
		category: 'data',
	},
	'blog.getStats': {
		priority: 'normal',
		label: 'Загрузка статистики блога...',
		showGlobal: false,
		category: 'data',
	},
	'blog.getAllTags': {
		priority: 'normal',
		label: 'Загрузка тегов...',
		showGlobal: false,
		category: 'data',
	},

	// Фоновые операции - минимальная индикация
	'projects.getStats': {
		priority: 'background',
		label: 'Обновление статистики...',
		showGlobal: false,
		category: 'data',
	},
	'skills.getStats': {
		priority: 'background',
		label: 'Обновление статистики...',
		showGlobal: false,
		category: 'data',
	},
	'users.getStats': {
		priority: 'background',
		label: 'Обновление статистики...',
		showGlobal: false,
		category: 'data',
	},
};

// Функция для получения конфигурации загрузки
function getLoadingConfig(path: string): LoadingConfig {
	const config = endpointLoadingConfig[path];

	if (config) {
		return config;
	}

	// Fallback правила для неизвестных endpoint'ов
	if (
		path.includes('create') ||
		path.includes('update') ||
		path.includes('delete')
	) {
		return {
			priority: 'critical',
			label: 'Сохранение изменений...',
			showGlobal: true,
			category: 'crud',
		};
	}

	if (path.includes('upload')) {
		return {
			priority: 'critical',
			label: 'Загрузка файла...',
			showGlobal: true,
			category: 'file',
		};
	}

	if (path.includes('auth')) {
		return {
			priority: 'critical',
			label: 'Авторизация...',
			showGlobal: true,
			category: 'auth',
		};
	}

	// По умолчанию - обычная операция
	return {
		priority: 'normal',
		label: 'Загрузка данных...',
		showGlobal: false,
		category: 'data',
	};
}

// Интерфейс для контекста загрузки
interface LoadingContextInstance {
	addLoadingTask: (
		id: string,
		label: string,
		type: 'overlay' | 'inline' | 'fullscreen',
	) => void;
	removeLoadingTask: (id: string) => void;
	updateTaskProgress: (
		id: string,
		progress: number,
		estimatedTime?: string,
	) => void;
}

// Глобальная ссылка на контекст загрузки (будет установлена в layout)
let loadingContextInstance: LoadingContextInstance | null = null;

// Функция для установки контекста
export function setLoadingContext(context: LoadingContextInstance) {
	loadingContextInstance = context;
}

/**
 * Middleware для автоматического отслеживания tRPC запросов
 */
export function createLoadingMiddleware<
	TRouter extends AnyRouter,
>(): TRPCLink<TRouter> {
	return () => {
		return ({ next, op }) => {
			// Генерируем уникальный ID для операции
			const operationId = `${op.type}-${op.path}-${Date.now()}-${Math.random()}`;

			// Получаем конфигурацию для endpoint'а
			const config = getLoadingConfig(op.path);

			// Определяем тип отображения спиннера
			const displayType = config.showGlobal ? 'overlay' : 'inline';

			// Логируем начало операции
			console.log(
				`[tRPC Loading] Начало операции: ${op.path} (${config.priority})`,
			);

			// Добавляем задачу загрузки в контекст
			if (loadingContextInstance) {
				loadingContextInstance.addLoadingTask(
					operationId,
					config.label,
					displayType,
				);
			}

			// Засекаем время начала
			const startTime = Date.now();

			return observable((observer) => {
				const subscription = next(op).subscribe({
					next(value) {
						// Передаем значение дальше
						observer.next(value);
					},
					error(error) {
						const duration = Date.now() - startTime;
						console.log(
							`[tRPC Loading] Ошибка операции: ${op.path} (${duration}ms)`,
						);

						// Удаляем задачу загрузки
						if (loadingContextInstance) {
							loadingContextInstance.removeLoadingTask(
								operationId,
							);
						}

						observer.error(error);
					},
					complete() {
						const duration = Date.now() - startTime;
						console.log(
							`[tRPC Loading] Завершение операции: ${op.path} (${duration}ms)`,
						);

						// Удаляем задачу загрузки
						if (loadingContextInstance) {
							loadingContextInstance.removeLoadingTask(
								operationId,
							);
						}

						observer.complete();
					},
				});

				// Возвращаем функцию отписки
				return subscription;
			});
		};
	};
}

// Утилитарные функции для управления загрузкой вручную
export const loadingUtils = {
	/**
	 * Добавить кастомную задачу загрузки
	 */
	addTask: (
		id: string,
		label: string,
		type: 'overlay' | 'inline' | 'fullscreen' = 'inline',
	) => {
		if (loadingContextInstance) {
			loadingContextInstance.addLoadingTask(id, label, type);
		}
	},

	/**
	 * Удалить задачу загрузки
	 */
	removeTask: (id: string) => {
		if (loadingContextInstance) {
			loadingContextInstance.removeLoadingTask(id);
		}
	},

	/**
	 * Обновить прогресс задачи
	 */
	updateProgress: (id: string, progress: number, estimatedTime?: string) => {
		if (loadingContextInstance) {
			loadingContextInstance.updateTaskProgress(
				id,
				progress,
				estimatedTime,
			);
		}
	},

	/**
	 * Выполнить операцию с автоматическим управлением загрузкой
	 */
	withLoading: async <T>(
		operation: () => Promise<T>,
		options: {
			id?: string;
			label?: string;
			type?: 'overlay' | 'inline' | 'fullscreen';
			showProgress?: boolean;
		} = {},
	): Promise<T> => {
		const {
			id = `manual-${Date.now()}`,
			label = 'Выполнение операции...',
			type = 'inline',
			showProgress = false,
		} = options;

		// Добавляем задачу
		loadingUtils.addTask(id, label, type);

		try {
			// Симуляция прогресса для длительных операций
			if (showProgress) {
				const progressInterval = setInterval(() => {
					// Здесь можно добавить логику обновления прогресса
				}, 500);

				const result = await operation();
				clearInterval(progressInterval);
				return result;
			}

			return await operation();
		} finally {
			// Удаляем задачу в любом случае
			loadingUtils.removeTask(id);
		}
	},
};

// Экспорт типов для использования в других файлах
export type { LoadingConfig };
