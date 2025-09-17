'use client';

import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import {
	FaPalette,
	FaCog,
	FaRocket,
	FaTools,
	FaLightbulb,
	FaBolt,
	FaFile,
} from 'react-icons/fa';
import type { SkillData } from '../../../app/(dashboard)/skills/page';
import { api } from '../../../utils/api';
import { FileUpload } from '../../ui/FileUpload';
import { Spinner } from '../../ui/loaders';
import { NeonIcon } from '../../ui/NeonIcon';
import { useIconMapping, getAvailableIcons } from '../../../hooks/useIconMapping';

interface SkillFormProps {
	skill?: SkillData | null;
	isCreating: boolean;
	onClose: () => void;
	onSave: () => void;
}

// Zod схема валидации навыка
const skillSchema = z.object({
	name: z
		.string()
		.min(1, 'Название обязательно')
		.max(50, 'Название слишком длинное'),
	category: z.enum(['Frontend', 'Backend', 'DevOps', 'Tools', 'Other'], {
		message: 'Выберите категорию',
	}),
	level: z
		.number()
		.min(1, 'Минимальный уровень: 1%')
		.max(100, 'Максимальный уровень: 100%'),
	icon: z
		.string()
		.min(1, 'Выберите иконку')
		.max(50, 'Иконка слишком длинная'),
});

/**
 * Форма создания/редактирования навыка
 * Поддержка валидации, слайдера уровня и выбора иконки
 */
export function SkillForm({
	skill,
	isCreating,
	onClose,
	onSave,
}: SkillFormProps) {
	// Подключаем систему иконок
	const { renderIcon, getIcon } = useIconMapping();

	// Подключаем tRPC мутации
	const createMutation = api.admin.skills.create.useMutation({
		onSuccess: () => {
			onSave();
		},
		onError: (error) => {
			console.error('Ошибка создания навыка:', error);
			alert(`Ошибка: ${error.message}`);
		},
	});

	const updateMutation = api.admin.skills.update.useMutation({
		onSuccess: () => {
			onSave();
		},
		onError: (error) => {
			console.error('Ошибка обновления навыка:', error);
			alert(`Ошибка: ${error.message}`);
		},
	});

	// Состояние формы
	const [formData, setFormData] = useState({
		name: skill?.name || '',
		category: skill?.category || ('Frontend' as const),
		level: skill?.level || 50,
		icon: skill?.icon || 'SiReact',
	});

	const [useCustomIcon, setUseCustomIcon] = useState(false);

	const [errors, setErrors] = useState<Record<string, string>>({});

	// Доступные категории
	const categories = [
		{ value: 'Frontend', label: 'Frontend', IconComponent: FaPalette },
		{ value: 'Backend', label: 'Backend', IconComponent: FaCog },
		{ value: 'DevOps', label: 'DevOps', IconComponent: FaRocket },
		{ value: 'Tools', label: 'Инструменты', IconComponent: FaTools },
		{ value: 'Other', label: 'Другое', IconComponent: FaLightbulb },
	] as const;

	// Получаем доступные иконки из системы маппинга
	const availableIcons = getAvailableIcons();

	// Функция для получения компонента иконки по ключу
	const getIconComponent = (iconKey: string) => {
		const IconComponent = getIcon(iconKey);
		return IconComponent || FaBolt;
	};

	// Обработчик изменения полей формы
	const handleFieldChange = useCallback(
		(field: string, value: any) => {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));

			// Очищаем ошибку поля при изменении
			if (errors[field]) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[field];
					return newErrors;
				});
			}
		},
		[errors],
	);

	// Валидация формы
	const validateForm = () => {
		try {
			skillSchema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: Record<string, string> = {};
				error.issues.forEach((err: any) => {
					if (err.path[0]) {
						newErrors[err.path[0] as string] = err.message;
					}
				});
				setErrors(newErrors);
			}
			return false;
		}
	};

	// Обработчик отправки формы
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			if (!validateForm()) {
				return;
			}

			try {
				if (isCreating) {
					// Создание нового навыка
					await createMutation.mutateAsync(formData);
				} else if (skill) {
					// Обновление существующего навыка
					await updateMutation.mutateAsync({
						id: skill.id,
						...formData,
					});
				}
			} catch (error) {
				// Ошибки уже обрабатываются в onError мутаций
				console.error('Ошибка при сохранении:', error);
			}
		},
		[
			formData,
			isCreating,
			skill,
			createMutation,
			updateMutation,
			validateForm,
		],
	);

	// Определение цвета уровня
	const getLevelColor = (level: number) => {
		if (level >= 90) return 'text-green-400 bg-green-400';
		if (level >= 70) return 'text-yellow-400 bg-yellow-400';
		if (level >= 50) return 'text-orange-400 bg-orange-400';
		return 'text-red-400 bg-red-400';
	};

	return (
		<div className='fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
			<div className='bg-panel border border-line rounded-lg bevel max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl shadow-neon/10'>
				<div className='p-6'>
					{/* Заголовок формы */}
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-bold text-neon glyph-glow'>
							{isCreating ?
								'➕ Добавить навык'
							:	'✏️ Редактировать навык'}
						</h2>
						<button
							onClick={onClose}
							className='text-soft hover:text-base transition-colors'
						>
							✕
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						{/* Название навыка */}
						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								Название навыка *
							</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) =>
									handleFieldChange('name', e.target.value)
								}
								className={`w-full px-3 py-2 bg-subtle border rounded-md text-base
                           focus:border-neon focus:ring-1 focus:ring-neon transition-colors
                           ${errors.name ? 'border-red-500' : 'border-line'}`}
								placeholder='React, TypeScript, Docker...'
								maxLength={50}
							/>
							{errors.name && (
								<p className='text-red-400 text-sm mt-1'>
									{errors.name}
								</p>
							)}
						</div>

						{/* Категория */}
						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								Категория *
							</label>
							<div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
								{categories.map((category) => (
									<button
										key={category.value}
										type='button'
										onClick={() =>
											handleFieldChange(
												'category',
												category.value,
											)
										}
										className={`p-3 border rounded-md transition-all duration-300 text-center
                               ${
									formData.category === category.value ?
										'border-neon bg-neon/20 text-neon shadow-neon'
									:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80 hover:bg-neon/10'
								}`}
									>
										<div className='text-xl mb-1 flex items-center justify-center'>
											<NeonIcon 
												Icon={category.IconComponent} 
												size={24}
												variant={formData.category === category.value ? "intense" : "subtle"}
											/>
										</div>
										<div className='text-xs'>
											{category.label}
										</div>
									</button>
								))}
							</div>
							{errors.category && (
								<p className='text-red-400 text-sm mt-1'>
									{errors.category}
								</p>
							)}
						</div>

						{/* Уровень владения */}
						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								Уровень владения * ({formData.level}%)
							</label>
							<div className='space-y-4'>
								{/* Кнопки быстрого выбора уровня */}
								<div className='grid grid-cols-4 gap-2'>
									{[
										{
											level: 25,
											label: 'Новичок',
											color: 'text-red-400 border-red-400/50 bg-red-400/10 hover:bg-red-400/20',
										},
										{
											level: 50,
											label: 'Средний',
											color: 'text-orange-400 border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20',
										},
										{
											level: 75,
											label: 'Продвинутый',
											color: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20',
										},
										{
											level: 95,
											label: 'Эксперт',
											color: 'text-green-400 border-green-400/50 bg-green-400/10 hover:bg-green-400/20',
										},
									].map((preset) => (
										<button
											key={preset.level}
											type='button'
											onClick={() =>
												handleFieldChange(
													'level',
													preset.level,
												)
											}
											className={`p-2 border rounded-md transition-all duration-300 text-center text-xs font-medium
                                 ${
										(
											Math.abs(
												formData.level - preset.level,
											) <= 5
										) ?
											`${preset.color} shadow-lg transform scale-105`
										:	'border-gray-500 bg-gray-700 text-gray-300 hover:border-neon/50 hover:text-neon/80 hover:bg-neon/10'
									}`}
										>
											<div className='font-bold'>
												{preset.level}%
											</div>
											<div>{preset.label}</div>
										</button>
									))}
								</div>

								{/* Кнопки для точной настройки */}
								<div>
									<div className='text-xs text-gray-300 mb-2'>
										Точная настройка (шаг 5%):
									</div>
									<div className='grid grid-cols-10 gap-1'>
										{Array.from(
											{ length: 20 },
											(_, i) => (i + 1) * 5,
										).map((level) => (
											<button
												key={level}
												type='button'
												onClick={() =>
													handleFieldChange(
														'level',
														level,
													)
												}
												className={`p-1 border rounded text-xs font-mono transition-all duration-200
                                   ${
										formData.level === level ?
											'border-neon bg-neon/30 text-neon shadow-neon scale-110'
										:	'border-gray-600 bg-gray-800 text-gray-400 hover:border-neon/50 hover:text-neon/80 hover:bg-neon/10 hover:scale-105'
									}`}
												title={`Установить ${level}%`}
											>
												{level}
											</button>
										))}
									</div>

									{/* Дополнительные кнопки для промежуточных значений */}
									<div className='mt-2'>
										<div className='text-xs text-gray-400 mb-1'>
											Промежуточные значения:
										</div>
										<div className='flex flex-wrap gap-1'>
											{[
												1, 3, 7, 12, 18, 23, 27, 33, 37,
												42, 47, 53, 57, 62, 67, 72, 77,
												82, 87, 92, 97, 99,
											].map((level) => (
												<button
													key={level}
													type='button'
													onClick={() =>
														handleFieldChange(
															'level',
															level,
														)
													}
													className={`px-2 py-1 border rounded text-xs font-mono transition-all duration-200
                                     ${
											formData.level === level ?
												'border-cyan bg-cyan/30 text-cyan shadow-cyan scale-110'
											:	'border-gray-700 bg-gray-900 text-gray-500 hover:border-cyan/50 hover:text-cyan/80 hover:bg-cyan/10'
										}`}
													title={`Установить ${level}%`}
												>
													{level}%
												</button>
											))}
										</div>
									</div>
								</div>

								<div className='flex justify-between text-xs text-gray-300'>
									<span>1% (Новичок)</span>
									<span
										className={`font-bold ${getLevelColor(formData.level).split(' ')[0]} glyph-glow`}
									>
										{formData.level >= 90 ?
											'Эксперт'
										: formData.level >= 70 ?
											'Продвинутый'
										: formData.level >= 50 ?
											'Средний'
										:	'Начинающий'}
									</span>
									<span>100% (Эксперт)</span>
								</div>

								{/* Прогресс бар */}
								<div className='w-full bg-panel rounded-full h-3 border border-line'>
									<div
										className={`h-3 rounded-full transition-all duration-500 ${getLevelColor(formData.level).split(' ')[1]}`}
										style={{ width: `${formData.level}%` }}
									/>
								</div>
							</div>
							{errors.level && (
								<p className='text-red-400 text-sm mt-1'>
									{errors.level}
								</p>
							)}
						</div>

						{/* Иконка */}
						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								Иконка навыка *
							</label>

							{/* Переключатель типа иконки */}
							<div className='flex gap-4 mb-4'>
								<button
									type='button'
									onClick={() => setUseCustomIcon(false)}
									className={`px-3 py-2 rounded border transition-colors flex items-center gap-2 ${
										!useCustomIcon ?
											'border-neon bg-neon/20 text-neon'
										:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80'
									}`}
								>
									<NeonIcon Icon={FaPalette} size={16} />
									Иконки
								</button>
								<button
									type='button'
									onClick={() => setUseCustomIcon(true)}
									className={`px-3 py-2 rounded border transition-colors flex items-center gap-2 ${
										useCustomIcon ?
											'border-neon bg-neon/20 text-neon'
										:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80'
									}`}
								>
									<NeonIcon Icon={FaFile} size={16} />
									Загрузить файл
								</button>
							</div>

							{!useCustomIcon ?
								<div className='space-y-3'>
									{/* Текущая иконка */}
									<div className='flex items-center space-x-3 p-3 bg-subtle border border-line rounded-md'>
										<div className='text-3xl flex items-center justify-center'>
											{renderIcon(formData.icon, { size: 32, className: 'text-neon glyph-glow' })}
										</div>
										<div>
											<div className='text-sm font-medium'>
												Выбрана иконка: {formData.icon}
											</div>
											<div className='text-xs text-gray-300'>
												Нажмите на иконку ниже для изменения
											</div>
										</div>
									</div>

									{/* Поиск иконок */}
									<div className='mb-4'>
										<input
											type='text'
											placeholder='Поиск иконок... (например: react, graphql, websocket)'
											className='w-full px-3 py-2 bg-subtle border border-line rounded-md text-base
                                     focus:border-neon focus:ring-1 focus:ring-neon transition-colors'
											onChange={(e) => {
												const searchTerm = e.target.value.toLowerCase();
												// Фильтрация будет происходить в рендере
											}}
										/>
									</div>

									{/* Доступные иконки с группировкой */}
									<div className='space-y-4 max-h-80 overflow-y-auto'>
										{/* Популярные/Рекомендуемые */}
										<div>
											<h4 className='text-sm font-medium text-gray-300 mb-2'>🔥 Популярные</h4>
											<div className='grid grid-cols-4 gap-3'>
												{availableIcons
													.filter(icon =>
														['SiReact', 'SiTypescript', 'SiJavascript', 'SiNodedotjs', 'SiNextdotjs', 'SiPostgresql', 'SiDocker', 'FaAws'].includes(icon.key)
													)
													.map((iconData) => (
														<button
															key={iconData.key}
															type='button'
															onClick={() => handleFieldChange('icon', iconData.key)}
															className={`p-3 border rounded-md transition-all duration-300
                                               hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1
                                               ${
																formData.icon === iconData.key ?
																	'border-neon bg-neon/20 text-neon shadow-neon'
																:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80'
															}`}
															title={`Выбрать ${iconData.name}`}
														>
															<div className='flex items-center justify-center h-6'>
																{renderIcon(iconData.key, {
																	size: 24,
																	className: formData.icon === iconData.key ? 'text-neon glyph-glow' : 'text-gray-300'
																})}
															</div>
															<span className='text-xs text-center font-medium break-words'>
																{iconData.name}
															</span>
														</button>
													))
												}
											</div>
										</div>

										{/* Протоколы связи и API */}
										<div>
											<h4 className='text-sm font-medium text-gray-300 mb-2'>🔌 Протоколы связи</h4>
											<div className='grid grid-cols-3 gap-3'>
												{availableIcons
													.filter(icon =>
														['SiGraphql', 'TbBrandGraphql', 'TbApi', 'MdWebSocket', 'TbPlugConnected', 'TbWebhook'].includes(icon.key)
													)
													.map((iconData) => (
														<button
															key={iconData.key}
															type='button'
															onClick={() => handleFieldChange('icon', iconData.key)}
															className={`p-3 border rounded-md transition-all duration-300
                                               hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1
                                               ${
																formData.icon === iconData.key ?
																	'border-neon bg-neon/20 text-neon shadow-neon'
																:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80'
															}`}
															title={`Выбрать ${iconData.name}`}
														>
															<div className='flex items-center justify-center h-6'>
																{renderIcon(iconData.key, {
																	size: 24,
																	className: formData.icon === iconData.key ? 'text-neon glyph-glow' : 'text-gray-300'
																})}
															</div>
															<span className='text-xs text-center font-medium break-words'>
																{iconData.name}
															</span>
														</button>
													))
												}
											</div>
										</div>

										{/* Все остальные иконки */}
										<div>
											<h4 className='text-sm font-medium text-gray-300 mb-2'>📚 Все иконки</h4>
											<div className='grid grid-cols-4 gap-2'>
												{availableIcons.map((iconData) => (
													<button
														key={iconData.key}
														type='button'
														onClick={() => handleFieldChange('icon', iconData.key)}
														className={`p-2 border rounded-md transition-all duration-300
                                           hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1
                                           ${
															formData.icon === iconData.key ?
																'border-neon bg-neon/20 text-neon shadow-neon'
															:	'border-line bg-subtle text-gray-300 hover:border-neon/50 hover:text-neon/80'
														}`}
														title={`Выбрать ${iconData.name}`}
													>
														<div className='flex items-center justify-center h-5'>
															{renderIcon(iconData.key, {
																size: 20,
																className: formData.icon === iconData.key ? 'text-neon glyph-glow' : 'text-gray-300'
															})}
														</div>
														<span className='text-xs text-center font-medium break-words leading-tight'>
															{iconData.name}
														</span>
													</button>
												))}
											</div>
										</div>
									</div>
								</div>
							:	/* Загрузка файла иконки */
								<FileUpload
									currentFileUrl={
										formData.icon.startsWith('http') ?
											formData.icon
										:	''
									}
									onFileUploaded={(url) =>
										handleFieldChange('icon', url)
									}
									onFileDeleted={() =>
										handleFieldChange('icon', '⚡')
									}
									category='skill'
									acceptedTypes='image/*,.svg'
									maxSize={1 * 1024 * 1024}
									preview={true}
								/>
							}
							{errors.icon && (
								<p className='text-red-400 text-sm mt-1'>
									{errors.icon}
								</p>
							)}
						</div>

						{/* Кнопки действий */}
						<div className='flex gap-3 pt-4'>
							<button
								type='submit'
								disabled={
									createMutation.isPending ||
									updateMutation.isPending
								}
								className='flex-1 px-4 py-2 bg-neon/20 border border-neon text-neon
                         hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         bevel transition-all duration-300'
							>
								{(
									createMutation.isPending ||
									updateMutation.isPending
								) ?
									<div className='flex items-center gap-2'>
										<Spinner
											size='small'
											variant='inline'
										/>
										<span>Сохранение навыка...</span>
									</div>
								: isCreating ?
									'Создать'
								:	'Сохранить'}
							</button>
							<button
								type='button'
								onClick={onClose}
								className='px-4 py-2 bg-subtle border border-line text-base
                         hover:border-soft rounded-md
                         transition-colors'
							>
								Отмена
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
