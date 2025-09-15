'use client';

import React, { memo, useMemo } from 'react';
import { DNA } from 'react-loader-spinner';
import { cn } from '../../../lib/utils';

interface SpinnerProps {
	size?: 'small' | 'medium' | 'large' | 'xlarge';
	label?: string;
	variant?: 'inline' | 'overlay' | 'fullscreen';
	className?: string;
}

// Размеры спиннера
const sizes = {
	small: 40,
	medium: 60,
	large: 80,
	xlarge: 120,
} as const;

// Киберпанк цвета из дизайн-системы
const NEON_GREEN = '#00FF99';
const NEON_CYAN = '#00FFCC';

export const Spinner = memo(function Spinner({
	size = 'medium',
	label,
	variant = 'inline',
	className,
}: SpinnerProps) {
	// Мемоизируем размер спиннера для оптимизации
	const spinnerSize = useMemo(() => sizes[size], [size]);

	// Базовый компонент спиннера
	const spinner = (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-3',
				variant === 'inline' && 'p-4',
				variant === 'overlay' && 'p-8',
				variant === 'fullscreen' && 'p-12',
				className,
			)}
		>
			{/* DNA спиннер с киберпанк цветами и анимациями */}
			<div
				className='relative cyber-pulse'
				style={{
					filter: 'drop-shadow(0 0 20px rgba(0, 255, 153, 0.5))',
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

				{/* Дополнительный неоновый эффект */}
				<div
					className='absolute inset-0 animate-pulse'
					style={{
						background: `radial-gradient(circle, ${NEON_GREEN}20 0%, transparent 70%)`,
						filter: 'blur(20px)',
						pointerEvents: 'none',
					}}
				/>
			</div>

			{/* Метка загрузки */}
			{label && (
				<div className='text-center space-y-1'>
					<p
						className='font-mono text-sm uppercase tracking-wider animate-pulse'
						style={{
							color: NEON_GREEN,
							textShadow: `0 0 10px ${NEON_GREEN}50`,
						}}
					>
						{label}
					</p>

					{/* Анимированные точки */}
					<div className='flex justify-center gap-1'>
						{[0, 1, 2].map((i) => (
							<span
								key={i}
								className='inline-block w-1 h-1 rounded-full animate-bounce'
								style={{
									backgroundColor: NEON_CYAN,
									animationDelay: `${i * 150}ms`,
									boxShadow: `0 0 5px ${NEON_CYAN}`,
								}}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);

	// Варианты отображения
	if (variant === 'overlay') {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center'>
				{/* Затемнение фона */}
				<div
					className='absolute inset-0'
					style={{
						backgroundColor: 'rgba(11, 13, 14, 0.85)',
						backdropFilter: 'blur(4px)',
					}}
				/>

				{/* Контейнер спиннера с киберпанк стилем */}
				<div
					className='relative rounded-lg border'
					style={{
						backgroundColor: '#0F1214',
						borderColor: `${NEON_GREEN}40`,
						boxShadow: `
              0 0 30px ${NEON_GREEN}20,
              inset 0 0 20px rgba(0, 0, 0, 0.5)
            `,
					}}
				>
					{spinner}
				</div>
			</div>
		);
	}

	if (variant === 'fullscreen') {
		return (
			<div
				className='fixed inset-0 z-50 flex items-center justify-center'
				style={{ backgroundColor: '#0B0D0E' }}
			>
				{/* Сканлайны для киберпанк эффекта */}
				<div
					className='absolute inset-0 pointer-events-none opacity-10'
					style={{
						backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${NEON_GREEN}10 2px,
              ${NEON_GREEN}10 4px
            )`,
						animation: 'scanlines 8s linear infinite',
					}}
				/>

				{spinner}
			</div>
		);
	}

	// Inline вариант по умолчанию
	return spinner;
});

// CSS анимация для сканлайнов
const scanlineStyles = `
  @keyframes scanlines {
    0% { transform: translateY(0); }
    100% { transform: translateY(10px); }
  }
`;

// Добавляем стили в head
if (
	typeof document !== 'undefined' &&
	!document.getElementById('spinner-styles')
) {
	const style = document.createElement('style');
	style.id = 'spinner-styles';
	style.textContent = scanlineStyles;
	document.head.appendChild(style);
}
