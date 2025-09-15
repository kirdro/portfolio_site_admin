'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonIcon } from './NeonIcon';
import {
	FaCheck,
	FaTimes,
	FaExclamationTriangle,
	FaInfoCircle,
	FaBullhorn,
} from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

interface ToastProps {
	toast: ToastData;
	onRemove: (id: string) => void;
}

/**
 * Компонент отдельного Toast уведомления
 */
function ToastItem({ toast, onRemove }: ToastProps) {
	const [isVisible, setIsVisible] = useState(true);

	// Автоматическое скрытие
	useEffect(() => {
		if (toast.duration && toast.duration > 0) {
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(() => onRemove(toast.id), 300);
			}, toast.duration);

			return () => clearTimeout(timer);
		}
	}, [toast.duration, toast.id, onRemove]);

	// Стили по типу уведомления
	const getToastStyles = (type: ToastType) => {
		switch (type) {
			case 'success':
				return {
					icon: (
						<NeonIcon
							Icon={FaCheck}
							size={18}
							variant='default'
						/>
					),
					borderColor: 'border-green-500',
					bgColor: 'bg-green-500/20',
					textColor: 'text-green-400',
					shadowColor: 'shadow-green-500/20',
				};
			case 'error':
				return {
					icon: (
						<NeonIcon
							Icon={FaTimes}
							size={18}
							variant='red'
						/>
					),
					borderColor: 'border-red-500',
					bgColor: 'bg-red-500/20',
					textColor: 'text-red-400',
					shadowColor: 'shadow-red-500/20',
				};
			case 'warning':
				return {
					icon: (
						<NeonIcon
							Icon={FaExclamationTriangle}
							size={18}
							variant='orange'
						/>
					),
					borderColor: 'border-yellow-500',
					bgColor: 'bg-yellow-500/20',
					textColor: 'text-yellow-400',
					shadowColor: 'shadow-yellow-500/20',
				};
			case 'info':
				return {
					icon: (
						<NeonIcon
							Icon={FaInfoCircle}
							size={18}
							variant='cyan'
						/>
					),
					borderColor: 'border-cyan',
					bgColor: 'bg-cyan/20',
					textColor: 'text-cyan',
					shadowColor: 'shadow-cyan/20',
				};
			default:
				return {
					icon: (
						<NeonIcon
							Icon={FaBullhorn}
							size={18}
							variant='cyan'
						/>
					),
					borderColor: 'border-line',
					bgColor: 'bg-panel',
					textColor: 'text-base',
					shadowColor: 'shadow-neon/20',
				};
		}
	};

	const styles = getToastStyles(toast.type);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => onRemove(toast.id), 300);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, x: 300, scale: 0.8 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{ opacity: 0, x: 300, scale: 0.8 }}
					transition={{
						type: 'spring',
						damping: 25,
						stiffness: 300,
					}}
					className={`
            relative max-w-sm w-full bg-panel border rounded-lg bevel p-4
            ${styles.borderColor} ${styles.bgColor} ${styles.shadowColor}
            shadow-lg backdrop-blur-sm
          `}
				>
					<div className='flex items-start gap-3'>
						{/* Иконка */}
						<div className='flex-shrink-0'>{styles.icon}</div>

						{/* Содержимое */}
						<div className='flex-1 min-w-0'>
							<h4
								className={`font-semibold text-sm ${styles.textColor}`}
							>
								{toast.title}
							</h4>
							{toast.message && (
								<p className='text-sm text-soft mt-1'>
									{toast.message}
								</p>
							)}

							{/* Действие */}
							{toast.action && (
								<button
									onClick={toast.action.onClick}
									className={`mt-2 text-xs font-medium underline hover:no-underline ${styles.textColor}`}
								>
									{toast.action.label}
								</button>
							)}
						</div>

						{/* Кнопка закрытия */}
						<button
							onClick={handleClose}
							className='flex-shrink-0 p-1 rounded hover:bg-black/20 transition-colors'
						>
							<svg
								className='w-4 h-4 text-soft'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>

					{/* Прогресс-бар для автоматического закрытия */}
					{toast.duration && toast.duration > 0 && (
						<div className='absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden'>
							<motion.div
								initial={{ width: '100%' }}
								animate={{ width: '0%' }}
								transition={{
									duration: toast.duration / 1000,
									ease: 'linear',
								}}
								className={`h-full ${styles.bgColor.replace('/20', '/50')}`}
							/>
						</div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

/**
 * Контейнер для всех Toast уведомлений
 */
interface ToastContainerProps {
	toasts: ToastData[];
	onRemove: (id: string) => void;
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center';
}

export function ToastContainer({
	toasts,
	onRemove,
	position = 'top-right',
}: ToastContainerProps) {
	const getPositionClasses = () => {
		switch (position) {
			case 'top-right':
				return 'top-4 right-4';
			case 'top-left':
				return 'top-4 left-4';
			case 'bottom-right':
				return 'bottom-4 right-4';
			case 'bottom-left':
				return 'bottom-4 left-4';
			case 'top-center':
				return 'top-4 left-1/2 transform -translate-x-1/2';
			case 'bottom-center':
				return 'bottom-4 left-1/2 transform -translate-x-1/2';
			default:
				return 'top-4 right-4';
		}
	};

	return (
		<div className={`fixed z-50 ${getPositionClasses()}`}>
			<div className='space-y-3'>
				{toasts.map((toast) => (
					<ToastItem
						key={toast.id}
						toast={toast}
						onRemove={onRemove}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Хук для управления Toast уведомлениями
 */
export function useToasts() {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	const addToast = (toastData: Omit<ToastData, 'id'>) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast: ToastData = {
			id,
			duration: 5000, // 5 секунд по умолчанию
			...toastData,
		};

		setToasts((prevToasts) => [...prevToasts, newToast]);
		return id;
	};

	const removeToast = (id: string) => {
		setToasts((prevToasts) =>
			prevToasts.filter((toast) => toast.id !== id),
		);
	};

	const clearToasts = () => {
		setToasts([]);
	};

	// Удобные методы для разных типов уведомлений
	const success = (
		title: string,
		message?: string,
		options?: Partial<ToastData>,
	) => {
		return addToast({ type: 'success', title, message, ...options });
	};

	const error = (
		title: string,
		message?: string,
		options?: Partial<ToastData>,
	) => {
		return addToast({
			type: 'error',
			title,
			message,
			duration: 8000,
			...options,
		});
	};

	const warning = (
		title: string,
		message?: string,
		options?: Partial<ToastData>,
	) => {
		return addToast({ type: 'warning', title, message, ...options });
	};

	const info = (
		title: string,
		message?: string,
		options?: Partial<ToastData>,
	) => {
		return addToast({ type: 'info', title, message, ...options });
	};

	return {
		toasts,
		addToast,
		removeToast,
		clearToasts,
		success,
		error,
		warning,
		info,
	};
}

// Глобальный провайдер Toast уведомлений (опционально)
const ToastContext = React.createContext<ReturnType<typeof useToasts> | null>(
	null,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const toastApi = useToasts();

	return (
		<ToastContext.Provider value={toastApi}>
			{children}
			<ToastContainer
				toasts={toastApi.toasts}
				onRemove={toastApi.removeToast}
			/>
		</ToastContext.Provider>
	);
}

export function useGlobalToasts() {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error('useGlobalToasts must be used within a ToastProvider');
	}
	return context;
}
