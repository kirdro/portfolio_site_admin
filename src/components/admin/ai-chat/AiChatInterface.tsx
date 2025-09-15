'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';

interface Message {
	id: string;
	sender: 'admin' | 'ai';
	content: string;
	timestamp: string;
}

/**
 * Компонент интерфейса для общения с AI от имени администратора
 * Позволяет тестировать AI модель и отправлять сообщения
 */
export function AiChatInterface() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			sender: 'ai',
			content:
				'Привет! Я AI-ассистент портфолио сайта Kirdro. Готов помочь с любыми вопросами о разработке, проектах или технологиях.',
			timestamp: '14:30',
		},
	]);

	const [messageText, setMessageText] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [selectedModel, setSelectedModel] = useState(
		'llama-3.3-70b-versatile',
	);
	const [provider, setProvider] = useState('groq');

	// tRPC мутация для тестирования настроек AI
	const testSettingsMutation = api.aiChat.testSettings.useMutation({
		onSuccess: (result) => {
			const aiResponse: Message = {
				id: Date.now().toString(),
				sender: 'ai',
				content: result.ответAI,
				timestamp: new Date().toLocaleTimeString('ru-RU', {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};
			setMessages((prev) => [...prev, aiResponse]);
			setIsSending(false);
		},
		onError: (error) => {
			const aiResponse: Message = {
				id: Date.now().toString(),
				sender: 'ai',
				content: `Ошибка: ${error.message}`,
				timestamp: new Date().toLocaleTimeString('ru-RU', {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};
			setMessages((prev) => [...prev, aiResponse]);
			setIsSending(false);
		},
	});

	// Обработчик отправки сообщения
	const handleSendMessage = useCallback(async () => {
		if (!messageText.trim() || isSending) return;

		const newMessage: Message = {
			id: Date.now().toString(),
			sender: 'admin',
			content: messageText.trim(),
			timestamp: new Date().toLocaleTimeString('ru-RU', {
				hour: '2-digit',
				minute: '2-digit',
			}),
		};

		setMessages((prev) => [...prev, newMessage]);
		setMessageText('');
		setIsSending(true);

		// Реальный вызов tRPC для тестирования AI
		const model =
			(
				selectedModel.includes('llama') ||
				selectedModel.includes('gemma') ||
				selectedModel.includes('deepseek')
			) ?
				(selectedModel as
					| 'llama3-8b-8192'
					| 'llama3-70b-8192'
					| 'mixtral-8x7b-32768')
			:	'llama3-8b-8192';

		testSettingsMutation.mutate({
			тестовоеСообщение: messageText.trim(),
			модель: model,
		});
	}, [messageText, isSending, selectedModel, testSettingsMutation]);

	// Обработчик Enter в поле ввода
	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSendMessage();
			}
		},
		[handleSendMessage],
	);

	// Обработчик очистки чата
	const handleClearChat = useCallback(() => {
		if (confirm('Очистить историю чата?')) {
			setMessages([]);
		}
	}, []);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			{/* Основной интерфейс чата */}
			<div className='lg:col-span-2 space-y-4'>
				<div className='bg-subtle border border-line rounded-lg bevel overflow-hidden'>
					{/* Заголовок чата */}
					<div className='bg-panel border-b border-line p-4 flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<div className='w-8 h-8 bg-neon/20 rounded border border-neon flex items-center justify-center'>
								<span className='text-neon text-sm'>🤖</span>
							</div>
							<div>
								<div className='font-medium text-base'>
									AI Ассистент Kirdro
								</div>
								<div className='text-xs text-soft'>
									<span className='w-2 h-2 bg-green-400 rounded-full inline-block mr-1'></span>
									Онлайн • {provider.toUpperCase()} •{' '}
									{selectedModel.split('/').pop()}
								</div>
							</div>
						</div>
						<button
							onClick={handleClearChat}
							className='px-3 py-1 bg-red-400/20 border border-red-400 text-red-400 
                       hover:bg-red-400/30 rounded text-sm transition-colors'
						>
							🗑️ Очистить
						</button>
					</div>

					{/* История сообщений */}
					<div className='h-96 overflow-y-auto p-4 space-y-4'>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
										message.sender === 'admin' ?
											'bg-neon/20 border border-neon text-neon ml-4'
										:	'bg-cyan/20 border border-cyan text-cyan mr-4'
									}`}
								>
									<div className='text-sm'>
										{message.content}
									</div>
									<div className='text-xs opacity-70 mt-1'>
										{message.timestamp}
									</div>
								</div>
							</div>
						))}

						{isSending && (
							<div className='flex justify-start'>
								<div className='max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-cyan/20 border border-cyan text-cyan mr-4'>
									<div className='flex items-center space-x-2'>
										<div className='flex space-x-1'>
											<div className='w-2 h-2 bg-cyan rounded-full animate-pulse'></div>
											<div className='w-2 h-2 bg-cyan rounded-full animate-pulse delay-75'></div>
											<div className='w-2 h-2 bg-cyan rounded-full animate-pulse delay-150'></div>
										</div>
										<span className='text-xs'>
											AI печатает...
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Поле ввода */}
					<div className='border-t border-line p-4'>
						<div className='flex space-x-3'>
							<textarea
								value={messageText}
								onChange={(e) => setMessageText(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder='Введите сообщение для AI (Enter - отправить, Shift+Enter - новая строка)...'
								className='flex-1 px-4 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                         resize-none'
								rows={2}
							/>
							<button
								onClick={handleSendMessage}
								disabled={!messageText.trim() || isSending}
								className='px-4 py-2 bg-neon/20 border border-neon text-neon
                         hover:bg-neon/30 disabled:opacity-50 disabled:cursor-not-allowed
                         rounded font-medium transition-colors'
							>
								{isSending ? '⏳' : '📤'} Отправить
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Панель управления */}
			<div className='space-y-4'>
				{/* Выбор модели */}
				<div className='bg-subtle border border-line rounded-lg bevel p-4'>
					<h3 className='font-bold text-base mb-3 flex items-center space-x-2'>
						<span>🤖</span>
						<span>Выбор модели</span>
					</h3>

					<div className='space-y-3'>
						<div>
							<label className='block text-xs font-medium text-soft mb-1'>
								Провайдер
							</label>
							<select
								value={provider}
								onChange={(e) => {
									setProvider(e.target.value);
									// Автоматически выбираем первую модель провайдера
									if (e.target.value === 'groq') {
										setSelectedModel(
											'llama-3.3-70b-versatile',
										);
									} else {
										setSelectedModel('gpt-4-turbo');
									}
								}}
								className='w-full px-3 py-2 bg-panel border border-line rounded text-sm
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
							>
								<option value='groq'>Groq</option>
								<option value='openai'>OpenAI</option>
							</select>
						</div>

						<div>
							<label className='block text-xs font-medium text-soft mb-1'>
								Модель AI
							</label>
							<select
								value={selectedModel}
								onChange={(e) =>
									setSelectedModel(e.target.value)
								}
								className='w-full px-3 py-2 bg-panel border border-line rounded text-sm
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
							>
								{provider === 'groq' ?
									<>
										<optgroup label='Рекомендуемые'>
											<option value='llama-3.3-70b-versatile'>
												Llama 3.3 70B
											</option>
											<option value='deepseek-r1-distill-llama-70b'>
												DeepSeek R1 70B
											</option>
											<option value='openai/gpt-oss-120b'>
												GPT OSS 120B
											</option>
										</optgroup>
										<optgroup label='Быстрые'>
											<option value='llama-3.1-8b-instant'>
												Llama 3.1 8B
											</option>
											<option value='gemma2-9b-it'>
												Gemma2 9B
											</option>
											<option value='groq/compound-mini'>
												Compound Mini
											</option>
										</optgroup>
									</>
								:	<>
										<option value='gpt-3.5-turbo'>
											GPT-3.5 Turbo
										</option>
										<option value='gpt-4'>GPT-4</option>
										<option value='gpt-4-turbo'>
											GPT-4 Turbo
										</option>
									</>
								}
							</select>
						</div>
					</div>
				</div>

				{/* Быстрые команды */}
				<div className='bg-subtle border border-line rounded-lg bevel p-4'>
					<h3 className='font-bold text-base mb-3 flex items-center space-x-2'>
						<span>⚡</span>
						<span>Быстрые команды</span>
					</h3>

					<div className='space-y-2'>
						<button
							onClick={() =>
								setMessageText(
									'Расскажи о последних проектах Кирилла',
								)
							}
							className='w-full p-2 bg-panel border border-line hover:border-cyan 
                       hover:bg-cyan/10 rounded text-left text-sm transition-colors'
						>
							📁 О проектах
						</button>
						<button
							onClick={() =>
								setMessageText(
									'Какие навыки есть у разработчика?',
								)
							}
							className='w-full p-2 bg-panel border border-line hover:border-purple-400 
                       hover:bg-purple-400/10 rounded text-left text-sm transition-colors'
						>
							⚡ Навыки разработчика
						</button>
						<button
							onClick={() =>
								setMessageText(
									'Как связаться с Кириллом для сотрудничества?',
								)
							}
							className='w-full p-2 bg-panel border border-line hover:border-green-400 
                       hover:bg-green-400/10 rounded text-left text-sm transition-colors'
						>
							📮 Контактная информация
						</button>
						<button
							onClick={() =>
								setMessageText(
									'Протестируй свою работоспособность',
								)
							}
							className='w-full p-2 bg-panel border border-line hover:border-yellow-400 
                       hover:bg-yellow-400/10 rounded text-left text-sm transition-colors'
						>
							🧪 Тест AI
						</button>
					</div>
				</div>

				{/* Статистика сессии */}
				<div className='bg-subtle border border-line rounded-lg bevel p-4'>
					<h3 className='font-bold text-base mb-3 flex items-center space-x-2'>
						<span>📊</span>
						<span>Статистика сессии</span>
					</h3>

					<div className='space-y-2 text-sm'>
						<div className='flex justify-between'>
							<span className='text-soft'>
								Сообщений отправлено:
							</span>
							<span className='text-neon font-mono'>
								{
									messages.filter((m) => m.sender === 'admin')
										.length
								}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-soft'>Ответов получено:</span>
							<span className='text-cyan font-mono'>
								{
									messages.filter((m) => m.sender === 'ai')
										.length
								}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-soft'>Время сессии:</span>
							<span className='text-purple-400 font-mono'>
								15:42
							</span>
						</div>
					</div>
				</div>

				{/* Системная информация */}
				<div className='bg-subtle border border-line rounded-lg bevel p-4'>
					<h3 className='font-bold text-base mb-3 flex items-center space-x-2'>
						<span>ℹ️</span>
						<span>Системная информация</span>
					</h3>

					<div className='space-y-2 text-sm'>
						<div className='flex justify-between'>
							<span className='text-soft'>Модель AI:</span>
							<span className='text-base text-xs'>
								{selectedModel.split('/').pop()}
							</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-soft'>Температура:</span>
							<span className='text-base'>0.7</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-soft'>Макс. токенов:</span>
							<span className='text-base'>2048</span>
						</div>
						<div className='flex justify-between'>
							<span className='text-soft'>Статус API:</span>
							<span className='text-green-400'>🟢 Активен</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
