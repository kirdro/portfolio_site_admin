'use client';

import { useState, useCallback, useRef } from 'react';

// Тип для отслеживания прогресса загрузки
interface UploadProgressData {
	progress: number;
	uploadSpeed: number;
	estimatedTime: string;
	bytesUploaded: number;
	totalBytes: number;
}

interface UseUploadProgressReturn {
	// Состояние загрузки
	isUploading: boolean;
	progress: number;
	uploadSpeed: number;
	estimatedTime: string;

	// Методы управления
	startUpload: (
		file: File,
		onComplete: (result: any) => void,
		onError: (error: Error) => void,
	) => void;
	cancelUpload: () => void;
	resetProgress: () => void;
}

/**
 * Хук для отслеживания прогресса загрузки файлов
 * Обеспечивает реальное отслеживание через XMLHttpRequest
 */
export function useUploadProgress(): UseUploadProgressReturn {
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [uploadSpeed, setUploadSpeed] = useState(0);
	const [estimatedTime, setEstimatedTime] = useState('');

	const xhrRef = useRef<XMLHttpRequest | null>(null);
	const startTimeRef = useRef<number>(0);
	const lastProgressRef = useRef<number>(0);
	const lastTimeRef = useRef<number>(0);

	// Расчет скорости загрузки и оставшегося времени
	const calculateSpeedAndTime = useCallback(
		(bytesUploaded: number, totalBytes: number) => {
			const currentTime = Date.now();
			const elapsedTime = currentTime - startTimeRef.current;

			if (elapsedTime > 1000) {
				// Обновляем каждую секунду
				const bytesPerSecond =
					(bytesUploaded - lastProgressRef.current) /
					((currentTime - lastTimeRef.current) / 1000);
				const remainingBytes = totalBytes - bytesUploaded;
				const remainingSeconds = remainingBytes / bytesPerSecond;

				setUploadSpeed(bytesPerSecond);

				// Форматирование оставшегося времени
				if (remainingSeconds < 60) {
					setEstimatedTime(`${Math.round(remainingSeconds)}с`);
				} else if (remainingSeconds < 3600) {
					setEstimatedTime(`${Math.round(remainingSeconds / 60)}м`);
				} else {
					setEstimatedTime(`${Math.round(remainingSeconds / 3600)}ч`);
				}

				lastProgressRef.current = bytesUploaded;
				lastTimeRef.current = currentTime;
			}
		},
		[],
	);

	// Начало загрузки файла
	const startUpload = useCallback(
		(
			file: File,
			onComplete: (result: any) => void,
			onError: (error: Error) => void,
		) => {
			if (isUploading) return;

			setIsUploading(true);
			setProgress(0);
			setUploadSpeed(0);
			setEstimatedTime('Подготовка...');

			startTimeRef.current = Date.now();
			lastProgressRef.current = 0;
			lastTimeRef.current = Date.now();

			// Создаем FormData для загрузки
			const formData = new FormData();

			// Конвертируем файл в base64 для совместимости с существующим API
			const reader = new FileReader();
			reader.onload = () => {
				const base64 = (reader.result as string).split(',')[1];

				// Создаем XMLHttpRequest для отслеживания прогресса
				const xhr = new XMLHttpRequest();
				xhrRef.current = xhr;

				// Обработчик прогресса загрузки
				xhr.upload.addEventListener('progress', (event) => {
					if (event.lengthComputable) {
						const percentComplete =
							(event.loaded / event.total) * 100;
						setProgress(percentComplete);
						calculateSpeedAndTime(event.loaded, event.total);
					}
				});

				// Обработчик успешного завершения
				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						try {
							const result = JSON.parse(xhr.responseText);
							setProgress(100);
							setEstimatedTime('Завершено');
							setTimeout(() => {
								setIsUploading(false);
								onComplete(result);
							}, 500);
						} catch (error) {
							onError(
								new Error('Ошибка парсинга ответа сервера'),
							);
							setIsUploading(false);
						}
					} else {
						onError(new Error(`HTTP Error: ${xhr.status}`));
						setIsUploading(false);
					}
				});

				// Обработчик ошибок
				xhr.addEventListener('error', () => {
					onError(new Error('Ошибка сети при загрузке файла'));
					setIsUploading(false);
				});

				// Обработчик отмены
				xhr.addEventListener('abort', () => {
					setIsUploading(false);
					setProgress(0);
					setEstimatedTime('Отменено');
				});

				// Подготавливаем данные для отправки (симуляция tRPC запроса)
				const uploadData = {
					file: base64,
					fileName: file.name,
					mimeType: file.type,
					category: 'upload', // По умолчанию
					maxSize: file.size,
				};

				// Отправляем запрос
				xhr.open('POST', '/api/trpc/files.upload');
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(uploadData));
			};

			reader.onerror = () => {
				onError(new Error('Ошибка чтения файла'));
				setIsUploading(false);
			};

			reader.readAsDataURL(file);
		},
		[isUploading, calculateSpeedAndTime],
	);

	// Отмена загрузки
	const cancelUpload = useCallback(() => {
		if (xhrRef.current) {
			xhrRef.current.abort();
			xhrRef.current = null;
		}
		setIsUploading(false);
		setProgress(0);
		setUploadSpeed(0);
		setEstimatedTime('');
	}, []);

	// Сброс прогресса
	const resetProgress = useCallback(() => {
		if (!isUploading) {
			setProgress(0);
			setUploadSpeed(0);
			setEstimatedTime('');
		}
	}, [isUploading]);

	return {
		isUploading,
		progress,
		uploadSpeed,
		estimatedTime,
		startUpload,
		cancelUpload,
		resetProgress,
	};
}
