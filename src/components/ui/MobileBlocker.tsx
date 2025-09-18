'use client';

import React, { useState, useEffect } from 'react';
import { FaDesktop, FaTabletAlt, FaMobileAlt } from 'react-icons/fa';

/**
 * Компонент блокировки доступа с мобильных устройств
 * Показывается при ширине экрана меньше 1000px
 */
export const MobileBlocker: React.FC = () => {
	const [isMobile, setIsMobile] = useState(false);
	const [screenWidth, setScreenWidth] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		// Устанавливаем, что мы на клиенте
		setIsClient(true);

		const checkScreenSize = () => {
			const width = window.innerWidth;
			setScreenWidth(width);
			const shouldBlock = width < 1000;
			setIsMobile(shouldBlock);
			console.log('🔍 MobileBlocker: Screen width:', width, 'shouldBlock:', shouldBlock);
		};

		// Проверяем размер при монтировании
		checkScreenSize();

		// Слушаем изменения размера окна
		window.addEventListener('resize', checkScreenSize);

		return () => {
			window.removeEventListener('resize', checkScreenSize);
		};
	}, []);

	console.log('🔍 MobileBlocker render: isClient:', isClient, 'isMobile:', isMobile, 'width:', screenWidth);

	// Не рендерим на сервере, только на клиенте
	if (!isClient) {
		return null;
	}

	// Если экран достаточно большой - не показываем блокировку
	if (!isMobile) {
		return null;
	}

	return (
		<div className='mobile-blocker-overlay'>
			{/* Анимированные сканлайны для киберпанк эффекта */}
			<div className='mobile-blocker-scanlines' />

			{/* Основной контент */}
			<div className='mobile-blocker-content'>
				{/* Иконка устройства */}
				<div className='mobile-blocker-icon'>
					<FaDesktop className='desktop-icon' />
					<div className='device-separator'>
						<div className='separator-line' />
						<span className='separator-text'>требуется</span>
						<div className='separator-line' />
					</div>
					<div className='mobile-icons'>
						<FaTabletAlt className='blocked-icon' />
						<FaMobileAlt className='blocked-icon' />
					</div>
				</div>

				{/* Заголовок */}
				<h1 className='mobile-blocker-title'>
					Администратор-панель
				</h1>
				<h2 className='mobile-blocker-subtitle'>kirdro.ru</h2>

				{/* Основное сообщение */}
				<div className='mobile-blocker-message'>
					<p className='message-primary'>
						Мобильная версия находится в разработке
					</p>
					<p className='message-secondary'>
						Для доступа к админ-панели используйте устройство с шириной экрана
						не менее 1000 пикселей
					</p>
				</div>

				{/* Технические требования */}
				<div className='mobile-blocker-requirements'>
					<div className='requirement-item'>
						<span className='requirement-label'>Минимальное разрешение:</span>
						<span className='requirement-value'>1000×600px</span>
					</div>
					<div className='requirement-item'>
						<span className='requirement-label'>Рекомендуемое:</span>
						<span className='requirement-value'>1920×1080px</span>
					</div>
					<div className='requirement-item'>
						<span className='requirement-label'>Поддерживаемые устройства:</span>
						<span className='requirement-value'>
							Десктоп, планшеты в горизонтальном режиме
						</span>
					</div>
				</div>

				{/* Статус разработки */}
				<div className='mobile-blocker-status'>
					<div className='status-indicator'>
						<div className='status-dot' />
						<span className='status-text'>В разработке</span>
					</div>
					<p className='status-description'>
						Мобильная версия будет доступна в следующих обновлениях
					</p>
				</div>

				{/* Дополнительная информация */}
				<div className='mobile-blocker-info'>
					<p>
						Текущий размер экрана: <span className='info-highlight'>{screenWidth}×{typeof window !== 'undefined' ? window.innerHeight : 0}px</span>
					</p>
				</div>
			</div>

			{/* Матричный дождь для киберпанк атмосферы */}
			<div className='matrix-background'>
				{Array.from({ length: 20 }, (_, i) => (
					<div
						key={i}
						className='matrix-column'
						style={{
							left: `${i * 5}%`,
							animationDelay: `${i * 0.5}s`,
						}}
					>
						{Array.from({ length: 10 }, (_, j) => (
							<span
								key={j}
								className='matrix-char'
								style={{ animationDelay: `${j * 0.1}s` }}
							>
								{Math.random() > 0.5 ? '1' : '0'}
							</span>
						))}
					</div>
				))}
			</div>
		</div>
	);
};