'use client';

import React from 'react';
import { SkillCard } from './SkillCard';
import type { SkillData } from '../../../app/(dashboard)/skills/page';

interface SkillsGridProps {
	skills: SkillData[];
	loading: boolean;
	onSkillClick: (skill: SkillData) => void;
	onCreateSkill: () => void;
	onDeleteSkill?: (skill: SkillData) => void;
}

/**
 * Адаптивная CSS Grid сетка навыков с группировкой по категориям
 * Приоритет CSS Grid над Flexbox согласно архитектурным требованиям
 */
export function SkillsGrid({
	skills,
	loading,
	onSkillClick,
	onCreateSkill,
	onDeleteSkill,
}: SkillsGridProps) {
	// Loading состояние с скелетонами
	if (loading) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-6'>
				<div className='space-y-6'>
					{Array.from({ length: 3 }).map((_, categoryIndex) => (
						<div
							key={categoryIndex}
							className='space-y-4'
						>
							<div className='h-6 bg-subtle rounded w-32 animate-pulse' />
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
								{Array.from({ length: 4 }).map((_, index) => (
									<div
										key={index}
										className='animate-pulse'
									>
										<div className='h-24 bg-subtle rounded-lg mb-2' />
										<div className='h-4 bg-subtle rounded mb-1' />
										<div className='h-3 bg-subtle rounded w-2/3' />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Группировка навыков по категориям
	const skillsByCategories = skills.reduce(
		(groups, skill) => {
			if (!groups[skill.category]) {
				groups[skill.category] = [];
			}
			groups[skill.category]?.push(skill);
			return groups;
		},
		{} as Record<string, SkillData[]>,
	);

	// Сортировка навыков в каждой категории по уровню (убывание)
	Object.keys(skillsByCategories).forEach((category) => {
		skillsByCategories[category]?.sort((a, b) => b.level - a.level);
	});

	// Получаем все уникальные категории из навыков и сортируем их
	const sortedCategories = Object.keys(skillsByCategories).sort((a, b) => {
		// Сортируем по приоритету: Frontend, Backend, затем остальные по алфавиту
		const priority: Record<string, number> = {
			'Frontend': 1,
			'Backend': 2,
		};
		return (priority[a] || 999) - (priority[b] || 999) || a.localeCompare(b);
	});

	// Функция для получения иконки категории
	const getCategoryIcon = (category: string): string => {
		const icons: Record<string, string> = {
			'Frontend': '🎨',
			'Backend': '⚙️',
			'DevOps & Tools': '🚀',
			'DevOps': '🚀',
			'Инструменты': '🛠️',
			'Tools': '🛠️',
		};
		return icons[category] || '💡';
	};

	// Функция для получения цвета категории
	const getCategoryColor = (category: string): string => {
		const colors: Record<string, string> = {
			'Frontend': 'neon',
			'Backend': 'cyan',
			'DevOps & Tools': 'purple-400',
			'DevOps': 'purple-400',
			'Инструменты': 'yellow-400',
			'Tools': 'yellow-400',
		};
		return colors[category] || 'orange-400';
	};

	// Состояние пустых данных
	if (skills.length === 0) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-12 text-center'>
				<div className='text-6xl mb-4'>⚡</div>
				<h3 className='text-xl font-bold text-base mb-2'>
					Навыки не найдены
				</h3>
				<p className='text-soft mb-6'>
					Добавьте первый навык в портфолио
				</p>
				<button
					onClick={onCreateSkill}
					className='px-6 py-3 bg-neon/20 border border-neon text-neon
                   hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                   bevel transition-all duration-300'
				>
					➕ Добавить навык
				</button>
			</div>
		);
	}

	return (
		<div className='bg-panel border border-line rounded-lg bevel p-6'>
			<div className='space-y-8'>
				{sortedCategories.map((category) => {
					const skillsInCategory = skillsByCategories[category];
					const categoryColor = getCategoryColor(category);
					const icon = getCategoryIcon(category);

					if (!skillsInCategory || skillsInCategory.length === 0)
						return null;

					return (
						<div
							key={category}
							className='space-y-4'
						>
							{/* Заголовок категории */}
							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-3'>
									<div className='text-2xl'>{icon}</div>
									<h3
										className={`text-lg font-bold text-${categoryColor} glyph-glow`}
									>
										{category}
									</h3>
									<div className='text-sm text-soft'>
										({skillsInCategory.length} навык
										{skillsInCategory.length === 1 ?
											''
										: skillsInCategory.length < 5 ?
											'а'
										:	'ов'}
										)
									</div>
								</div>

								{/* Средний уровень категории */}
								<div className='flex items-center space-x-2'>
									<span className='text-xs text-soft'>
										Средний уровень:
									</span>
									<span
										className={`text-sm font-bold text-${categoryColor}`}
									>
										{Math.round(
											skillsInCategory.reduce(
												(sum, s) => sum + s.level,
												0,
											) / skillsInCategory.length,
										)}
										%
									</span>
								</div>
							</div>

							{/* CSS Grid сетка навыков */}
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
								{skillsInCategory.map((skill) => (
									<SkillCard
										key={skill.id}
										skill={skill}
										onClick={onSkillClick}
										onDelete={onDeleteSkill}
										categoryColor={categoryColor}
									/>
								))}
							</div>
						</div>
					);
				})}

				{/* Карточка создания нового навыка */}
				<div className='border-t border-line pt-6'>
					<div
						onClick={onCreateSkill}
						className='h-24 bg-subtle/50 border-2 border-dashed border-line
                     hover:border-neon hover:bg-neon/5 rounded-lg
                     flex flex-col items-center justify-center
                     cursor-pointer transition-all duration-300 group'
					>
						<div className='text-2xl mb-2 text-soft group-hover:text-neon transition-colors'>
							➕
						</div>
						<div className='text-sm text-soft group-hover:text-neon transition-colors'>
							Добавить навык
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
