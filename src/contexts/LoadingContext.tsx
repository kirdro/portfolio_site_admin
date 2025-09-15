'use client';

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from 'react';
import { Spinner, ProgressLoader } from '~/components/ui/loaders';
import { setLoadingContext } from '../utils/trpc-loading-middleware';

// Типы для задач загрузки
interface LoadingTask {
	id: string;
	label: string;
	type: 'overlay' | 'inline' | 'fullscreen' | 'upload' | 'background';
	progress?: number;
	startTime: number;
	estimatedTime?: string;
}

// Типы контекста
interface LoadingContextType {
	// Состояние
	globalLoading: boolean;
	loadingTasks: Map<string, LoadingTask>;

	// Методы управления
	addLoadingTask: (
		id: string,
		label: string,
		type: LoadingTask['type'],
	) => void;
	removeLoadingTask: (id: string) => void;
	updateTaskProgress: (
		id: string,
		progress: number,
		estimatedTime?: string,
	) => void;

	// Утилиты
	isTaskLoading: (id: string) => boolean;
	getTaskProgress: (id: string) => number | undefined;
	getActiveTasksCount: () => number;
}

// Создаем контекст
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Провайдер контекста
export function LoadingProvider({ children }: { children: React.ReactNode }) {
	const [loadingTasks, setLoadingTasks] = useState<Map<string, LoadingTask>>(
		new Map(),
	);

	// Глобальное состояние загрузки
	const globalLoading = useMemo(() => {
		// Проверяем, есть ли критические задачи (overlay/fullscreen)
		for (const task of loadingTasks.values()) {
			if (task.type === 'overlay' || task.type === 'fullscreen') {
				return true;
			}
		}
		return false;
	}, [loadingTasks]);

	// Добавление задачи загрузки
	const addLoadingTask = useCallback(
		(id: string, label: string, type: LoadingTask['type']) => {
			setLoadingTasks((prev) => {
				const newTasks = new Map(prev);
				newTasks.set(id, {
					id,
					label,
					type,
					startTime: Date.now(),
					progress: 0,
				});
				return newTasks;
			});
		},
		[],
	);

	// Удаление задачи загрузки
	const removeLoadingTask = useCallback((id: string) => {
		setLoadingTasks((prev) => {
			const newTasks = new Map(prev);
			newTasks.delete(id);
			return newTasks;
		});
	}, []);

	// Обновление прогресса задачи
	const updateTaskProgress = useCallback(
		(id: string, progress: number, estimatedTime?: string) => {
			setLoadingTasks((prev) => {
				const newTasks = new Map(prev);
				const task = newTasks.get(id);
				if (task) {
					newTasks.set(id, {
						...task,
						progress,
						estimatedTime,
					});
				}
				return newTasks;
			});
		},
		[],
	);

	// Проверка, загружается ли задача
	const isTaskLoading = useCallback(
		(id: string) => {
			return loadingTasks.has(id);
		},
		[loadingTasks],
	);

	// Получение прогресса задачи
	const getTaskProgress = useCallback(
		(id: string) => {
			return loadingTasks.get(id)?.progress;
		},
		[loadingTasks],
	);

	// Получение количества активных задач
	const getActiveTasksCount = useCallback(() => {
		return loadingTasks.size;
	}, [loadingTasks]);

	// Определяем, какой тип индикатора показать
	const getLoadingIndicator = () => {
		// Находим задачи с прогрессом
		const uploadTasks = Array.from(loadingTasks.values()).filter(
			(task) => task.type === 'upload' && task.progress !== undefined,
		);

		// Если есть загрузка файлов - показываем прогресс
		if (uploadTasks.length > 0) {
			const task = uploadTasks[0]; // Берем первую задачу загрузки
			if (task) {
				return (
					<ProgressLoader
						progress={task.progress || 0}
						label={task.label}
						estimatedTime={task.estimatedTime}
						size='large'
						variant='overlay'
						showPercentage
					/>
				);
			}
		}

		// Находим критические задачи
		const overlayTasks = Array.from(loadingTasks.values()).filter(
			(task) => task.type === 'overlay',
		);

		const fullscreenTasks = Array.from(loadingTasks.values()).filter(
			(task) => task.type === 'fullscreen',
		);

		// Показываем fullscreen спиннер (максимальный приоритет)
		if (fullscreenTasks.length > 0) {
			const task = fullscreenTasks[0];
			if (task) {
				return (
					<Spinner
						size='large'
						label={task.label}
						variant='fullscreen'
					/>
				);
			}
		}

		// Показываем overlay спиннер
		if (overlayTasks.length > 0) {
			const task = overlayTasks[0];
			if (task) {
				return (
					<Spinner
						size='large'
						label={task.label}
						variant='overlay'
					/>
				);
			}
		}

		return null;
	};

	const value = useMemo(
		() => ({
			globalLoading,
			loadingTasks,
			addLoadingTask,
			removeLoadingTask,
			updateTaskProgress,
			isTaskLoading,
			getTaskProgress,
			getActiveTasksCount,
		}),
		[
			globalLoading,
			loadingTasks,
			addLoadingTask,
			removeLoadingTask,
			updateTaskProgress,
			isTaskLoading,
			getTaskProgress,
			getActiveTasksCount,
		],
	);

	// Устанавливаем ссылку на контекст для middleware
	useEffect(() => {
		setLoadingContext({
			addLoadingTask,
			removeLoadingTask,
			updateTaskProgress,
		});
	}, [addLoadingTask, removeLoadingTask, updateTaskProgress]);

	return (
		<LoadingContext.Provider value={value}>
			{children}
			{/* Глобальный индикатор загрузки */}
			{globalLoading && getLoadingIndicator()}
		</LoadingContext.Provider>
	);
}

// Хук для использования контекста
export function useLoadingContext() {
	const context = useContext(LoadingContext);
	if (context === undefined) {
		throw new Error(
			'useLoadingContext must be used within a LoadingProvider',
		);
	}
	return context;
}
