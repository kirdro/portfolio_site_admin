'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { AiChatInterface } from '../../../components/admin/ai-chat/AiChatInterface';
import { AiChatHistory } from '../../../components/admin/ai-chat/AiChatHistory';
import { AiChatSettings } from '../../../components/admin/ai-chat/AiChatSettings';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import { FaRobot, FaComments, FaScroll, FaCog } from 'react-icons/fa';

/**
 * Основная страница AI-чата админ панели
 * Интерфейс для управления ИИ диалогами пользователей
 */
export default function AiChatPage() {
	const [активнаяВкладка, setАктивнаяВкладка] = useState<
		'interface' | 'history' | 'settings'
	>('interface');

	// Получаем реальную статистику AI чата
	const { data: статистикаAI, isLoading: загрузкаСтатистики } =
		api.aiChat.getStats.useQuery({ период: 'day' });

	// Обработчик переключения вкладок
	const обработчикВкладки = useCallback(
		(вкладка: 'interface' | 'history' | 'settings') => {
			setАктивнаяВкладка(вкладка);
		},
		[],
	);

	return (
		<div className='space-y-6'>
			{/* Заголовок и статистика */}
			<div className='flex flex-col md:flex-row md:items-center md:justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-base mb-2 flex items-center gap-2'>
						<NeonIcon
							Icon={FaRobot}
							size={24}
							variant='intense'
						/>
						AI-чат интерфейс
					</h1>
					<p className='text-soft'>
						Управление ИИ диалогами и настройки AI модели
					</p>
				</div>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0'>
					<div className='text-center p-3 bg-panel rounded border border-line'>
						<div className='font-mono text-lg text-neon glyph-glow'>
							{загрузкаСтатистики ?
								'...'
							:	статистикаAI?.всегоСообщений?.toLocaleString() ||
								'0'
							}
						</div>
						<div className='text-xs text-soft'>Всего сообщений</div>
					</div>
					<div className='text-center p-3 bg-panel rounded border border-line'>
						<div className='font-mono text-lg text-cyan'>
							{загрузкаСтатистики ?
								'...'
							:	статистикаAI?.активныхДиалогов || '0'}
						</div>
						<div className='text-xs text-soft'>
							Активных диалогов
						</div>
					</div>
					<div className='text-center p-3 bg-panel rounded border border-line'>
						<div className='font-mono text-lg text-purple-400'>
							{загрузкаСтатистики ?
								'...'
							:	`${статистикаAI?.среднееВремяОтвета || '0'}с`}
						</div>
						<div className='text-xs text-soft'>
							Среднее время ответа
						</div>
					</div>
					<div className='text-center p-3 bg-panel rounded border border-line'>
						<div className='font-mono text-lg text-green-400'>
							{загрузкаСтатистики ?
								'...'
							:	`${статистикаAI?.успешныхОтветов || '0'}%`}
						</div>
						<div className='text-xs text-soft'>
							Успешных ответов
						</div>
					</div>
				</div>
			</div>

			{/* Навигация по вкладкам */}
			<div className='flex space-x-1 bg-subtle rounded-lg p-1 border border-line bevel'>
				<button
					onClick={() => обработчикВкладки('interface')}
					className={`flex-1 px-4 py-3 rounded font-medium transition-all ${
						активнаяВкладка === 'interface' ?
							'bg-neon/20 text-neon border border-neon shadow-neon'
						:	'text-soft hover:text-base hover:bg-panel'
					}`}
				>
					<NeonIcon
						Icon={FaComments}
						size={16}
						variant='default'
					/>
					Интерфейс чата
				</button>
				<button
					onClick={() => обработчикВкладки('history')}
					className={`flex-1 px-4 py-3 rounded font-medium transition-all ${
						активнаяВкладка === 'history' ?
							'bg-cyan/20 text-cyan border border-cyan shadow-[0_0_10px_rgba(0,255,204,0.3)]'
						:	'text-soft hover:text-base hover:bg-panel'
					}`}
				>
					<NeonIcon
						Icon={FaScroll}
						size={16}
						variant='cyan'
					/>
					История диалогов
				</button>
				<button
					onClick={() => обработчикВкладки('settings')}
					className={`flex-1 px-4 py-3 rounded font-medium transition-all ${
						активнаяВкладка === 'settings' ?
							'bg-purple-400/20 text-purple-400 border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
						:	'text-soft hover:text-base hover:bg-panel'
					}`}
				>
					<NeonIcon
						Icon={FaCog}
						size={16}
						variant='purple'
					/>
					Настройки AI
				</button>
			</div>

			{/* Содержимое вкладок */}
			<div className='min-h-[600px]'>
				{активнаяВкладка === 'interface' && <AiChatInterface />}
				{активнаяВкладка === 'history' && <AiChatHistory />}
				{активнаяВкладка === 'settings' && <AiChatSettings />}
			</div>
		</div>
	);
}
