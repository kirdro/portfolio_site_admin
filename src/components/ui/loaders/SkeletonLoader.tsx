'use client';

import React, { memo } from 'react';
import { cn } from '../../../lib/utils';

// Типы вариантов скелетона
type SkeletonVariant =
	| 'text'
	| 'title'
	| 'card'
	| 'avatar'
	| 'button'
	| 'image'
	| 'custom';

interface SkeletonLoaderProps {
	variant?: SkeletonVariant;
	lines?: number; // Для текста
	width?: string | number;
	height?: string | number;
	className?: string;
	animate?: boolean;
	rounded?: boolean;
}

// Киберпанк цвета
const NEON_GREEN = '#00FF99';
const BG_SUBTLE = '#0F1214';
const BG_SHIMMER = '#1A1F23';

export const SkeletonLoader = memo(function SkeletonLoader({
	variant = 'text',
	lines = 1,
	width,
	height,
	className,
	animate = true,
	rounded = false,
}: SkeletonLoaderProps) {
	// Базовые стили скелетона
	const baseStyles = cn(
		'relative overflow-hidden',
		rounded ? 'rounded-lg' : 'rounded-sm',
		animate && 'animate-pulse',
		className,
	);

	// Стили для разных вариантов
	const getVariantStyles = () => {
		switch (variant) {
			case 'text':
				return {
					width: width || '100%',
					height: height || '1rem',
					backgroundColor: BG_SUBTLE,
				};
			case 'title':
				return {
					width: width || '60%',
					height: height || '2rem',
					backgroundColor: BG_SUBTLE,
				};
			case 'card':
				return {
					width: width || '100%',
					height: height || '200px',
					backgroundColor: BG_SUBTLE,
				};
			case 'avatar':
				return {
					width: width || '48px',
					height: height || '48px',
					borderRadius: '50%',
					backgroundColor: BG_SUBTLE,
				};
			case 'button':
				return {
					width: width || '120px',
					height: height || '40px',
					backgroundColor: BG_SUBTLE,
				};
			case 'image':
				return {
					width: width || '100%',
					height: height || '300px',
					backgroundColor: BG_SUBTLE,
				};
			case 'custom':
				return {
					width: width || '100%',
					height: height || 'auto',
					backgroundColor: BG_SUBTLE,
				};
			default:
				return {};
		}
	};

	const styles = getVariantStyles();

	// Рендер нескольких линий для текста
	if (variant === 'text' && lines > 1) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: lines }, (_, index) => (
					<div
						key={index}
						className={baseStyles}
						style={{
							...styles,
							width: index === lines - 1 ? '80%' : '100%', // Последняя линия короче
							boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.3)`,
						}}
					>
						{animate && (
							<div
								className='absolute inset-0 -translate-x-full animate-shimmer'
								style={{
									background: `linear-gradient(
                    90deg,
                    transparent,
                    ${NEON_GREEN}10,
                    transparent
                  )`,
								}}
							/>
						)}
					</div>
				))}
			</div>
		);
	}

	// Обычный скелетон
	return (
		<div
			className={baseStyles}
			style={{
				...styles,
				boxShadow: `
          inset 0 1px 3px rgba(0, 0, 0, 0.3),
          0 0 10px ${NEON_GREEN}05
        `,
			}}
		>
			{animate && (
				<div
					className='absolute inset-0 -translate-x-full animate-shimmer'
					style={{
						background: `linear-gradient(
              90deg,
              transparent,
              ${NEON_GREEN}15,
              transparent
            )`,
					}}
				/>
			)}
		</div>
	);
});

// Компонент скелетона для таблиц
interface TableSkeletonProps {
	rows?: number;
	columns?: number;
	showHeader?: boolean;
	className?: string;
}

export const TableSkeleton = memo(function TableSkeleton({
	rows = 5,
	columns = 4,
	showHeader = true,
	className,
}: TableSkeletonProps) {
	return (
		<div className={cn('w-full', className)}>
			{/* Заголовок таблицы */}
			{showHeader && (
				<div
					className='flex gap-4 p-4 border-b'
					style={{ borderColor: `${NEON_GREEN}20` }}
				>
					{Array.from({ length: columns }, (_, index) => (
						<SkeletonLoader
							key={`header-${index}`}
							variant='text'
							width={index === 0 ? '150px' : '100px'}
							height='1.2rem'
						/>
					))}
				</div>
			)}

			{/* Строки таблицы */}
			{Array.from({ length: rows }, (_, rowIndex) => (
				<div
					key={`row-${rowIndex}`}
					className='flex gap-4 p-4 border-b'
					style={{ borderColor: `${BG_SUBTLE}50` }}
				>
					{Array.from({ length: columns }, (_, colIndex) => (
						<SkeletonLoader
							key={`cell-${rowIndex}-${colIndex}`}
							variant='text'
							width={colIndex === 0 ? '150px' : '100px'}
							height='1rem'
							animate={true}
						/>
					))}
				</div>
			))}
		</div>
	);
});

// Компонент скелетона для карточек
interface CardSkeletonProps {
	showImage?: boolean;
	showTitle?: boolean;
	showDescription?: boolean;
	showActions?: boolean;
	className?: string;
}

export const CardSkeleton = memo(function CardSkeleton({
	showImage = true,
	showTitle = true,
	showDescription = true,
	showActions = false,
	className,
}: CardSkeletonProps) {
	return (
		<div
			className={cn('cyber-card p-6 space-y-4', className)}
			style={{
				backgroundColor: BG_SUBTLE,
				border: `1px solid ${NEON_GREEN}20`,
			}}
		>
			{/* Изображение */}
			{showImage && (
				<SkeletonLoader
					variant='image'
					height='200px'
					rounded
				/>
			)}

			{/* Заголовок */}
			{showTitle && (
				<SkeletonLoader
					variant='title'
					width='70%'
				/>
			)}

			{/* Описание */}
			{showDescription && (
				<SkeletonLoader
					variant='text'
					lines={3}
				/>
			)}

			{/* Действия */}
			{showActions && (
				<div className='flex gap-2 pt-2'>
					<SkeletonLoader variant='button' />
					<SkeletonLoader
						variant='button'
						width='80px'
					/>
				</div>
			)}
		</div>
	);
});

// CSS анимация для shimmer эффекта
if (
	typeof document !== 'undefined' &&
	!document.getElementById('skeleton-styles')
) {
	const style = document.createElement('style');
	style.id = 'skeleton-styles';
	style.textContent = `
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;
	document.head.appendChild(style);
}
