import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
	currentImageUrl?: string | null;
	onImageUpload: (imageUrl: string) => void;
	maxSizeInMB?: number;
	acceptedFormats?: string[];
}

/**
 * Компонент загрузки изображений с drag & drop
 * Поддержка превью, валидации размера и формата файлов
 */
export function ImageUpload({
	currentImageUrl,
	onImageUpload,
	maxSizeInMB = 5,
	acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Валидация файла
	const валидироватьФайл = useCallback(
		(file: File): string | null => {
			// Проверка формата
			if (!acceptedFormats.includes(file.type)) {
				return `Поддерживаемые форматы: ${acceptedFormats
					.map((f) => f.split('/')[1])
					.join(', ')
					.toUpperCase()}`;
			}

			// Проверка размера
			const sizeInMB = file.size / (1024 * 1024);
			if (sizeInMB > maxSizeInMB) {
				return `Максимальный размер файла: ${maxSizeInMB}MB`;
			}

			return null;
		},
		[acceptedFormats, maxSizeInMB],
	);

	// Симуляция загрузки файла (в реальном проекте здесь будет API вызов)
	const загрузитьФайл = useCallback(async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			// Симулируем прогресс загрузки
			let progress = 0;
			const interval = setInterval(() => {
				progress += 10;
				setUploadProgress(progress);

				if (progress >= 100) {
					clearInterval(interval);
					// В реальном приложении здесь будет возвращён URL с сервера
					const mockUrl = URL.createObjectURL(file);
					resolve(mockUrl);
				}
			}, 100);
		});
	}, []);

	// Обработка файлов
	const обработатьФайлы = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];
			if (!file) return;
			const validationError = валидироватьФайл(file);

			if (validationError) {
				setError(validationError);
				return;
			}

			setError(null);
			setIsUploading(true);
			setUploadProgress(0);

			try {
				const imageUrl = await загрузитьФайл(file);
				onImageUpload(imageUrl);
			} catch (error) {
				console.error('Ошибка загрузки:', error);
				setError('Ошибка загрузки файла');
			} finally {
				setIsUploading(false);
				setUploadProgress(0);
			}
		},
		[валидироватьФайл, загрузитьФайл, onImageUpload],
	);

	// Drag & Drop обработчики
	const обработчикDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const обработчикDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const обработчикDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			обработатьФайлы(e.dataTransfer.files);
		},
		[обработатьФайлы],
	);

	// Обработчик выбора файла
	const обработчикВыбораФайла = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			обработатьФайлы(e.target.files);
		},
		[обработатьФайлы],
	);

	// Открытие диалога выбора файла
	const открытьВыборФайла = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Удаление текущего изображения
	const удалитьИзображение = useCallback(() => {
		onImageUpload('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [onImageUpload]);

	return (
		<div className='space-y-4'>
			{/* Область загрузки */}
			<div
				onDragOver={обработчикDragOver}
				onDragLeave={обработчикDragLeave}
				onDrop={обработчикDrop}
				onClick={открытьВыборФайла}
				className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300
          ${
				isDragging ?
					'border-neon bg-neon/5 scale-105'
				:	'border-line hover:border-neon hover:bg-neon/5'
			}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
			>
				<input
					ref={fileInputRef}
					type='file'
					accept={acceptedFormats.join(',')}
					onChange={обработчикВыбораФайла}
					className='hidden'
				/>

				{isUploading ?
					// Состояние загрузки
					<div className='space-y-3'>
						<div className='text-neon text-2xl'>⏳</div>
						<div className='text-sm text-neon'>
							Загрузка изображения...
						</div>
						<div className='w-full bg-subtle rounded-full h-2'>
							<div
								className='bg-neon h-2 rounded-full transition-all duration-300'
								style={{ width: `${uploadProgress}%` }}
							/>
						</div>
						<div className='text-xs text-soft'>
							{uploadProgress}%
						</div>
					</div>
				: currentImageUrl ?
					// Превью текущего изображения
					<div className='space-y-3'>
						<div className='relative w-32 h-32 mx-auto rounded-lg overflow-hidden'>
							<Image
								src={currentImageUrl}
								alt='Превью изображения'
								fill
								className='object-cover'
							/>
						</div>
						<div className='flex justify-center space-x-2'>
							<button
								type='button'
								onClick={(e) => {
									e.stopPropagation();
									открытьВыборФайла();
								}}
								className='px-3 py-1 bg-cyan/20 border border-cyan text-cyan rounded text-sm
                         hover:bg-cyan/30 transition-colors'
							>
								🔄 Заменить
							</button>
							<button
								type='button'
								onClick={(e) => {
									e.stopPropagation();
									удалитьИзображение();
								}}
								className='px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded text-sm
                         hover:bg-red-500/30 transition-colors'
							>
								🗑️ Удалить
							</button>
						</div>
					</div>
					// Состояние пустой загрузки
				:	<div className='space-y-3'>
						<div className='text-4xl text-soft'>
							{isDragging ? '📤' : '🖼️'}
						</div>
						<div className='space-y-1'>
							<div className='text-base font-medium'>
								{isDragging ?
									'Отпустите файл для загрузки'
								:	'Загрузить изображение'}
							</div>
							<div className='text-sm text-soft'>
								Перетащите файл или нажмите для выбора
							</div>
						</div>
					</div>
				}
			</div>

			{/* Информация о ограничениях */}
			<div className='text-xs text-soft text-center space-y-1'>
				<div>
					Поддерживаемые форматы:{' '}
					{acceptedFormats
						.map((f) => f.split('/')[1])
						.join(', ')
						.toUpperCase()}
				</div>
				<div>Максимальный размер: {maxSizeInMB}MB</div>
			</div>

			{/* Отображение ошибок */}
			{error && (
				<div className='bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm'>
					⚠️ {error}
				</div>
			)}
		</div>
	);
}
