'use client';

import React, { useState } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import type { SkillData } from '../../../app/(dashboard)/skills/page';
import { useIconMapping } from '../../../hooks/useIconMapping';

interface SkillCardProps {
	skill: SkillData;
	onClick: (skill: SkillData) => void;
	onDelete?: (skill: SkillData) => void;
	categoryColor: string;
}

/**
 * Карточка навыка с уровнем владения и прогресс-баром
 * Киберпанк дизайн с bevel эффектами
 */
export function SkillCard({ skill, onClick, onDelete, categoryColor }: SkillCardProps) {
	const [showActions, setShowActions] = useState(false);
	const { renderIcon } = useIconMapping();

	// Обработчик клика для редактирования
	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick(skill);
	};

	// Обработчик клика для удаления
	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onDelete) {
			onDelete(skill);
		}
	};

	// Определение цвета уровня на основе значения
	const getLevelColor = (level: number) => {
		if (level >= 90) return 'text-green-400';
		if (level >= 70) return 'text-yellow-400';
		if (level >= 50) return 'text-orange-400';
		return 'text-red-400';
	};

	// Определение текста уровня владения
	const getLevelText = (level: number) => {
		if (level >= 90) return 'Эксперт';
		if (level >= 70) return 'Продвинутый';
		if (level >= 50) return 'Средний';
		return 'Начинающий';
	};

	// Форматирование даты обновления
	const formattedDate = skill.updatedAt.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	});

	// Динамические классы для цвета категории
	const coloredBorder =
		categoryColor === 'neon' ? 'border-neon'
		: categoryColor === 'cyan' ? 'border-cyan'
		: categoryColor === 'purple-400' ? 'border-purple-400'
		: categoryColor === 'yellow-400' ? 'border-yellow-400'
		: categoryColor === 'orange-400' ? 'border-orange-400'
		: `border-${categoryColor}`;

	const coloredText =
		categoryColor === 'neon' ? 'text-neon'
		: categoryColor === 'cyan' ? 'text-cyan'
		: categoryColor === 'purple-400' ? 'text-purple-400'
		: categoryColor === 'yellow-400' ? 'text-yellow-400'
		: categoryColor === 'orange-400' ? 'text-orange-400'
		: `text-${categoryColor}`;

	const coloredBg =
		categoryColor === 'neon' ? 'bg-neon'
		: categoryColor === 'cyan' ? 'bg-cyan'
		: categoryColor === 'purple-400' ? 'bg-purple-400'
		: categoryColor === 'yellow-400' ? 'bg-yellow-400'
		: categoryColor === 'orange-400' ? 'bg-orange-400'
		: `bg-${categoryColor}`;

	return (
		<div
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
			className='bg-subtle border border-line rounded-lg bevel overflow-hidden
                 hover:border-neon hover:shadow-neon transition-all duration-300
                 group relative'
		>
			{/* Кнопки действий */}
			{showActions && (
				<div className='absolute top-2 right-2 flex space-x-1 z-10'>
					<button
						onClick={handleEditClick}
						className='w-7 h-7 bg-neon/20 hover:bg-neon/30 border border-neon
						         text-neon hover:text-white rounded bevel transition-all duration-200
						         flex items-center justify-center hover:shadow-neon glyph-glow'
						title='Редактировать навык'
					>
						<FaEdit size={12} />
					</button>
					{onDelete && (
						<button
							onClick={handleDeleteClick}
							className='w-7 h-7 bg-red-500/20 hover:bg-red-500/30 border border-red-500
							         text-red-500 hover:text-white rounded bevel transition-all duration-200
							         flex items-center justify-center hover:shadow-red-500 hover:shadow-lg'
							title='Удалить навык'
						>
							<FaTrash size={12} />
						</button>
					)}
				</div>
			)}

			{/* Индикатор высокого уровня */}
			{skill.level >= 90 && !showActions && (
				<div
					className='absolute top-2 right-2 w-3 h-3 rounded-full bg-green-400
                       animate-pulse border border-green-300'
					title='Экспертный уровень'
				/>
			)}

			<div className='p-4'>
				{/* Иконка и название */}
				<div className='flex items-center space-x-3 mb-3'>
					<div className='text-2xl group-hover:scale-110 transition-transform text-neon'>
						{renderIcon(skill.icon, { size: 28, className: 'glyph-glow' })}
					</div>
					<div className='flex-1'>
						<h4 className='font-bold text-base group-hover:text-neon transition-colors'>
							{skill.name}
						</h4>
						<div className='text-xs text-soft'>
							{getLevelText(skill.level)}
						</div>
					</div>
				</div>

				{/* Уровень владения */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<span className='text-sm text-soft'>
							Уровень владения
						</span>
						<span
							className={`text-sm font-bold ${getLevelColor(skill.level)} glyph-glow`}
						>
							{skill.level}%
						</span>
					</div>

					{/* Прогресс бар */}
					<div className='w-full bg-gray-800 rounded-full h-2 border border-line overflow-hidden'>
						<div
							className='h-2 rounded-full transition-all duration-500'
							style={{
								width: `${Math.max(skill.level, 2)}%`, // Минимум 2% для видимости
								backgroundColor:
									categoryColor === 'neon' ? '#00FF99'
									: categoryColor === 'cyan' ? '#00FFCC'
									: categoryColor === 'purple-400' ? '#a855f7'
									: categoryColor === 'yellow-400' ? '#facc15'
									: categoryColor === 'orange-400' ? '#fb923c'
									: '#00FF99', // fallback на neon
								boxShadow:
									skill.level >= 70 ?
										`0 0 8px ${
											categoryColor === 'neon' ? '#00FF99'
											: categoryColor === 'cyan' ? '#00FFCC'
											: categoryColor === 'purple-400' ? '#a855f7'
											: categoryColor === 'yellow-400' ? '#facc15'
											: categoryColor === 'orange-400' ? '#fb923c'
											: '#00FF99'
										}`
									: skill.level >= 20 ?
										`0 0 4px ${
											categoryColor === 'neon' ? '#00FF99'
											: categoryColor === 'cyan' ? '#00FFCC'
											: categoryColor === 'purple-400' ? '#a855f7'
											: categoryColor === 'yellow-400' ? '#facc15'
											: categoryColor === 'orange-400' ? '#fb923c'
											: '#00FF99'
										}`
									: 'none',
							}}
						/>
					</div>
				</div>

				{/* Метаинформация */}
				<div className='flex items-center justify-between mt-4 pt-3 border-t border-line text-xs text-soft'>
					<div className='flex items-center space-x-2'>
						<div className={`w-2 h-2 rounded-full ${coloredBg}`} />
						<span>{skill.category}</span>
					</div>
					<div className='font-mono'>{formattedDate}</div>
				</div>

				{/* Hover эффекты */}
				<div
					className='absolute inset-0 bg-gradient-to-r from-transparent via-neon/5 to-transparent
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       pointer-events-none'
				/>
			</div>
		</div>
	);
}
