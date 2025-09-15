import { useCallback, useEffect } from 'react';
import { useLoadingContext } from '~/contexts/LoadingContext';

// Хук для управления конкретной задачей загрузки
export function useLoading(taskId: string, label?: string) {
	const {
		addLoadingTask,
		removeLoadingTask,
		updateTaskProgress,
		isTaskLoading,
		getTaskProgress,
	} = useLoadingContext();

	// Запуск загрузки
	const startLoading = useCallback(
		(
			customLabel?: string,
			type: 'overlay' | 'inline' | 'fullscreen' | 'upload' | 'background' = 'inline',
		) => {
			addLoadingTask(taskId, customLabel || label || 'Загрузка...', type);
		},
		[taskId, label, addLoadingTask],
	);

	// Остановка загрузки
	const stopLoading = useCallback(() => {
		removeLoadingTask(taskId);
	}, [taskId, removeLoadingTask]);

	// Обновление прогресса
	const setProgress = useCallback(
		(progress: number, estimatedTime?: string) => {
			updateTaskProgress(taskId, progress, estimatedTime);
		},
		[taskId, updateTaskProgress],
	);

	// Автоматическая очистка при размонтировании
	useEffect(() => {
		return () => {
			removeLoadingTask(taskId);
		};
	}, [taskId, removeLoadingTask]);

	return {
		startLoading,
		stopLoading,
		setProgress,
		isLoading: isTaskLoading(taskId),
		progress: getTaskProgress(taskId),
	};
}

// Хук для автоматического управления загрузкой
export function useAutoLoading(
	isLoading: boolean,
	label: string,
	type: 'overlay' | 'inline' | 'fullscreen' | 'upload' | 'background' = 'inline',
) {
	const loading = useLoading(label);

	useEffect(() => {
		if (isLoading) {
			loading.startLoading(label, type);
		} else {
			loading.stopLoading();
		}
	}, [isLoading, label, type, loading]);

	return loading;
}
