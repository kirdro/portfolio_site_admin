'use client';

import React, {
	useState,
	useMemo,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import { type PartialBlock } from '@blocknote/core';
import { useBlogAI } from '../../../hooks/useBlogAI';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

// Кастомная киберпанк тема для BlockNote
const customTheme = {
	colors: {
		editor: {
			text: '#E6F4EF',
			background: '#0B0D0E',
		},
		menu: {
			text: '#E6F4EF',
			background: '#0F1214',
		},
		tooltip: {
			text: '#0B0D0E',
			background: '#00FF99',
		},
		hovered: {
			text: '#E6F4EF',
			background: '#1a1d20',
		},
		selected: {
			text: '#0B0D0E',
			background: '#00FF99',
		},
		disabled: {
			text: '#6b7280',
			background: '#374151',
		},
		shadow: 'rgba(0, 255, 153, 0.2)',
		border: '#00FF99',
		sideMenu: '#0F1214',
		highlights: {
			gray: '#6b7280',
			brown: '#92400e',
			red: '#dc2626',
			orange: '#ea580c',
			yellow: '#ca8a04',
			green: '#16a34a',
			blue: '#2563eb',
			purple: '#9333ea',
			pink: '#c2185b',
		},
	},
} as const;

interface BlogEditorProps {
	initialContent?: PartialBlock[];
	onContentChange: (content: PartialBlock[]) => void;
	placeholder?: string;
	editable?: boolean;
}

/**
 * Компонент богатого текстового редактора для блога
 * Использует BlockNote.js с киберпанк темой
 */
export function BlogEditor({
	initialContent = [],
	onContentChange,
	placeholder = 'Начните писать статью...',
	editable = true,
}: BlogEditorProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [showAIMenu, setShowAIMenu] = useState(false);
	const [selectedText, setSelectedText] = useState('');
	const {
		isLoading: aiLoading,
		error: aiError,
		completeText,
		improveText,
		summarizeText,
		translateText,
	} = useBlogAI();
	const aiMenuRef = useRef<HTMLDivElement>(null);

	// Закрываем AI меню при клике вне его
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				aiMenuRef.current &&
				!aiMenuRef.current.contains(event.target as Node)
			) {
				setShowAIMenu(false);
			}
		};

		if (showAIMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showAIMenu]);

	// Простой обработчик изменения содержимого
	const handleContentChange = useCallback(
		(content: PartialBlock[]) => {
			onContentChange(content);
		},
		[onContentChange],
	);

	// AI функции (упрощенные для textarea)
	const handleAIAction = async (
		action: 'complete' | 'improve' | 'summarize' | 'translate',
	) => {
		const textarea = document.querySelector(
			'textarea',
		) as HTMLTextAreaElement;
		const currentText = textarea?.value || '';

		if (!currentText.trim()) {
			alert('Нет содержимого для обработки');
			return;
		}

		let result: string | null = null;

		switch (action) {
			case 'complete':
				result = await completeText(currentText, 'технический блог');
				break;
			case 'improve':
				result = await improveText(currentText);
				break;
			case 'summarize':
				result = await summarizeText(currentText);
				break;
			case 'translate':
				result = await translateText(currentText);
				break;
		}

		if (result && textarea) {
			textarea.value = result;
			// Эмулируем изменение для React
			const event = new Event('input', { bubbles: true });
			textarea.dispatchEvent(event);
		}

		setShowAIMenu(false);
	};

	// Кастомные стили для киберпанк темы
	const editorStyles = useMemo(
		() => ({
			'.bn-editor': {
				backgroundColor: customTheme.colors.editor.background,
				color: customTheme.colors.editor.text,
				fontFamily: '"Jura", "Inter", sans-serif',
			},
			'.bn-editor .ProseMirror': {
				padding: '16px 24px',
				minHeight: '400px',
				fontSize: '16px',
				lineHeight: '1.6',
			},
			'.bn-editor .ProseMirror h1': {
				color: customTheme.colors.selected.background,
				fontFamily: '"Jura", sans-serif',
				fontSize: '2.5rem',
				fontWeight: 'bold',
				textShadow: `0 0 10px ${customTheme.colors.selected.background}40`,
				marginBottom: '1rem',
			},
			'.bn-editor .ProseMirror h2': {
				color: '#00FFCC',
				fontFamily: '"Jura", sans-serif',
				fontSize: '2rem',
				fontWeight: 'bold',
				textShadow: '0 0 8px #00FFCC40',
				marginBottom: '0.75rem',
			},
			'.bn-editor .ProseMirror h3': {
				color: '#00FFCC',
				fontFamily: '"Jura", sans-serif',
				fontSize: '1.5rem',
				fontWeight: 'bold',
				textShadow: '0 0 6px #00FFCC40',
				marginBottom: '0.5rem',
			},
			'.bn-editor .ProseMirror p': {
				marginBottom: '1rem',
			},
			'.bn-editor .ProseMirror strong': {
				color: customTheme.colors.selected.background,
				fontWeight: 'bold',
			},
			'.bn-editor .ProseMirror em': {
				color: '#00FFCC',
				fontStyle: 'italic',
			},
			'.bn-editor .ProseMirror code': {
				backgroundColor: '#1F2937',
				color: '#00FF99',
				padding: '2px 6px',
				borderRadius: '4px',
				fontFamily: '"VT323", "Fira Code", monospace',
				fontSize: '1.1em',
				border: '1px solid #374151',
			},
			'.bn-editor .ProseMirror pre': {
				backgroundColor: '#1F2937',
				border: '1px solid #00FF99',
				borderRadius: '8px',
				padding: '16px',
				color: '#00FF99',
				fontFamily: '"VT323", "Fira Code", monospace',
				boxShadow: '0 0 20px rgba(0, 255, 153, 0.1)',
				marginBottom: '1rem',
			},
			'.bn-editor .ProseMirror blockquote': {
				borderLeft: `4px solid ${customTheme.colors.selected.background}`,
				backgroundColor: '#0F1214',
				padding: '12px 20px',
				marginBottom: '1rem',
				fontStyle: 'italic',
				boxShadow: '0 0 15px rgba(0, 255, 153, 0.05)',
			},
			'.bn-editor .ProseMirror ul, .bn-editor .ProseMirror ol': {
				paddingLeft: '24px',
				marginBottom: '1rem',
			},
			'.bn-editor .ProseMirror li': {
				marginBottom: '0.5rem',
			},
			'.bn-editor .ProseMirror a': {
				color: '#00FFCC',
				textDecoration: 'underline',
				textDecorationColor: '#00FFCC60',
			},
			'.bn-editor .ProseMirror a:hover': {
				textShadow: '0 0 8px #00FFCC',
				textDecoration: 'none',
			},
			// Стили для меню и тулбара
			'.bn-toolbar': {
				backgroundColor: customTheme.colors.menu.background,
				border: `1px solid ${customTheme.colors.border}`,
				borderRadius: '8px',
				padding: '8px',
				boxShadow: `0 0 20px ${customTheme.colors.shadow}`,
			},
			'.bn-toolbar button': {
				color: customTheme.colors.menu.text,
				backgroundColor: 'transparent',
				border: '1px solid transparent',
				borderRadius: '4px',
				padding: '6px',
				margin: '2px',
				transition: 'all 0.2s ease',
			},
			'.bn-toolbar button:hover': {
				backgroundColor: customTheme.colors.hovered.background,
				borderColor: customTheme.colors.border,
				boxShadow: `0 0 10px ${customTheme.colors.shadow}`,
			},
			".bn-toolbar button[data-state='on']": {
				backgroundColor: customTheme.colors.selected.background,
				color: customTheme.colors.selected.text,
				borderColor: customTheme.colors.border,
			},
		}),
		[],
	);

	return (
		<div className='blog-editor-container'>
			{/* Кастомные стили */}
			<style
				jsx
				global
			>{`
				${Object.entries(editorStyles)
					.map(
						([selector, styles]) =>
							`${selector} { ${Object.entries(styles as any)
								.map(
									([prop, value]) =>
										`${prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value};`,
								)
								.join(' ')} }`,
					)
					.join(' ')}
			`}</style>

			<div className='relative'>
				{/* Индикатор загрузки */}
				{(isLoading || aiLoading) && (
					<div className='absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
						<div className='text-neon text-lg font-medium'>
							⏳{' '}
							{aiLoading ?
								'Обработка AI запроса...'
							:	'Обработка...'}
						</div>
					</div>
				)}

				{/* AI ошибка */}
				{aiError && (
					<div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg'>
						<div className='text-red-400 text-sm'>
							❌ Ошибка AI: {aiError}
						</div>
					</div>
				)}

				{/* Редактор */}
				<div className='bg-bg border border-line rounded-lg bevel overflow-hidden'>
					<div className='border-b border-line bg-subtle p-3 flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<span className='text-neon text-lg'>📝</span>
							<span className='text-base font-medium'>
								Редактор статьи
							</span>
						</div>
						<div className='flex items-center space-x-3 text-sm text-soft'>
							{editable && (
								<div
									className='relative'
									ref={aiMenuRef}
								>
									<button
										onClick={() =>
											setShowAIMenu(!showAIMenu)
										}
										disabled={aiLoading}
										className='flex items-center gap-2 px-3 py-1 bg-neon/20 text-neon rounded-lg hover:bg-neon/30 transition-all disabled:opacity-50'
									>
										<span>🤖</span>
										<span>AI</span>
									</button>

									{showAIMenu && (
										<div className='absolute right-0 top-full mt-2 w-48 bg-panel border border-line rounded-lg shadow-lg z-10 bevel'>
											<div className='p-2 space-y-1'>
												<button
													onClick={() =>
														handleAIAction(
															'complete',
														)
													}
													disabled={aiLoading}
													className='w-full text-left px-3 py-2 rounded hover:bg-neon/20 transition-all disabled:opacity-50 text-sm'
												>
													✨ Продолжить текст
												</button>
												<button
													onClick={() =>
														handleAIAction(
															'improve',
														)
													}
													disabled={aiLoading}
													className='w-full text-left px-3 py-2 rounded hover:bg-cyan/20 transition-all disabled:opacity-50 text-sm'
												>
													📝 Улучшить стиль
												</button>
												<button
													onClick={() =>
														handleAIAction(
															'summarize',
														)
													}
													disabled={aiLoading}
													className='w-full text-left px-3 py-2 rounded hover:bg-yellow-400/20 transition-all disabled:opacity-50 text-sm'
												>
													📋 Создать резюме
												</button>
												<button
													onClick={() =>
														handleAIAction(
															'translate',
														)
													}
													disabled={aiLoading}
													className='w-full text-left px-3 py-2 rounded hover:bg-purple-400/20 transition-all disabled:opacity-50 text-sm'
												>
													🌐 Перевести
												</button>
											</div>
										</div>
									)}
								</div>
							)}

							<span>BlockNote.js</span>
							{!editable && (
								<span className='px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs'>
									Только чтение
								</span>
							)}
						</div>
					</div>

					<div className='min-h-[500px]'>
						{/* Временная замена BlockNote на textarea */}
						<textarea
							placeholder={placeholder}
							className='w-full h-full min-h-[500px] bg-bg border border-line rounded-lg p-4 text-base focus:border-neon focus:ring-1 focus:ring-neon transition-colors resize-none'
							onChange={(e) => {
								// Преобразуем текст в простой PartialBlock для совместимости
								const simpleBlock = [
									{
										type: 'paragraph',
										content: e.target.value,
									},
								];
								handleContentChange(
									simpleBlock as PartialBlock[],
								);
							}}
							defaultValue={
								initialContent.length > 0 ?
									initialContent
										.map((block) =>
											(
												typeof block === 'object' &&
												block &&
												'content' in block
											) ?
												Array.isArray(block.content) ?
													block.content
														.map((c) =>
															(
																typeof c ===
																	'object' &&
																c &&
																'text' in c
															) ?
																c.text
															:	'',
														)
														.join('')
												:	String(block.content || '')
											:	'',
										)
										.join('\n')
								:	''
							}
						/>
					</div>
				</div>

				{/* Подсказки по использованию */}
				<div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
					<div className='bg-subtle border border-line rounded p-3'>
						<div className='font-medium text-neon mb-2'>
							💡 Быстрые команды
						</div>
						<div className='space-y-1 text-soft'>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									/h1
								</kbd>{' '}
								- Заголовок 1
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									/h2
								</kbd>{' '}
								- Заголовок 2
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									/code
								</kbd>{' '}
								- Блок кода
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									/quote
								</kbd>{' '}
								- Цитата
							</div>
						</div>
					</div>

					<div className='bg-subtle border border-line rounded p-3'>
						<div className='font-medium text-cyan mb-2'>
							⌨️ Горячие клавиши
						</div>
						<div className='space-y-1 text-soft'>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									Ctrl+B
								</kbd>{' '}
								- Жирный текст
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									Ctrl+I
								</kbd>{' '}
								- Курсив
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									Ctrl+K
								</kbd>{' '}
								- Ссылка
							</div>
							<div>
								<kbd className='text-xs bg-panel px-1 rounded'>
									Ctrl+Z
								</kbd>{' '}
								- Отмена
							</div>
						</div>
					</div>

					{editable && (
						<div className='bg-subtle border border-line rounded p-3'>
							<div className='font-medium text-purple-400 mb-2'>
								🤖 AI Ассистент
							</div>
							<div className='space-y-1 text-soft'>
								<div>✨ Продолжить текст</div>
								<div>📝 Улучшить стиль</div>
								<div>📋 Создать резюме</div>
								<div>🌐 Перевести текст</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
