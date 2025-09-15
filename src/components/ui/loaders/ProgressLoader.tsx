'use client';

import React, { memo, useMemo } from 'react';
import { DNA } from 'react-loader-spinner';
import { cn } from '../../../lib/utils';

interface ProgressLoaderProps {
	progress?: number; // 0-100
	label?: string;
	subLabel?: string;
	size?: 'small' | 'medium' | 'large';
	variant?: 'inline' | 'overlay' | 'fullscreen';
	showPercentage?: boolean;
	estimatedTime?: string;
	className?: string;
}

// Размеры спиннера
const sizes = {
	small: 40,
	medium: 60,
	large: 80,
} as const;

// Киберпанк цвета
const NEON_GREEN = '#00FF99';
const NEON_CYAN = '#00FFCC';
const BG_DARK = '#0B0D0E';
const BG_SUBTLE = '#0F1214';

export const ProgressLoader = memo(function ProgressLoader({
	progress = 0,
	label = 'Загрузка',
	subLabel,
	size = 'medium',
	variant = 'inline',
	showPercentage = true,
	estimatedTime,
	className,
}: ProgressLoaderProps) {
	const spinnerSize = sizes[size];
	const safeProgress = Math.min(100, Math.max(0, progress));

	// Основной компонент лоадера
	const loader = (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-4',
				variant === 'inline' && 'p-4',
				variant === 'overlay' && 'p-8',
				variant === 'fullscreen' && 'p-12',
				className,
			)}
		>
			{/* DNA спиннер */}
			<div
				className='relative'
				style={{
					filter: `drop-shadow(0 0 ${size === 'large' ? '30px' : '20px'} rgba(0, 255, 153, 0.5))`,
				}}
			>
				<DNA
					visible={true}
					height={spinnerSize}
					width={spinnerSize}
					ariaLabel='dna-loading'
					wrapperStyle={{}}
					wrapperClass='dna-wrapper'
				/>

				{/* Пульсирующий эффект */}
				<div
					className='absolute inset-0 animate-pulse'
					style={{
						background: `radial-gradient(circle, ${NEON_GREEN}15 0%, transparent 70%)`,
						filter: 'blur(25px)',
						pointerEvents: 'none',
					}}
				/>
			</div>

			{/* Текстовые метки */}
			<div className='text-center space-y-2 min-w-[200px]'>
				{/* Основная метка */}
				<p
					className='font-mono text-sm uppercase tracking-wider'
					style={{
						color: NEON_GREEN,
						textShadow: `0 0 10px ${NEON_GREEN}50`,
					}}
				>
					{label}
				</p>

				{/* Дополнительная метка */}
				{subLabel && (
					<p
						className='font-mono text-xs opacity-70'
						style={{ color: NEON_CYAN }}
					>
						{subLabel}
					</p>
				)}
			</div>

			{/* Прогресс-бар */}
			<div className='w-full max-w-xs space-y-2'>
				{/* Контейнер прогресс-бара */}
				<div
					className='relative h-2 rounded-full overflow-hidden'
					style={{
						backgroundColor: `${BG_SUBTLE}`,
						border: `1px solid ${NEON_GREEN}20`,
						boxShadow: `
              inset 0 1px 3px rgba(0, 0, 0, 0.5),
              0 0 10px ${NEON_GREEN}10
            `,
					}}
				>
					{/* Фоновая анимация */}
					<div
						className='absolute inset-0 opacity-20'
						style={{
							background: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                ${NEON_GREEN}10 10px,
                ${NEON_GREEN}10 20px
              )`,
							animation: 'slide 2s linear infinite',
						}}
					/>

					{/* Заполнение прогресса */}
					<div
						className='relative h-full transition-all duration-300 ease-out'
						style={{
							width: `${safeProgress}%`,
							background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_GREEN})`,
							boxShadow: `
                0 0 10px ${NEON_GREEN}50,
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `,
						}}
					>
						{/* Эффект свечения на конце */}
						<div
							className='absolute right-0 top-0 bottom-0 w-2'
							style={{
								background: `radial-gradient(circle, ${NEON_GREEN} 0%, transparent 70%)`,
								filter: 'blur(4px)',
							}}
						/>
					</div>
				</div>

				{/* Информация о прогрессе */}
				<div className='flex justify-between items-center text-xs font-mono'>
					{/* Процент */}
					{showPercentage && (
						<span
							style={{
								color: NEON_GREEN,
								textShadow: `0 0 5px ${NEON_GREEN}30`,
							}}
						>
							{safeProgress.toFixed(0)}%
						</span>
					)}

					{/* Оставшееся время */}
					{estimatedTime && (
						<span
							className='opacity-60'
							style={{ color: NEON_CYAN }}
						>
							{estimatedTime}
						</span>
					)}
				</div>
			</div>

			{/* Дополнительная информация для больших размеров */}
			{size === 'large' && safeProgress > 0 && (
				<div className='flex gap-4 text-xs font-mono opacity-60'>
					<div style={{ color: NEON_CYAN }}>
						Обработано: {safeProgress.toFixed(0)}%
					</div>
					{estimatedTime && (
						<>
							<span style={{ color: NEON_GREEN }}>•</span>
							<div style={{ color: NEON_CYAN }}>
								Осталось: {estimatedTime}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);

	// Варианты отображения
	if (variant === 'overlay') {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center'>
				{/* Затемнение */}
				<div
					className='absolute inset-0'
					style={{
						backgroundColor: 'rgba(11, 13, 14, 0.9)',
						backdropFilter: 'blur(6px)',
					}}
				/>

				{/* Контейнер с киберпанк рамкой */}
				<div
					className='relative rounded-lg p-1'
					style={{
						background: `linear-gradient(135deg, ${NEON_GREEN}30, ${NEON_CYAN}30)`,
						boxShadow: `0 0 40px ${NEON_GREEN}30`,
					}}
				>
					<div
						className='rounded-lg'
						style={{
							backgroundColor: BG_SUBTLE,
							boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
						}}
					>
						{loader}
					</div>
				</div>
			</div>
		);
	}

	if (variant === 'fullscreen') {
		return (
			<div
				className='fixed inset-0 z-50 flex items-center justify-center'
				style={{ backgroundColor: BG_DARK }}
			>
				{/* Киберпанк сетка на фоне */}
				<div
					className='absolute inset-0 opacity-5'
					style={{
						backgroundImage: `
              linear-gradient(${NEON_GREEN}20 1px, transparent 1px),
              linear-gradient(90deg, ${NEON_GREEN}20 1px, transparent 1px)
            `,
						backgroundSize: '50px 50px',
					}}
				/>

				{/* Сканлайны */}
				<div
					className='absolute inset-0 pointer-events-none opacity-10'
					style={{
						backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${NEON_GREEN}05 2px,
              ${NEON_GREEN}05 4px
            )`,
						animation: 'scanlines 8s linear infinite',
					}}
				/>

				{loader}
			</div>
		);
	}

	// Inline вариант по умолчанию
	return loader;
});

// CSS анимации
const animationStyles = `
  @keyframes slide {
    0% { transform: translateX(-20px); }
    100% { transform: translateX(20px); }
  }
  
  @keyframes scanlines {
    0% { transform: translateY(0); }
    100% { transform: translateY(10px); }
  }
`;

// Добавляем стили в head
if (
	typeof document !== 'undefined' &&
	!document.getElementById('progress-loader-styles')
) {
	const style = document.createElement('style');
	style.id = 'progress-loader-styles';
	style.textContent = animationStyles;
	document.head.appendChild(style);
}
