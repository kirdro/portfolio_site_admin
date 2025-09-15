'use client';

import React from 'react';
import { type ChatStatsData } from '../../../app/(dashboard)/chat/page';

interface ChatStatsProps {
	stats: ChatStatsData;
	loading: boolean;
}

/**
 * Компонент статистики и аналитики чатов
 * Графики активности, топ пользователи, модерационные действия
 */
export function ChatStats({ stats, loading }: ChatStatsProps) {
	// Loading состояние
	if (loading) {
		return (
			<div className='space-y-6'>
				{/* Основные метрики - скелетон */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className='bg-subtle rounded-lg p-6 animate-pulse'
						>
							<div className='h-4 bg-panel rounded mb-3 w-24' />
							<div className='h-8 bg-panel rounded w-16' />
						</div>
					))}
				</div>

				{/* График активности - скелетон */}
				<div className='bg-subtle rounded-lg p-6 animate-pulse'>
					<div className='h-5 bg-panel rounded mb-4 w-32' />
					<div className='h-64 bg-panel rounded' />
				</div>
			</div>
		);
	}

	// Максимальные значения для графика
	const максЗначениеОбщий = Math.max(
		...stats.dailyActivity.map((d) => d.generalMessages),
	);
	const максЗначениеИИ = Math.max(
		...stats.dailyActivity.map((d) => d.aiMessages),
	);
	const максЗначениеВсего = Math.max(максЗначениеОбщий, максЗначениеИИ);

	return (
		<div className='space-y-6'>
			{/* Основные метрики */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-base font-bold'>
							Сообщения за неделю
						</h3>
						<div className='text-2xl'>📈</div>
					</div>
					<div className='text-3xl font-bold text-neon glyph-glow mb-1'>
						{stats.messagesLast7d}
					</div>
					<div className='text-sm text-soft'>
						+{stats.messagesLast24h} за последние 24ч
					</div>
				</div>

				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-base font-bold'>
							Активные пользователи
						</h3>
						<div className='text-2xl'>👥</div>
					</div>
					<div className='text-3xl font-bold text-cyan glyph-glow mb-1'>
						{stats.activeUsers}
					</div>
					<div className='text-sm text-soft'>
						Уникальных пользователей
					</div>
				</div>

				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<div className='flex items-center justify-between mb-2'>
						<h3 className='text-base font-bold'>
							Модерационные действия
						</h3>
						<div className='text-2xl'>⚔️</div>
					</div>
					<div className='text-3xl font-bold text-orange-400 glyph-glow mb-1'>
						{stats.moderationActions}
					</div>
					<div className='text-sm text-soft'>За текущий месяц</div>
				</div>
			</div>

			{/* График активности по дням */}
			<div className='bg-subtle border border-line rounded-lg bevel p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-xl font-bold text-base'>
						📊 Активность по дням
					</h3>
					<div className='flex items-center space-x-4 text-sm'>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-neon rounded' />
							<span>Общий чат</span>
						</div>
						<div className='flex items-center space-x-2'>
							<div className='w-3 h-3 bg-cyan rounded' />
							<span>ИИ чат</span>
						</div>
					</div>
				</div>

				<div className='space-y-4'>
					{stats.dailyActivity.map((day, index) => (
						<div
							key={day.date}
							className='space-y-2'
						>
							<div className='flex items-center justify-between text-sm'>
								<span className='text-base font-mono'>
									{new Date(day.date).toLocaleDateString(
										'ru-RU',
										{
											month: 'short',
											day: 'numeric',
										},
									)}
								</span>
								<div className='flex items-center space-x-4 text-soft'>
									<span>Общий: {day.generalMessages}</span>
									<span>ИИ: {day.aiMessages}</span>
									<span>
										Всего:{' '}
										{day.generalMessages + day.aiMessages}
									</span>
								</div>
							</div>

							{/* Бары графика */}
							<div className='relative h-8 bg-panel rounded overflow-hidden'>
								{/* Бар для общего чата */}
								<div
									className='absolute top-0 left-0 h-full bg-neon/80 rounded transition-all duration-300'
									style={{
										width: `${максЗначениеВсего > 0 ? (day.generalMessages / максЗначениеВсего) * 100 : 0}%`,
									}}
								/>
								{/* Бар для ИИ чата (поверх общего) */}
								<div
									className='absolute top-0 left-0 h-full bg-cyan/80 rounded transition-all duration-300'
									style={{
										width: `${максЗначениеВсего > 0 ? (day.aiMessages / максЗначениеВсего) * 100 : 0}%`,
										transform: `translateX(${максЗначениеВсего > 0 ? (day.generalMessages / максЗначениеВсего) * 100 : 0}%)`,
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Топ активных пользователей */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-bold text-base'>
							🏆 Самые активные пользователи
						</h3>
					</div>

					<div className='space-y-3'>
						{stats.mostActiveUsers.map((user, index) => (
							<div
								key={user.userId}
								className='flex items-center justify-between p-3 bg-panel rounded border border-line'
							>
								<div className='flex items-center space-x-3'>
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
						index === 0 ? 'bg-yellow-500 text-black'
						: index === 1 ? 'bg-gray-400 text-black'
						: index === 2 ? 'bg-yellow-600 text-black'
						: 'bg-subtle text-soft'
					}`}
									>
										{index + 1}
									</div>
									<div>
										<div className='font-medium text-base'>
											{user.userName}
										</div>
										<div className='text-xs text-soft font-mono'>
											ID: {user.userId}
										</div>
									</div>
								</div>
								<div className='text-right'>
									<div className='text-lg font-bold text-neon'>
										{user.messageCount}
									</div>
									<div className='text-xs text-soft'>
										сообщений
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Статистика по типам активности */}
				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<h3 className='text-lg font-bold text-base mb-4'>
						📈 Детальная статистика
					</h3>

					<div className='space-y-4'>
						<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
							<div className='flex items-center space-x-3'>
								<div className='text-xl'>💬</div>
								<span className='font-medium'>
									Всего сообщений
								</span>
							</div>
							<span className='text-xl font-bold text-neon glyph-glow'>
								{stats.totalMessages}
							</span>
						</div>

						<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
							<div className='flex items-center space-x-3'>
								<div className='text-xl'>📊</div>
								<span className='font-medium'>
									Среднее в день
								</span>
							</div>
							<span className='text-xl font-bold text-cyan glyph-glow'>
								{Math.round(stats.messagesLast7d / 7)}
							</span>
						</div>

						<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
							<div className='flex items-center space-x-3'>
								<div className='text-xl'>🎯</div>
								<span className='font-medium'>
									Сообщений на пользователя
								</span>
							</div>
							<span className='text-xl font-bold text-purple-400 glyph-glow'>
								{Math.round(
									stats.totalMessages / stats.activeUsers,
								)}
							</span>
						</div>

						<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
							<div className='flex items-center space-x-3'>
								<div className='text-xl'>⚔️</div>
								<span className='font-medium'>
									Модераций в день
								</span>
							</div>
							<span className='text-xl font-bold text-orange-400 glyph-glow'>
								{Math.round(stats.moderationActions / 30)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
