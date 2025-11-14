'use client';

import React, { useState, useEffect } from 'react';

export const SimpleMobileBlocker: React.FC = () => {
	const [shouldShow, setShouldShow] = useState(false);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const handleResize = () => {
			const currentWidth = window.innerWidth;
			setWidth(currentWidth);
			setShouldShow(currentWidth < 1000);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (!shouldShow) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: '#0B0D0E',
				color: '#00FF99',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 9999,
				fontFamily: 'Arial, sans-serif'
			}}
		>
			<h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
				🚫 Мобильная версия в разработке
			</h1>
			<p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
				Используйте устройство с шириной экрана не менее 1000px
			</p>
			<p style={{ fontSize: '0.875rem', color: '#00FFCC' }}>
				Текущая ширина: {width}px
			</p>
		</div>
	);
};