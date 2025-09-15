'use client';

import React, { useState, useCallback } from 'react';
import type { ContactData } from '../../../app/(dashboard)/contacts/page';

interface ContactDetailProps {
	contact: ContactData;
	onClose: () => void;
	onSendResponse: (contactId: string, responseText: string) => void;
	onStatusUpdate: (contactId: string, status: ContactData['status']) => void;
}

/**
 * Компонент детального просмотра контактного обращения
 * Полная информация, ответ на обращение, изменение статуса
 */
export function ContactDetail({
	contact,
	onClose,
	onSendResponse,
	onStatusUpdate,
}: ContactDetailProps) {
	const [responseText, setResponseText] = useState('');
	const [adminNotes, setAdminNotes] = useState(contact.adminNotes || '');
	const [newStatus, setNewStatus] = useState(contact.status);

	// Обработчик отправки ответа
	const обработчикОтправкиОтвета = useCallback(() => {
		if (responseText.trim()) {
			onSendResponse(contact.id, responseText.trim());
			setResponseText('');
		}
	}, [contact.id, responseText, onSendResponse]);

	// Обработчик обновления статуса
	const обработчикОбновленияСтатуса = useCallback(() => {
		if (newStatus !== contact.status) {
			onStatusUpdate(contact.id, newStatus);
		}
	}, [contact.id, contact.status, newStatus, onStatusUpdate]);

	// Функция получения цвета статуса
	const получитьЦветСтатуса = useCallback((status: ContactData['status']) => {
		switch (status) {
			case 'new':
				return 'yellow-400';
			case 'in_progress':
				return 'cyan';
			case 'completed':
				return 'green-400';
			case 'rejected':
				return 'red-400';
			default:
				return 'soft';
		}
	}, []);

	// Функция получения цвета приоритета
	const получитьЦветПриоритета = useCallback(
		(priority: ContactData['priority']) => {
			switch (priority) {
				case 'low':
					return 'blue-400';
				case 'medium':
					return 'yellow-400';
				case 'high':
					return 'orange-400';
				case 'urgent':
					return 'red-400';
				default:
					return 'soft';
			}
		},
		[],
	);

	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
			<div className='bg-panel border-2 border-neon rounded-lg bevel max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
				{/* Заголовок модального окна */}
				<div className='flex items-center justify-between p-6 border-b border-line'>
					<div className='flex items-center space-x-3'>
						<div className='text-2xl'>📧</div>
						<div>
							<h2 className='text-xl font-bold text-neon glyph-glow'>
								Обращение #{contact.id}
							</h2>
							<p className='text-sm text-soft'>
								Детальный просмотр и управление
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className='p-2 text-soft hover:text-red-400 hover:bg-red-400/20 rounded transition-colors'
						title='Закрыть'
					>
						✕
					</button>
				</div>

				<div className='p-6 space-y-6'>
					{/* Основная информация об обращении */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Информация о пользователе */}
						<div className='bg-subtle border border-line rounded-lg bevel p-4'>
							<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
								<span>👤</span>
								<span>Контактная информация</span>
							</h3>
							<div className='space-y-3'>
								<div>
									<label className='text-sm text-soft'>
										Имя:
									</label>
									<div className='text-base font-medium'>
										{contact.name}
									</div>
								</div>
								<div>
									<label className='text-sm text-soft'>
										Email:
									</label>
									<div className='text-base font-mono'>
										{contact.email}
									</div>
								</div>
								{contact.company && (
									<div>
										<label className='text-sm text-soft'>
											Компания:
										</label>
										<div className='text-base'>
											{contact.company}
										</div>
									</div>
								)}
								<div>
									<label className='text-sm text-soft'>
										Дата обращения:
									</label>
									<div className='text-base font-mono'>
										{contact.createdAt.toLocaleDateString(
											'ru-RU',
										)}{' '}
										{contact.createdAt.toLocaleTimeString(
											'ru-RU',
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Статус и приоритет */}
						<div className='bg-subtle border border-line rounded-lg bevel p-4'>
							<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
								<span>⚙️</span>
								<span>Статус обращения</span>
							</h3>
							<div className='space-y-4'>
								<div>
									<label className='text-sm text-soft mb-2 block'>
										Текущий статус:
									</label>
									<div
										className={`inline-flex items-center space-x-2 px-3 py-2 rounded
                    bg-${получитьЦветСтатуса(contact.status)}/20 
                    border border-${получитьЦветСтатуса(contact.status)}/50
                    text-${получитьЦветСтатуса(contact.status)}`}
									>
										<span>
											{contact.status === 'new' && '🔔'}
											{contact.status === 'in_progress' &&
												'⚙️'}
											{contact.status === 'completed' &&
												'✅'}
											{contact.status === 'rejected' &&
												'❌'}
										</span>
										<span className='font-medium'>
											{contact.status === 'new' &&
												'Новое'}
											{contact.status === 'in_progress' &&
												'В работе'}
											{contact.status === 'completed' &&
												'Завершено'}
											{contact.status === 'rejected' &&
												'Отклонено'}
										</span>
									</div>
								</div>

								<div>
									<label className='text-sm text-soft mb-2 block'>
										Приоритет:
									</label>
									<div
										className={`inline-flex items-center space-x-2 px-3 py-2 rounded
                    bg-${получитьЦветПриоритета(contact.priority)}/20 
                    border border-${получитьЦветПриоритета(contact.priority)}/50
                    text-${получитьЦветПриоритета(contact.priority)}`}
									>
										<span>
											{contact.priority === 'low' && '📌'}
											{contact.priority === 'medium' &&
												'📋'}
											{contact.priority === 'high' &&
												'🔥'}
											{contact.priority === 'urgent' &&
												'🚨'}
										</span>
										<span className='font-medium'>
											{contact.priority?.toUpperCase() ||
												'СРЕДНИЙ'}
										</span>
									</div>
								</div>

								{/* Изменение статуса */}
								<div>
									<label className='text-sm text-soft mb-2 block'>
										Изменить статус:
									</label>
									<div className='flex items-center space-x-2'>
										<select
											value={newStatus}
											onChange={(e) =>
												setNewStatus(
													e.target
														.value as ContactData['status'],
												)
											}
											className='flex-1 px-3 py-2 bg-panel border border-line rounded text-base
                               focus:border-neon transition-colors'
										>
											<option value='new'>
												🔔 Новое
											</option>
											<option value='in_progress'>
												⚙️ В работе
											</option>
											<option value='completed'>
												✅ Завершено
											</option>
											<option value='rejected'>
												❌ Отклонено
											</option>
										</select>
										{newStatus !== contact.status && (
											<button
												onClick={
													обработчикОбновленияСтатуса
												}
												className='px-3 py-2 bg-neon/20 border border-neon text-neon
                                 hover:bg-neon/30 rounded font-medium transition-colors'
											>
												Обновить
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Тема и сообщение */}
					<div className='bg-subtle border border-line rounded-lg bevel p-4'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>💬</span>
							<span>Сообщение</span>
						</h3>
						<div className='space-y-3'>
							<div>
								<label className='text-sm text-soft mb-2 block'>
									Тема:
								</label>
								<div className='text-lg font-medium text-neon'>
									{contact.subject}
								</div>
							</div>
							<div>
								<label className='text-sm text-soft mb-2 block'>
									Текст обращения:
								</label>
								<div className='bg-panel border border-line rounded p-4 text-base leading-relaxed'>
									{contact.message}
								</div>
							</div>
						</div>
					</div>

					{/* Предыдущий ответ (если есть) */}
					{contact.responseText && (
						<div className='bg-green-400/10 border border-green-400/30 rounded-lg bevel p-4'>
							<h3 className='text-lg font-bold text-green-400 mb-4 flex items-center space-x-2'>
								<span>✉️</span>
								<span>Отправленный ответ</span>
							</h3>
							<div className='space-y-3'>
								{contact.respondedAt && (
									<div className='text-sm text-soft'>
										Отправлено:{' '}
										{contact.respondedAt.toLocaleDateString(
											'ru-RU',
										)}{' '}
										{contact.respondedAt.toLocaleTimeString(
											'ru-RU',
										)}
									</div>
								)}
								<div className='bg-panel/50 border border-green-400/20 rounded p-4 text-base leading-relaxed'>
									{contact.responseText}
								</div>
							</div>
						</div>
					)}

					{/* Админские заметки */}
					<div className='bg-subtle border border-line rounded-lg bevel p-4'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>📝</span>
							<span>Заметки администратора</span>
						</h3>
						<textarea
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder='Внутренние заметки (не видны клиенту)...'
							rows={3}
							className='w-full px-4 py-3 bg-panel border border-line rounded text-base
                       focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors
                       resize-vertical'
						/>
					</div>

					{/* Форма ответа */}
					<div className='bg-subtle border border-line rounded-lg bevel p-4'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>✉️</span>
							<span>Ответить на обращение</span>
						</h3>
						<div className='space-y-4'>
							<textarea
								value={responseText}
								onChange={(e) =>
									setResponseText(e.target.value)
								}
								placeholder='Введите ваш ответ клиенту...'
								rows={6}
								className='w-full px-4 py-3 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                         resize-vertical'
							/>
							<div className='flex items-center justify-between'>
								<div className='text-sm text-soft'>
									{responseText.length} символов
								</div>
								<div className='flex items-center space-x-3'>
									<button
										onClick={() => setResponseText('')}
										className='px-4 py-2 text-soft hover:text-red-400 hover:bg-red-400/20 
                             rounded font-medium transition-colors'
										disabled={!responseText.trim()}
									>
										Очистить
									</button>
									<button
										onClick={обработчикОтправкиОтвета}
										disabled={!responseText.trim()}
										className='px-6 py-2 bg-neon/20 border border-neon text-neon
                             hover:bg-neon/30 hover:shadow-neon disabled:opacity-50
                             disabled:cursor-not-allowed rounded font-medium
                             bevel transition-all duration-300'
									>
										📤 Отправить ответ
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Действия */}
					<div className='flex items-center justify-end space-x-3 pt-4 border-t border-line'>
						<button
							onClick={onClose}
							className='px-6 py-2 bg-subtle border border-line text-soft
                       hover:border-soft hover:text-base rounded font-medium
                       transition-colors'
						>
							Закрыть
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
