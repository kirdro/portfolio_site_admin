'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { ChatMessages } from '../../../components/admin/chat/ChatMessages';
import { ChatStats } from '../../../components/admin/chat/ChatStats';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import {
	FaComments,
	FaChartLine,
	FaUsers,
	FaShieldAlt,
	FaRobot,
} from 'react-icons/fa';

// Типы данных для сообщений
export interface ChatMessageData {
	id: string;
	content: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	type: 'general' | 'ai';
	createdAt: Date;
	updatedAt: Date;
	isBlocked?: boolean;
}

// Типы данных для статистики
export interface ChatStatsData {
	totalMessages: number;
	messagesLast24h: number;
	messagesLast7d: number;
	activeUsers: number;
	mostActiveUsers: Array<{
		userId: string;
		userName: string;
		messageCount: number;
	}>;
	dailyActivity: Array<{
		date: string;
		generalMessages: number;
		aiMessages: number;
	}>;
	moderationActions: number;
}

/**
 * Страница модерации чатов портфолио
 * Переключение между общим и ИИ чатом, статистика, модерационные действия
 */
export default function ChatPage() {
	// Состояние активной вкладки чата
	const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'stats'>(
		'general',
	);
	const [selectedMessage, setSelectedMessage] =
		useState<ChatMessageData | null>(null);

	// Получаем реальные данные из БД
	const { data: chatStats, isLoading: loadingStats } =
		api.chat.getStats.useQuery();
	const { data: generalMessages, isLoading: loadingGeneral } =
		api.chat.getMessages.useQuery({
			limit: 50,
			type: 'general',
		});
	const { data: aiMessages, isLoading: loadingAi } =
		api.chat.getMessages.useQuery({
			limit: 50,
			type: 'ai',
		});

	// Обработанные данные для совместимости с интерфейсом
	const mockStats: ChatStatsData =
		chatStats ?
			{
				totalMessages: chatStats.totalMessages,
				messagesLast24h: chatStats.messagesLast24h,
				messagesLast7d: chatStats.messagesLast7d,
				activeUsers: chatStats.activeUsers,
				mostActiveUsers: chatStats.mostActiveUsers || [],
				dailyActivity: (chatStats.dailyActivity || []).map(
					(day: any) => ({
						date:
							day.date || new Date().toISOString().split('T')[0],
						generalMessages: day.generalMessages || 0,
						aiMessages: day.aiMessages || 0,
					}),
				),
				moderationActions: chatStats.moderationActions || 0,
			}
		:	{
				totalMessages: 0,
				messagesLast24h: 0,
				messagesLast7d: 0,
				activeUsers: 0,
				mostActiveUsers: [],
				dailyActivity: [],
				moderationActions: 0,
			};

	// Преобразование данных из БД к формату интерфейса
	const mockGeneralMessages: ChatMessageData[] = (
		generalMessages?.messages || []
	).map((msg: any) => ({
		id: msg.id,
		content: msg.content,
		userId: msg.userId,
		userName: msg.userName || 'Неизвестный пользователь',
		userAvatar:
			msg.userAvatar || `https://i.pravatar.cc/40?u=${msg.userId}`,
		type: 'general' as const,
		createdAt: msg.createdAt,
		updatedAt: msg.updatedAt,
		isBlocked: msg.isBlocked || false,
	}));

	const mockAiMessages: ChatMessageData[] = (aiMessages?.messages || []).map(
		(msg: any) => ({
			id: msg.id,
			content: msg.content,
			userId: msg.userId,
			userName: msg.userName || 'Неизвестный пользователь',
			userAvatar:
				msg.userAvatar || `https://i.pravatar.cc/40?u=${msg.userId}`,
			type: 'ai' as const,
			createdAt: msg.createdAt,
			updatedAt: msg.updatedAt,
			isBlocked: msg.isBlocked || false,
		}),
	);

	// Обработчик переключения вкладок
	const обработчикПереключенияВкладки = useCallback(
		(tab: 'general' | 'ai' | 'stats') => {
			setActiveTab(tab);
			setSelectedMessage(null);
		},
		[],
	);

	// Обработчик выбора сообщения
	const обработчикВыбораСообщения = useCallback(
		(message: ChatMessageData) => {
			setSelectedMessage(message);
		},
		[],
	);

	// Обработчик удаления сообщения
	const обработчикУдаленияСообщения = useCallback((messageId: string) => {
		// В реальном приложении здесь будет вызов tRPC мутации
		console.log('Удаление сообщения:', messageId);
		setSelectedMessage(null);
	}, []);

	// Обработчик блокировки пользователя
	const обработчикБлокировкиПользователя = useCallback((userId: string) => {
		// В реальном приложении здесь будет вызов tRPC мутации
		console.log('Блокировка пользователя:', userId);
	}, []);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon
							Icon={FaComments}
							size={24}
							variant='intense'
						/>
						Модерация чатов
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление сообщениями общего и ИИ чата
					</p>
				</div>
			</div>

			{/* Быстрая статистика */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<div className='bg-panel border border-line rounded-lg bevel p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-neon glyph-glow'>
								{loadingStats ? '...' : mockStats.totalMessages}
							</div>
							<div className='text-sm text-soft'>
								Всего сообщений
							</div>
						</div>
						<NeonIcon
							Icon={FaComments}
							size={32}
							variant='intense'
							className='stats-icon'
						/>
					</div>
				</div>

				<div className='bg-panel border border-line rounded-lg bevel p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-cyan glyph-glow'>
								{loadingStats ?
									'...'
								:	mockStats.messagesLast24h}
							</div>
							<div className='text-sm text-soft'>
								За последние 24ч
							</div>
						</div>
						<NeonIcon
							Icon={FaChartLine}
							size={32}
							variant='cyan'
							className='stats-icon'
						/>
					</div>
				</div>

				<div className='bg-panel border border-line rounded-lg bevel p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-purple-400 glyph-glow'>
								{loadingStats ? '...' : mockStats.activeUsers}
							</div>
							<div className='text-sm text-soft'>
								Активные пользователи
							</div>
						</div>
						<NeonIcon
							Icon={FaUsers}
							size={32}
							variant='purple'
							className='stats-icon'
						/>
					</div>
				</div>

				<div className='bg-panel border border-line rounded-lg bevel p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<div className='text-2xl font-bold text-orange-400 glyph-glow'>
								{loadingStats ?
									'...'
								:	mockStats.moderationActions}
							</div>
							<div className='text-sm text-soft'>
								Модерационных действий
							</div>
						</div>
						<NeonIcon
							Icon={FaShieldAlt}
							size={32}
							variant='orange'
							className='stats-icon'
						/>
					</div>
				</div>
			</div>

			{/* Вкладки переключения */}
			<div className='bg-panel border border-line rounded-lg bevel'>
				<div className='flex border-b border-line'>
					<button
						onClick={() => обработчикПереключенияВкладки('general')}
						className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${
								activeTab === 'general' ?
									'text-neon border-neon bg-neon/10'
								:	'text-soft hover:text-base hover:bg-subtle/50'
							}`}
					>
						<NeonIcon
							Icon={FaComments}
							size={16}
							variant='default'
						/>
						Общий чат ({mockGeneralMessages.length})
					</button>
					<button
						onClick={() => обработчикПереключенияВкладки('ai')}
						className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${
								activeTab === 'ai' ?
									'text-cyan border-cyan bg-cyan/10'
								:	'text-soft hover:text-base hover:bg-subtle/50'
							}`}
					>
						<NeonIcon
							Icon={FaRobot}
							size={16}
							variant='cyan'
						/>
						ИИ чат ({mockAiMessages.length})
					</button>
					<button
						onClick={() => обработчикПереключенияВкладки('stats')}
						className={`px-6 py-3 font-medium transition-colors border-b-2 border-transparent
                         ${
								activeTab === 'stats' ?
									'text-yellow-400 border-yellow-400 bg-yellow-400/10'
								:	'text-soft hover:text-base hover:bg-subtle/50'
							}`}
					>
						📊 Статистика
					</button>
				</div>

				<div className='p-6'>
					{activeTab === 'general' && (
						<ChatMessages
							messages={mockGeneralMessages}
							type='general'
							loading={loadingGeneral}
							onMessageSelect={обработчикВыбораСообщения}
							onDeleteMessage={обработчикУдаленияСообщения}
							onBanUser={обработчикБлокировкиПользователя}
						/>
					)}

					{activeTab === 'ai' && (
						<ChatMessages
							messages={mockAiMessages}
							type='ai'
							loading={loadingAi}
							onMessageSelect={обработчикВыбораСообщения}
							onDeleteMessage={обработчикУдаленияСообщения}
							onBanUser={обработчикБлокировкиПользователя}
						/>
					)}

					{activeTab === 'stats' && (
						<ChatStats
							stats={mockStats}
							loading={loadingStats}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
