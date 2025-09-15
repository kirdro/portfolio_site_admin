'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../../../utils/api';

interface НастройкиAI {
	provider: 'openai' | 'groq';
	model: string;
	apiKey: string;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	messageLimit: number;
	moderationEnabled: boolean;
	autoRespond: boolean;
	responseDelay: number;
}

/**
 * Компонент настроек AI модели
 * Управление параметрами ИИ, модерацией и системными промптами
 */
export function AiChatSettings() {
	const [настройки, setНастройки] = useState<НастройкиAI>({
		provider: 'groq',
		model: 'llama3-8b-8192',
		apiKey: '',
		temperature: 0.7,
		maxTokens: 2048,
		systemPrompt: '',
		messageLimit: 50,
		moderationEnabled: true,
		autoRespond: true,
		responseDelay: 1.5,
	});

	const [сохранение, setСохранение] = useState(false);
	const [активнаяВкладка, setАктивнаяВкладка] = useState<
		'model' | 'prompts' | 'moderation' | 'limits'
	>('model');

	// Загружаем настройки из БД
	const { data: настройкиData, isLoading: загрузкаНастроек } =
		api.aiChat.getSettings.useQuery();

	// Мутации для управления настройками
	const updateSettingsMutation = api.aiChat.updateSettings.useMutation({
		onSuccess: (result) => {
			alert(result.сообщение);
			setСохранение(false);
		},
		onError: (error) => {
			alert(`Ошибка сохранения: ${error.message}`);
			setСохранение(false);
		},
	});

	const testSettingsMutation = api.aiChat.testSettings.useMutation({
		onSuccess: (результат) => {
			alert(
				`Тест AI прошел успешно!\n\nОтвет: ${результат.ответAI.slice(0, 100)}...\nВремя: ${результат.времяОтвета}с\nТокены: ${результат.токеныИспользовано}`,
			);
		},
		onError: (error) => {
			alert(`Ошибка тестирования: ${error.message}`);
		},
	});

	// Обновляем локальные настройки при загрузке данных с сервера
	useEffect(() => {
		if (настройкиData) {
			setНастройки({
				provider: 'groq', // Пока только Groq поддерживается
				model: настройкиData.model,
				apiKey: '', // API ключ не возвращается с сервера для безопасности
				temperature: настройкиData.temperature,
				maxTokens: настройкиData.maxTokens,
				systemPrompt: настройкиData.systemPrompt,
				messageLimit: настройкиData.messageLimit,
				moderationEnabled: настройкиData.moderationEnabled,
				autoRespond: настройкиData.autoRespond,
				responseDelay: настройкиData.responseDelay,
			});
		}
	}, [настройкиData]);

	// Обработчик изменения настроек
	const обработчикИзменения = useCallback(
		<K extends keyof НастройкиAI>(поле: K, значение: НастройкиAI[K]) => {
			setНастройки((prev) => ({
				...prev,
				[поле]: значение,
			}));
		},
		[],
	);

	// Обработчик сохранения настроек
	const обработчикСохранения = useCallback(async () => {
		setСохранение(true);

		updateSettingsMutation.mutate({
			model: настройки.model as
				| 'llama3-8b-8192'
				| 'llama3-70b-8192'
				| 'mixtral-8x7b-32768',
			temperature: настройки.temperature,
			maxTokens: настройки.maxTokens,
			systemPrompt: настройки.systemPrompt,
			messageLimit: настройки.messageLimit,
			moderationEnabled: настройки.moderationEnabled,
			autoRespond: настройки.autoRespond,
			responseDelay: настройки.responseDelay,
		});
	}, [настройки, updateSettingsMutation]);

	// Обработчик сброса настроек
	const обработчикСброса = useCallback(() => {
		if (confirm('Сбросить все настройки AI к значениям по умолчанию?')) {
			if (настройкиData) {
				// Возвращаем к серверным значениям по умолчанию
				setНастройки({
					provider: 'groq',
					model: настройкиData.model,
					apiKey: '',
					temperature: 0.7,
					maxTokens: 2048,
					systemPrompt: настройкиData.systemPrompt,
					messageLimit: 50,
					moderationEnabled: true,
					autoRespond: true,
					responseDelay: 1.5,
				});
			}
		}
	}, [настройкиData]);

	// Обработчик тестирования настроек
	const обработчикТестирования = useCallback(() => {
		testSettingsMutation.mutate({
			тестовоеСообщение: 'Привет! Расскажи кратко о проектах Кирилла.',
			модель: настройки.model as
				| 'llama3-8b-8192'
				| 'llama3-70b-8192'
				| 'mixtral-8x7b-32768',
		});
	}, [настройки.model, testSettingsMutation]);

	// Если данные загружаются, показываем индикатор загрузки
	if (загрузкаНастроек) {
		return (
			<div className='space-y-6'>
				<div className='bg-subtle border border-line rounded-lg bevel p-12 text-center'>
					<div className='text-6xl mb-4 opacity-50'>⏳</div>
					<h3 className='text-xl font-bold text-base mb-2'>
						Загрузка настроек AI
					</h3>
					<p className='text-soft'>
						Получение текущих настроек с сервера...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Навигация по настройкам */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-2 bg-subtle rounded-lg p-1 border border-line bevel'>
				<button
					onClick={() => setАктивнаяВкладка('model')}
					className={`px-3 py-2 rounded font-medium transition-colors text-sm ${
						активнаяВкладка === 'model' ?
							'bg-neon/20 text-neon border border-neon'
						:	'text-soft hover:bg-panel'
					}`}
				>
					🤖 Модель
				</button>
				<button
					onClick={() => setАктивнаяВкладка('prompts')}
					className={`px-3 py-2 rounded font-medium transition-colors text-sm ${
						активнаяВкладка === 'prompts' ?
							'bg-cyan/20 text-cyan border border-cyan'
						:	'text-soft hover:bg-panel'
					}`}
				>
					📝 Промпты
				</button>
				<button
					onClick={() => setАктивнаяВкладка('moderation')}
					className={`px-3 py-2 rounded font-medium transition-colors text-sm ${
						активнаяВкладка === 'moderation' ?
							'bg-purple-400/20 text-purple-400 border border-purple-400'
						:	'text-soft hover:bg-panel'
					}`}
				>
					🛡️ Модерация
				</button>
				<button
					onClick={() => setАктивнаяВкладка('limits')}
					className={`px-3 py-2 rounded font-medium transition-colors text-sm ${
						активнаяВкладка === 'limits' ?
							'bg-yellow-400/20 text-yellow-400 border border-yellow-400'
						:	'text-soft hover:bg-panel'
					}`}
				>
					📊 Лимиты
				</button>
			</div>

			{/* Настройки модели */}
			{активнаяВкладка === 'model' && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<div className='bg-subtle border border-line rounded-lg bevel p-6'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>🤖</span>
							<span>Настройки модели AI</span>
						</h3>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									Провайдер AI
								</label>
								<select
									value={настройки.provider}
									onChange={(e) => {
										const provider = e.target.value as
											| 'openai'
											| 'groq';
										обработчикИзменения(
											'provider',
											provider,
										);
										// Автоматически меняем модель при смене провайдера
										if (provider === 'groq') {
											обработчикИзменения(
												'model',
												'llama-3.3-70b-versatile',
											);
											обработчикИзменения(
												'apiKey',
												process.env.GROQ_API_KEY || '',
											);
										} else {
											обработчикИзменения(
												'model',
												'gpt-4-turbo',
											);
											обработчикИзменения('apiKey', '');
										}
									}}
									className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
								>
									<option value='groq'>
										Groq (Рекомендуется)
									</option>
									<option value='openai'>OpenAI</option>
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									Модель AI
								</label>
								<select
									value={настройки.model}
									onChange={(e) =>
										обработчикИзменения(
											'model',
											e.target.value,
										)
									}
									className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
								>
									{настройки.provider === 'groq' ?
										<>
											<optgroup label='🔥 Рекомендуемые'>
												<option value='llama-3.3-70b-versatile'>
													Llama 3.3 70B Versatile
													(Универсальный)
												</option>
												<option value='deepseek-r1-distill-llama-70b'>
													DeepSeek R1 Distill 70B
													(Логическое мышление)
												</option>
												<option value='openai/gpt-oss-120b'>
													GPT OSS 120B (Самый мощный)
												</option>
												<option value='groq/compound'>
													Groq Compound
													(Мульти-модель)
												</option>
											</optgroup>

											<optgroup label='⚡ Быстрые'>
												<option value='llama-3.1-8b-instant'>
													Llama 3.1 8B Instant
												</option>
												<option value='gemma2-9b-it'>
													Gemma2 9B IT
												</option>
												<option value='openai/gpt-oss-20b'>
													GPT OSS 20B
												</option>
												<option value='groq/compound-mini'>
													Groq Compound Mini
												</option>
											</optgroup>

											<optgroup label='🌏 Специализированные'>
												<option value='moonshotai/kimi-k2-instruct'>
													Kimi K2
													(Китайский/Английский)
												</option>
												<option value='moonshotai/kimi-k2-instruct-0905'>
													Kimi K2 0905 (Обновленный)
												</option>
												<option value='qwen/qwen3-32b'>
													Qwen3 32B (Alibaba)
												</option>
												<option value='allam-2-7b'>
													Allam 2 7B (Арабский)
												</option>
											</optgroup>

											<optgroup label='🚀 Экспериментальные'>
												<option value='meta-llama/llama-4-maverick-17b-128e-instruct'>
													Llama 4 Maverick 17B
												</option>
												<option value='meta-llama/llama-4-scout-17b-16e-instruct'>
													Llama 4 Scout 17B
												</option>
											</optgroup>

											<optgroup label='🛡️ Модерация'>
												<option value='meta-llama/llama-guard-4-12b'>
													Llama Guard 4 12B
												</option>
												<option value='meta-llama/llama-prompt-guard-2-86m'>
													Prompt Guard 86M
												</option>
												<option value='meta-llama/llama-prompt-guard-2-22m'>
													Prompt Guard 22M
												</option>
											</optgroup>

											<optgroup label='🎙️ Аудио'>
												<option value='whisper-large-v3'>
													Whisper Large v3
													(Транскрипция)
												</option>
												<option value='whisper-large-v3-turbo'>
													Whisper Large v3 Turbo
												</option>
												<option value='playai-tts'>
													PlayAI TTS (Синтез речи)
												</option>
												<option value='playai-tts-arabic'>
													PlayAI TTS Arabic
												</option>
											</optgroup>
										</>
									:	<>
											<option value='gpt-3.5-turbo'>
												GPT-3.5 Turbo (Быстрый)
											</option>
											<option value='gpt-4'>
												GPT-4 (Точный)
											</option>
											<option value='gpt-4-turbo'>
												GPT-4 Turbo (Рекомендуется)
											</option>
										</>
									}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									API Ключ
								</label>
								<input
									type='password'
									value={настройки.apiKey}
									onChange={(e) =>
										обработчикИзменения(
											'apiKey',
											e.target.value,
										)
									}
									className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors font-mono text-sm'
									placeholder={
										настройки.provider === 'groq' ?
											'gsk_...'
										:	'sk-...'
									}
								/>
								<div className='text-xs text-soft mt-1'>
									{настройки.provider === 'groq' ?
										<a
											href='https://console.groq.com'
											target='_blank'
											rel='noopener noreferrer'
											className='text-cyan hover:text-neon transition-colors'
										>
											Получить ключ на console.groq.com →
										</a>
									:	<a
											href='https://platform.openai.com'
											target='_blank'
											rel='noopener noreferrer'
											className='text-cyan hover:text-neon transition-colors'
										>
											Получить ключ на platform.openai.com
											→
										</a>
									}
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									Температура: {настройки.temperature}
								</label>
								<input
									type='range'
									min='0'
									max='2'
									step='0.1'
									value={настройки.temperature}
									onChange={(e) =>
										обработчикИзменения(
											'temperature',
											parseFloat(e.target.value),
										)
									}
									className='w-full'
								/>
								<div className='flex justify-between text-xs text-soft mt-1'>
									<span>0.0 (Точный)</span>
									<span>2.0 (Креативный)</span>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									Максимальные токены
								</label>
								<input
									type='number'
									min='100'
									max='4096'
									step='100'
									value={настройки.maxTokens}
									onChange={(e) =>
										обработчикИзменения(
											'maxTokens',
											parseInt(e.target.value),
										)
									}
									className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
								/>
								<div className='text-xs text-soft mt-1'>
									Больше токенов = более развернутые ответы
								</div>
							</div>
						</div>
					</div>

					<div className='bg-subtle border border-line rounded-lg bevel p-6'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>📈</span>
							<span>Статистика использования</span>
						</h3>

						<div className='space-y-3'>
							<div className='flex justify-between p-3 bg-panel rounded border border-line'>
								<span className='text-soft'>
									Текущий провайдер:
								</span>
								<span className='font-mono text-neon uppercase'>
									{настройки.provider}
								</span>
							</div>
							<div className='flex justify-between p-3 bg-panel rounded border border-line'>
								<span className='text-soft'>Статус API:</span>
								<span
									className={`font-mono ${настройкиData?.статусAPI?.доступен ? 'text-green-400' : 'text-red-400'}`}
								>
									{настройкиData?.статусAPI?.доступен ?
										'🟢 Доступен'
									:	'🔴 Недоступен'}
								</span>
							</div>
							<div className='flex justify-between p-3 bg-panel rounded border border-line'>
								<span className='text-soft'>Задержка API:</span>
								<span className='font-mono text-cyan'>
									{настройкиData?.статусAPI?.задержка || 0}ms
								</span>
							</div>
							<div className='flex justify-between p-3 bg-panel rounded border border-line'>
								<span className='text-soft'>
									Доступных моделей:
								</span>
								<span className='font-mono text-purple-400'>
									{настройкиData?.доступныеМодели ?
										Object.keys(
											настройкиData.доступныеМодели,
										).length
									:	0}
								</span>
							</div>
							<div className='flex justify-between p-3 bg-panel rounded border border-line'>
								<span className='text-soft'>
									Текущая модель:
								</span>
								<span className='font-mono text-yellow-400 text-xs'>
									{настройки.model}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Системные промпты */}
			{активнаяВкладка === 'prompts' && (
				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
						<span>📝</span>
						<span>Системный промпт</span>
					</h3>

					<div className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-soft mb-2'>
								Инструкции для AI (системный промпт)
							</label>
							<textarea
								value={настройки.systemPrompt}
								onChange={(e) =>
									обработчикИзменения(
										'systemPrompt',
										e.target.value,
									)
								}
								rows={12}
								className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                         resize-vertical font-mono text-sm'
								placeholder='Введите инструкции для AI...'
							/>
							<div className='text-xs text-soft mt-1'>
								Символов: {настройки.systemPrompt.length} / 2000
							</div>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<button
								onClick={() =>
									обработчикИзменения(
										'systemPrompt',
										'Отвечай кратко и по существу. Максимум 2-3 предложения.',
									)
								}
								className='p-3 bg-panel border border-line hover:border-green-400 
                         hover:bg-green-400/10 rounded text-left transition-colors'
							>
								<div className='font-medium text-green-400 mb-1'>
									📝 Краткий стиль
								</div>
								<div className='text-xs text-soft'>
									Короткие, четкие ответы
								</div>
							</button>

							<button
								onClick={() =>
									обработчикИзменения(
										'systemPrompt',
										'Отвечай подробно и развернуто. Предоставляй контекст и примеры.',
									)
								}
								className='p-3 bg-panel border border-line hover:border-cyan 
                         hover:bg-cyan/10 rounded text-left transition-colors'
							>
								<div className='font-medium text-cyan mb-1'>
									📖 Подробный стиль
								</div>
								<div className='text-xs text-soft'>
									Развернутые объяснения
								</div>
							</button>

							<button
								onClick={() =>
									обработчикИзменения(
										'systemPrompt',
										'Ты опытный программист. Фокусируйся на технических деталях и best practices.',
									)
								}
								className='p-3 bg-panel border border-line hover:border-purple-400 
                         hover:bg-purple-400/10 rounded text-left transition-colors'
							>
								<div className='font-medium text-purple-400 mb-1'>
									💻 Технический стиль
								</div>
								<div className='text-xs text-soft'>
									Для разработчиков
								</div>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Модерация */}
			{активнаяВкладка === 'moderation' && (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<div className='bg-subtle border border-line rounded-lg bevel p-6'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>🛡️</span>
							<span>Настройки модерации</span>
						</h3>

						<div className='space-y-4'>
							<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
								<div>
									<div className='font-medium text-base'>
										Включить модерацию
									</div>
									<div className='text-sm text-soft'>
										Проверка содержимого сообщений
									</div>
								</div>
								<label className='relative inline-flex items-center cursor-pointer'>
									<input
										type='checkbox'
										checked={настройки.moderationEnabled}
										onChange={(e) =>
											обработчикИзменения(
												'moderationEnabled',
												e.target.checked,
											)
										}
										className='sr-only peer'
									/>
									<div
										className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                               after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                               peer-checked:bg-neon"
									></div>
								</label>
							</div>

							<div className='flex items-center justify-between p-3 bg-panel rounded border border-line'>
								<div>
									<div className='font-medium text-base'>
										Автоответы
									</div>
									<div className='text-sm text-soft'>
										AI отвечает автоматически
									</div>
								</div>
								<label className='relative inline-flex items-center cursor-pointer'>
									<input
										type='checkbox'
										checked={настройки.autoRespond}
										onChange={(e) =>
											обработчикИзменения(
												'autoRespond',
												e.target.checked,
											)
										}
										className='sr-only peer'
									/>
									<div
										className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer
                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                               after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                               after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                               peer-checked:bg-green-400"
									></div>
								</label>
							</div>

							<div>
								<label className='block text-sm font-medium text-soft mb-2'>
									Задержка ответа: {настройки.responseDelay}с
								</label>
								<input
									type='range'
									min='0.5'
									max='5'
									step='0.5'
									value={настройки.responseDelay}
									onChange={(e) =>
										обработчикИзменения(
											'responseDelay',
											parseFloat(e.target.value),
										)
									}
									className='w-full'
								/>
								<div className='flex justify-between text-xs text-soft mt-1'>
									<span>0.5с (Быстро)</span>
									<span>5с (Медленно)</span>
								</div>
							</div>
						</div>
					</div>

					<div className='bg-subtle border border-line rounded-lg bevel p-6'>
						<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
							<span>📋</span>
							<span>Журнал модерации</span>
						</h3>

						<div className='space-y-3 max-h-64 overflow-y-auto'>
							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex items-center justify-between mb-1'>
									<span className='text-sm font-medium text-base'>
										Заблокировано сообщение
									</span>
									<span className='text-xs text-red-400'>
										14:30
									</span>
								</div>
								<div className='text-xs text-soft'>
									Пользователь: anonymous@user.com • Причина:
									Неподходящий контент
								</div>
							</div>

							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex items-center justify-between mb-1'>
									<span className='text-sm font-medium text-base'>
										Одобрено сообщение
									</span>
									<span className='text-xs text-green-400'>
										14:25
									</span>
								</div>
								<div className='text-xs text-soft'>
									Пользователь: user@example.com • AI ответ
									отправлен
								</div>
							</div>

							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex items-center justify-between mb-1'>
									<span className='text-sm font-medium text-base'>
										Автоматическая проверка
									</span>
									<span className='text-xs text-cyan'>
										14:20
									</span>
								</div>
								<div className='text-xs text-soft'>
									Сообщение прошло модерацию • Безопасно
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Лимиты */}
			{активнаяВкладка === 'limits' && (
				<div className='bg-subtle border border-line rounded-lg bevel p-6'>
					<h3 className='text-lg font-bold text-base mb-4 flex items-center space-x-2'>
						<span>📊</span>
						<span>Лимиты и ограничения</span>
					</h3>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-soft mb-2'>
								Лимит сообщений на пользователя (в день)
							</label>
							<input
								type='number'
								min='1'
								max='200'
								value={настройки.messageLimit}
								onChange={(e) =>
									обработчикИзменения(
										'messageLimit',
										parseInt(e.target.value),
									)
								}
								className='w-full px-4 py-2 bg-panel border border-line rounded text-base
                         focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
							/>
						</div>

						<div className='space-y-3'>
							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex justify-between items-center'>
									<span className='text-soft'>
										Активных пользователей:
									</span>
									<span className='font-mono text-neon'>
										156
									</span>
								</div>
							</div>
							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex justify-between items-center'>
									<span className='text-soft'>
										Средне сообщений/день:
									</span>
									<span className='font-mono text-cyan'>
										18.3
									</span>
								</div>
							</div>
							<div className='p-3 bg-panel rounded border border-line'>
								<div className='flex justify-between items-center'>
									<span className='text-soft'>
										Превышений лимита:
									</span>
									<span className='font-mono text-yellow-400'>
										3
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Кнопки управления */}
			<div className='flex items-center justify-between p-4 bg-panel border border-line rounded-lg bevel'>
				<div className='flex items-center space-x-3'>
					<button
						onClick={обработчикТестирования}
						className='px-4 py-2 bg-cyan/20 border border-cyan text-cyan
                     hover:bg-cyan/30 rounded font-medium transition-colors'
					>
						🧪 Тестировать настройки
					</button>
					<button
						onClick={обработчикСброса}
						className='px-4 py-2 bg-subtle border border-line text-soft
                     hover:border-soft hover:text-base rounded font-medium
                     transition-colors'
					>
						🔄 Сбросить
					</button>
				</div>

				<button
					onClick={обработчикСохранения}
					disabled={сохранение}
					className='px-6 py-2 bg-neon/20 border border-neon text-neon
                   hover:bg-neon/30 hover:shadow-neon disabled:opacity-50
                   disabled:cursor-not-allowed rounded font-medium
                   bevel transition-all duration-300'
				>
					{сохранение ?
						'💾 Сохранение...'
					:	'💾 Сохранить настройки AI'}
				</button>
			</div>
		</div>
	);
}
