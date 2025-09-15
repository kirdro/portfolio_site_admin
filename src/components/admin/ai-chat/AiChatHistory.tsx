'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';

interface Диалог {
	id: string;
	пользователь: string;
	email: string;
	avatar: string;
	последнееСообщение: string;
	количествоСообщений: number;
	статус: 'active' | 'completed' | 'blocked';
	времяСоздания: string;
	последняяАктивность: string;
}

interface Сообщение {
	id: string;
	отправитель: 'user' | 'ai';
	содержимое: string;
	времяОтправки: string;
}

/**
 * Компонент для просмотра всех диалогов пользователей с AI
 * Позволяет администратору модерировать и анализировать взаимодействия с AI
 */
export function AiChatHistory() {
	const [выбранныйДиалог, setВыбранныйДиалог] = useState<string | null>(null);
	const [фильтрСтатуса, setФильтрСтатуса] = useState<
		'all' | 'active' | 'completed' | 'blocked'
	>('all');
	const [поискПользователя, setПоискПользователя] = useState('');

	// Получаем реальные диалоги из БД
	const { data: диалогиData, isLoading: загрузкаДиалогов } =
		api.aiChat.getAllDialogs.useQuery({
			status: фильтрСтатуса,
			search: поискПользователя || undefined,
			page: 1,
			limit: 50,
		});

	// Получаем выбранный диалог с сообщениями
	const { data: выбранныйДиалогData, isLoading: загрузкаСообщений } =
		api.aiChat.getDialogById.useQuery(
			{ id: выбранныйДиалог! },
			{ enabled: !!выбранныйДиалог },
		);

	// Мутации для управления диалогами
	const blockUserMutation = api.aiChat.blockUser.useMutation({
		onSuccess: () => {
			alert('Пользователь заблокирован в AI чате');
			// Обновляем данные
		},
		onError: (error) => {
			alert(`Ошибка блокировки: ${error.message}`);
		},
	});

	const exportDialogMutation = api.aiChat.exportDialog.useMutation({
		onSuccess: (результат) => {
			// Создаем и скачиваем файл
			const blob = new Blob([результат.содержимое], {
				type:
					результат.файл.endsWith('.json') ?
						'application/json'
					:	'text/plain',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = результат.файл;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		},
		onError: (error) => {
			alert(`Ошибка экспорта: ${error.message}`);
		},
	});

	// Преобразуем данные из БД к формату интерфейса
	const диалоги: Диалог[] = (диалогиData?.диалоги || []).map((dialog) => ({
		id: dialog.id,
		пользователь: dialog.пользователь.имя,
		email: dialog.пользователь.email,
		avatar: dialog.пользователь.аватар,
		последнееСообщение: dialog.последнееСообщение,
		количествоСообщений: dialog.количествоСообщений,
		статус: dialog.статус,
		времяСоздания: new Date(dialog.времяСоздания).toLocaleString('ru-RU'),
		последняяАктивность: new Date(
			dialog.последняяАктивность,
		).toLocaleString('ru-RU'),
	}));

	// Сообщения выбранного диалога
	const сообщенияДиалога: Record<string, Сообщение[]> =
		выбранныйДиалогData ?
			{
				[выбранныйДиалог!]: выбранныйДиалогData.сообщения.map(
					(msg) => ({
						id: msg.id,
						отправитель: msg.отправитель,
						содержимое: msg.содержимое,
						времяОтправки: new Date(
							msg.времяОтправки,
						).toLocaleTimeString('ru-RU', {
							hour: '2-digit',
							minute: '2-digit',
						}),
					}),
				),
			}
		:	{};

	// Фильтрация диалогов
	const отфильтрованныеДиалоги = диалоги.filter((диалог) => {
		const статусПодходит =
			фильтрСтатуса === 'all' || диалог.статус === фильтрСтатуса;
		const поискПодходит =
			поискПользователя === '' ||
			диалог.пользователь
				.toLowerCase()
				.includes(поискПользователя.toLowerCase()) ||
			диалог.email
				.toLowerCase()
				.includes(поискПользователя.toLowerCase());

		return статусПодходит && поискПодходит;
	});

	// Обработчик выбора диалога
	const обработчикВыбораДиалога = useCallback((id: string) => {
		setВыбранныйДиалог(id);
	}, []);

	// Обработчик блокировки пользователя
	const обработчикБлокировки = useCallback(
		(id: string) => {
			if (confirm('Заблокировать пользователя в AI чате?')) {
				blockUserMutation.mutate({
					пользовательId: id,
					причина:
						'Заблокирован администратором через интерфейс AI чата',
				});
			}
		},
		[blockUserMutation],
	);

	// Обработчик экспорта диалога
	const обработчикЭкспорта = useCallback(
		(id: string, format: 'json' | 'txt' | 'csv') => {
			exportDialogMutation.mutate({
				диалогId: id,
				формат: format,
			});
		},
		[exportDialogMutation],
	);

	// Получение стиля статуса
	const получитьСтильСтатуса = useCallback((статус: string) => {
		switch (статус) {
			case 'active':
				return 'bg-green-400/20 text-green-400 border border-green-400/50';
			case 'completed':
				return 'bg-cyan/20 text-cyan border border-cyan/50';
			case 'blocked':
				return 'bg-red-400/20 text-red-400 border border-red-400/50';
			default:
				return 'bg-soft/20 text-soft border border-soft/50';
		}
	}, []);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			{/* Список диалогов */}
			<div className='lg:col-span-1 space-y-4'>
				{/* Фильтры */}
				<div className='bg-subtle border border-line rounded-lg bevel p-4'>
					<h3 className='font-bold text-base mb-3'>🔍 Фильтры</h3>

					<div className='space-y-3'>
						<div>
							<label className='block text-sm font-medium text-soft mb-1'>
								Поиск пользователя
							</label>
							<input
								type='text'
								value={поискПользователя}
								onChange={(e) =>
									setПоискПользователя(e.target.value)
								}
								placeholder='Имя или email...'
								className='w-full px-3 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-soft mb-1'>
								Статус диалога
							</label>
							<select
								value={фильтрСтатуса}
								onChange={(e) =>
									setФильтрСтатуса(e.target.value as any)
								}
								className='w-full px-3 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon transition-colors'
							>
								<option value='all'>Все диалоги</option>
								<option value='active'>🟢 Активные</option>
								<option value='completed'>
									🔵 Завершенные
								</option>
								<option value='blocked'>
									🔴 Заблокированные
								</option>
							</select>
						</div>
					</div>
				</div>

				{/* Список диалогов */}
				<div className='bg-subtle border border-line rounded-lg bevel overflow-hidden'>
					<div className='p-4 border-b border-line'>
						<div className='flex items-center justify-between'>
							<h3 className='font-bold text-base'>
								📜 История диалогов
							</h3>
							<span className='text-sm text-soft'>
								{отфильтрованныеДиалоги.length} диалогов
							</span>
						</div>
					</div>

					<div className='max-h-96 overflow-y-auto'>
						{загрузкаДиалогов ?
							<div className='p-8 text-center text-soft'>
								<div className='text-4xl mb-2'>⏳</div>
								<div>Загрузка диалогов...</div>
							</div>
						:	отфильтрованныеДиалоги.map((диалог) => (
								<div
									key={диалог.id}
									onClick={() =>
										обработчикВыбораДиалога(диалог.id)
									}
									className={`p-4 border-b border-line cursor-pointer transition-colors
                  hover:bg-panel ${выбранныйДиалог === диалог.id ? 'bg-panel border-l-4 border-l-neon' : ''}`}
								>
									<div className='flex items-start space-x-3'>
										<img
											src={диалог.avatar}
											alt={диалог.пользователь}
											className='w-8 h-8 rounded border border-line'
										/>
										<div className='flex-1 min-w-0'>
											<div className='flex items-center justify-between'>
												<div className='font-medium text-base truncate'>
													{диалог.пользователь}
												</div>
												<span
													className={`px-2 py-1 rounded text-xs font-medium ${получитьСтильСтатуса(диалог.статус)}`}
												>
													{диалог.статус}
												</span>
											</div>
											<div className='text-sm text-soft truncate'>
												{диалог.email}
											</div>
											<div className='text-sm text-soft mt-1 truncate'>
												{диалог.последнееСообщение}
											</div>
											<div className='flex items-center justify-between text-xs text-soft mt-2'>
												<span>
													{диалог.количествоСообщений}{' '}
													сообщений
												</span>
												<span>
													{диалог.последняяАктивность}
												</span>
											</div>
										</div>
									</div>
								</div>
							))
						}

						{отфильтрованныеДиалоги.length === 0 && (
							<div className='p-8 text-center text-soft'>
								<div className='text-4xl mb-2'>🔍</div>
								<div>Диалоги не найдены</div>
								<div className='text-sm mt-1'>
									Измените фильтры поиска
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Детали выбранного диалога */}
			<div className='lg:col-span-2'>
				{выбранныйДиалог ?
					<div className='space-y-4'>
						{/* Информация о диалоге */}
						<div className='bg-subtle border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-3'>
									<img
										src={
											диалоги.find(
												(d) => d.id === выбранныйДиалог,
											)?.avatar
										}
										alt='User'
										className='w-12 h-12 rounded border border-line'
									/>
									<div>
										<div className='font-bold text-base'>
											{
												диалоги.find(
													(d) =>
														d.id ===
														выбранныйДиалог,
												)?.пользователь
											}
										</div>
										<div className='text-sm text-soft'>
											{
												диалоги.find(
													(d) =>
														d.id ===
														выбранныйДиалог,
												)?.email
											}
										</div>
										<div className='text-xs text-soft'>
											Начат:{' '}
											{
												диалоги.find(
													(d) =>
														d.id ===
														выбранныйДиалог,
												)?.времяСоздания
											}
										</div>
									</div>
								</div>

								<div className='flex items-center space-x-2'>
									{/* Кнопки экспорта */}
									<div className='flex items-center space-x-1'>
										<button
											onClick={() =>
												обработчикЭкспорта(
													выбранныйДиалог,
													'json',
												)
											}
											className='px-2 py-1 bg-cyan/20 border border-cyan text-cyan
                               hover:bg-cyan/30 rounded text-xs transition-colors'
											title='Экспорт в JSON'
										>
											JSON
										</button>
										<button
											onClick={() =>
												обработчикЭкспорта(
													выбранныйДиалог,
													'txt',
												)
											}
											className='px-2 py-1 bg-purple-400/20 border border-purple-400 text-purple-400
                               hover:bg-purple-400/30 rounded text-xs transition-colors'
											title='Экспорт в TXT'
										>
											TXT
										</button>
										<button
											onClick={() =>
												обработчикЭкспорта(
													выбранныйДиалог,
													'csv',
												)
											}
											className='px-2 py-1 bg-yellow-400/20 border border-yellow-400 text-yellow-400
                               hover:bg-yellow-400/30 rounded text-xs transition-colors'
											title='Экспорт в CSV'
										>
											CSV
										</button>
									</div>

									<button
										onClick={() =>
											обработчикБлокировки(
												выбранныйДиалог,
											)
										}
										className='px-3 py-1 bg-red-400/20 border border-red-400 text-red-400
                             hover:bg-red-400/30 rounded text-sm font-medium transition-colors'
									>
										🚫 Заблокировать
									</button>
								</div>
							</div>
						</div>

						{/* История сообщений */}
						<div className='bg-subtle border border-line rounded-lg bevel'>
							<div className='p-4 border-b border-line'>
								<h3 className='font-bold text-base'>
									💬 История сообщений
								</h3>
							</div>

							<div className='h-96 overflow-y-auto p-4 space-y-4'>
								{загрузкаСообщений ?
									<div className='text-center text-soft py-8'>
										<div className='text-4xl mb-2'>⏳</div>
										<div>Загрузка сообщений...</div>
									</div>
								:	(сообщенияДиалога[выбранныйДиалог] || []).map(
										(сообщение) => (
											<div
												key={сообщение.id}
												className={`flex ${сообщение.отправитель === 'user' ? 'justify-start' : 'justify-end'}`}
											>
												<div
													className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
														(
															сообщение.отправитель ===
															'user'
														) ?
															'bg-panel border border-line text-base mr-4'
														:	'bg-cyan/20 border border-cyan text-cyan ml-4'
													}`}
												>
													<div className='text-sm'>
														{сообщение.содержимое}
													</div>
													<div className='text-xs opacity-70 mt-1'>
														{
															сообщение.времяОтправки
														}
													</div>
												</div>
											</div>
										),
									)
								}

								{(сообщенияДиалога[выбранныйДиалог] || [])
									.length === 0 && (
									<div className='text-center text-soft py-8'>
										<div className='text-4xl mb-2'>💭</div>
										<div>Сообщения не найдены</div>
									</div>
								)}
							</div>
						</div>
					</div>
				:	<div className='bg-subtle border border-line rounded-lg bevel p-12 text-center'>
						<div className='text-6xl mb-4 opacity-50'>📜</div>
						<h3 className='text-xl font-bold text-base mb-2'>
							Выберите диалог
						</h3>
						<p className='text-soft'>
							Выберите диалог из списка слева для просмотра
							сообщений
						</p>
					</div>
				}
			</div>
		</div>
	);
}
