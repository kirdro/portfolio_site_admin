'use client';

import React, { memo, useMemo } from 'react';
import { DNA } from 'react-loader-spinner';

interface UploadProgressProps {
	progress: number;
	fileName: string;
	fileSize?: number;
	uploadSpeed?: number; // bytes per second
	estimatedTime?: string;
	onCancel?: () => void;
	className?: string;
}

// Киберпанк цвета
const NEON_GREEN = '#00FF99';
const NEON_CYAN = '#00FFCC';

/**
 * Продвинутый компонент прогресса загрузки с DNA спиннером
 * Показывает детальную информацию о процессе загрузки файла
 */
export const UploadProgress = memo(function UploadProgress({
	progress,
	fileName,
	fileSize,
	uploadSpeed,
	estimatedTime,
	onCancel,
	className = '',
}: UploadProgressProps) {
	// Форматирование размера файла
	const formatFileSize = useMemo(() => {
		if (!fileSize) return '';

		const units = ['B', 'KB', 'MB', 'GB'];
		let size = fileSize;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}, [fileSize]);

	// Форматирование скорости загрузки
	const formatUploadSpeed = useMemo(() => {
		if (!uploadSpeed) return '';

		const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
		let speed = uploadSpeed;
		let unitIndex = 0;

		while (speed >= 1024 && unitIndex < units.length - 1) {
			speed /= 1024;
			unitIndex++;
		}

		return `${speed.toFixed(1)} ${units[unitIndex]}`;
	}, [uploadSpeed]);

	// Определение цвета прогресса
	const getProgressColor = useMemo(() => {
		if (progress >= 100) return 'text-green-400 bg-green-400';
		if (progress >= 75) return `text-[${NEON_GREEN}] bg-[${NEON_GREEN}]`;
		if (progress >= 50) return `text-[${NEON_CYAN}] bg-[${NEON_CYAN}]`;
		if (progress >= 25) return 'text-yellow-400 bg-yellow-400';
		return 'text-orange-400 bg-orange-400';
	}, [progress]);

	// Статус загрузки
	const uploadStatus = useMemo(() => {
		if (progress >= 100) return 'Загрузка завершена';
		if (progress >= 95) return 'Обработка файла...';
		if (progress >= 75) return 'Почти готово...';
		if (progress >= 25) return 'Загружается...';
		return 'Инициализация...';
	}, [progress]);

	return (
		<div
			className={`bg-panel border border-line rounded-lg p-6 bevel ${className}`}
		>
			{/* Заголовок с DNA спиннером */}
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center space-x-4'>
					<div className='relative'>
						<DNA
							visible={true}
							height='60'
							width='60'
							ariaLabel='DNA-loading'
							wrapperStyle={{}}
							wrapperClass='dna-wrapper'
						/>
						{/* Неоновое свечение вокруг спиннера */}
						<div
							className='absolute inset-0 rounded-full opacity-20 animate-pulse'
							style={{
								boxShadow: `0 0 20px ${NEON_GREEN}, 0 0 40px ${NEON_GREEN}40`,
							}}
						/>
					</div>

					<div>
						<h3 className='text-lg font-semibold text-neon glyph-glow'>
							{uploadStatus}
						</h3>
						<p className='text-sm text-soft font-mono'>
							{fileName}
						</p>
					</div>
				</div>

				{/* Кнопка отмены */}
				{onCancel && progress < 100 && (
					<button
						onClick={onCancel}
						className='px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm font-medium'
					>
						Отменить
					</button>
				)}
			</div>

			{/* Основной прогресс-бар */}
			<div className='space-y-4'>
				{/* Процент выполнения */}
				<div className='flex items-center justify-between'>
					<span className='text-sm font-medium text-base'>
						Прогресс:
					</span>
					<span
						className={`text-lg font-bold font-mono glyph-glow ${getProgressColor.split(' ')[0]}`}
					>
						{Math.round(progress)}%
					</span>
				</div>

				{/* Прогресс-бар с киберпанк стилизацией */}
				<div className='relative'>
					<div className='w-full bg-subtle rounded-full h-4 border border-line overflow-hidden'>
						{/* Фоновая сетка */}
						<div
							className='absolute inset-0 opacity-20'
							style={{
								backgroundImage:
									'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0, 255, 153, 0.1) 10px, rgba(0, 255, 153, 0.1) 11px)',
							}}
						/>

						{/* Основная полоса прогресса */}
						<div
							className={`h-full transition-all duration-500 ease-out relative ${getProgressColor.split(' ')[1]}`}
							style={{
								width: `${progress}%`,
								boxShadow: `0 0 10px ${progress >= 50 ? NEON_GREEN : NEON_CYAN}80`,
							}}
						>
							{/* Анимированная полоса сканирования */}
							<div
								className='absolute inset-0 opacity-60'
								style={{
									background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
									animation: 'scan 2s linear infinite',
								}}
							/>
						</div>
					</div>

					{/* Неоновое свечение под прогресс-баром */}
					<div
						className='absolute -bottom-1 left-0 h-1 transition-all duration-500 ease-out rounded-full opacity-50'
						style={{
							width: `${progress}%`,
							background: `linear-gradient(90deg, ${NEON_GREEN}, ${NEON_CYAN})`,
							boxShadow: `0 0 10px ${NEON_GREEN}`,
						}}
					/>
				</div>
			</div>

			{/* Детальная информация */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-line'>
				{fileSize && (
					<div className='text-center'>
						<div className='text-xs text-soft uppercase tracking-wider'>
							Размер
						</div>
						<div className='text-sm font-mono text-neon mt-1'>
							{formatFileSize}
						</div>
					</div>
				)}

				{uploadSpeed && (
					<div className='text-center'>
						<div className='text-xs text-soft uppercase tracking-wider'>
							Скорость
						</div>
						<div className='text-sm font-mono text-cyan mt-1'>
							{formatUploadSpeed}
						</div>
					</div>
				)}

				{estimatedTime && (
					<div className='text-center'>
						<div className='text-xs text-soft uppercase tracking-wider'>
							Осталось
						</div>
						<div className='text-sm font-mono text-base mt-1'>
							{estimatedTime}
						</div>
					</div>
				)}

				<div className='text-center'>
					<div className='text-xs text-soft uppercase tracking-wider'>
						Статус
					</div>
					<div
						className={`text-sm font-mono mt-1 ${progress >= 100 ? 'text-green-400' : 'text-yellow-400'}`}
					>
						{progress >= 100 ? 'Готово' : 'Загрузка'}
					</div>
				</div>
			</div>

			{/* CSS для анимации сканирования */}
			<style jsx>{`
				@keyframes scan {
					0% {
						transform: translateX(-100%);
					}
					100% {
						transform: translateX(400%);
					}
				}
			`}</style>
		</div>
	);
});

export default UploadProgress;
