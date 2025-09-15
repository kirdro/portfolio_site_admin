'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import type { ChatMessageData } from '../../../app/(dashboard)/chat/page';

interface ChatMessagesProps {
	messages: ChatMessageData[];
	type: 'general' | 'ai';
	loading: boolean;
	onMessageSelect: (message: ChatMessageData) => void;
	onDeleteMessage: (messageId: string) => void;
	onBanUser: (userId: string) => void;
}

/**
 * Компонент списка сообщений чата с функциями модерации
 * Переключение между общим и ИИ чатом, пагинация, модерационные действия
 */
export function ChatMessages({
	messages,
	type,
	loading,
	onMessageSelect,
	onDeleteMessage,
	onBanUser,
}: ChatMessagesProps) {
	const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterUser, setFilterUser] = useState('');

	// Обработчик выбора сообщения
	const обработчикВыбораСообщения = useCallback(
		(message: ChatMessageData) => {
			setSelectedMessageId(message.id);
			onMessageSelect(message);
		},
		[onMessageSelect],
	);

	// Обработчик удаления сообщения
	const обработчикУдаленияСообщения = useCallback(
		(messageId: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (confirm('Удалить это сообщение?')) {
				onDeleteMessage(messageId);
			}
		},
		[onDeleteMessage],
	);

	// Обработчик блокировки пользователя
	const обработчикБлокировкиПользователя = useCallback(
		(userId: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (confirm('Заблокировать этого пользователя?')) {
				onBanUser(userId);
			}
		},
		[onBanUser],
	);

	// Фильтрация сообщений
	const отфильтрованныеСообщения = messages.filter((message) => {
		const matchesSearch =
			searchQuery === '' ||
			message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
			message.userName.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesUser =
			filterUser === '' || message.userName === filterUser;

		return matchesSearch && matchesUser;
	});

	// Получить уникальных пользователей для фильтра
	const уникальныеПользователи = Array.from(
		new Set(messages.map((m) => m.userName)),
	).sort();

	// Loading состояние
	if (loading) {
		return (
			<div className='space-y-4'>
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className='animate-pulse'
					>
						<div className='flex items-start space-x-3 p-4 bg-subtle rounded-lg'>
							<div className='w-10 h-10 bg-panel rounded-full' />
							<div className='flex-1 space-y-2'>
								<div className='h-4 bg-panel rounded w-32' />
								<div className='h-3 bg-panel rounded w-full' />
								<div className='h-3 bg-panel rounded w-2/3' />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	// Пустое состояние
	if (messages.length === 0) {
		return (
			<div className='text-center py-12'>
				<div className='text-6xl mb-4'>
					{type === 'general' ? '💬' : '🤖'}
				</div>
				<h3 className='text-xl font-bold text-base mb-2'>
					Сообщений не найдено
				</h3>
				<p className='text-soft'>
					{type === 'general' ?
						'В общем чате пока нет сообщений'
					:	'В ИИ чате пока нет сообщений'}
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Поиск и фильтры */}
			<div className='flex flex-col md:flex-row gap-4 mb-6'>
				<div className='flex-1'>
					<input
						type='text'
						placeholder='Поиск по сообщениям или пользователям...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full px-4 py-2 bg-subtle border border-line rounded-lg text-base
                     focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
					/>
				</div>
				<div className='md:w-48'>
					<select
						value={filterUser}
						onChange={(e) => setFilterUser(e.target.value)}
						className='w-full px-4 py-2 bg-subtle border border-line rounded-lg text-base
                     focus:border-neon transition-colors'
					>
						<option value=''>Все пользователи</option>
						{уникальныеПользователи.map((userName) => (
							<option
								key={userName}
								value={userName}
							>
								{userName}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Заголовок с информацией */}
			<div className='flex items-center justify-between text-sm text-soft mb-4'>
				<div>
					Показано {отфильтрованныеСообщения.length} из{' '}
					{messages.length} сообщений
				</div>
				<div className='flex items-center space-x-2'>
					<div
						className={`w-3 h-3 rounded-full ${type === 'general' ? 'bg-neon' : 'bg-cyan'}`}
					/>
					<span>{type === 'general' ? 'Общий чат' : 'ИИ чат'}</span>
				</div>
			</div>

			{/* Список сообщений */}
			<div className='space-y-3 max-h-[600px] overflow-y-auto'>
				{отфильтрованныеСообщения.map((message) => (
					<div
						key={message.id}
						onClick={() => обработчикВыбораСообщения(message)}
						className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                       ${
							selectedMessageId === message.id ?
								`border-${type === 'general' ? 'neon' : 'cyan'} bg-${type === 'general' ? 'neon' : 'cyan'}/10`
							:	'border-line bg-subtle hover:border-soft hover:bg-panel'
						}`}
					>
						<div className='flex items-start justify-between'>
							{/* Основное содержимое сообщения */}
							<div className='flex items-start space-x-3 flex-1'>
								{/* Аватар пользователя */}
								<div className='relative w-10 h-10 rounded-full overflow-hidden border border-line'>
									{message.userAvatar ?
										<Image
											src={message.userAvatar}
											alt={message.userName}
											fill
											className='object-cover'
											sizes='40px'
										/>
									:	<div className='w-full h-full bg-panel flex items-center justify-center text-soft text-sm'>
											{message.userName
												.charAt(0)
												.toUpperCase()}
										</div>
									}
								</div>

								{/* Содержимое сообщения */}
								<div className='flex-1 min-w-0'>
									<div className='flex items-center space-x-2 mb-1'>
										<span className='font-medium text-base'>
											{message.userName}
										</span>
										<span className='text-xs text-soft font-mono'>
											{message.createdAt.toLocaleString(
												'ru-RU',
											)}
										</span>
										{message.isBlocked && (
											<span
												className='px-2 py-1 bg-red-500/20 border border-red-500 
                                   text-red-400 text-xs rounded font-mono'
											>
												Заблокирован
											</span>
										)}
									</div>
									<div className='text-sm text-soft break-words'>
										{message.content}
									</div>
								</div>
							</div>

							{/* Кнопки модерации */}
							<div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
								<button
									onClick={(e) =>
										обработчикУдаленияСообщения(
											message.id,
											e,
										)
									}
									className='p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors'
									title='Удалить сообщение'
								>
									🗑️
								</button>
								{!message.isBlocked && (
									<button
										onClick={(e) =>
											обработчикБлокировкиПользователя(
												message.userId,
												e,
											)
										}
										className='p-2 text-orange-400 hover:bg-orange-400/20 rounded transition-colors'
										title='Заблокировать пользователя'
									>
										🚫
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Пагинация (заглушка) */}
			{отфильтрованныеСообщения.length > 10 && (
				<div className='flex justify-center mt-6'>
					<div className='flex items-center space-x-2'>
						<button
							className='px-3 py-1 bg-subtle border border-line rounded text-sm
                             hover:border-neon transition-colors'
						>
							← Предыдущие
						</button>
						<span className='text-sm text-soft px-3'>
							Страница 1 из 3
						</span>
						<button
							className='px-3 py-1 bg-subtle border border-line rounded text-sm
                             hover:border-neon transition-colors'
						>
							Следующие →
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
