'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { SkillsGrid } from '../../../components/admin/skills/SkillsGrid';
import { SkillForm } from '../../../components/admin/skills/SkillForm';
import { DeleteSkillModal } from '../../../components/admin/skills/DeleteSkillModal';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import { Spinner, SkeletonLoader } from '../../../components/ui/loaders';
import {
	FaBolt,
	FaPlus,
	FaChartBar,
	FaTrophy,
	FaBullseye,
} from 'react-icons/fa';

// Типы данных для навыков
export interface SkillData {
	id: string;
	name: string;
	category: string; // Динамическая категория из БД
	level: number; // 1-100
	icon: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Страница управления навыками портфолио
 * Группировка по категориям, создание, редактирование, удаление навыков
 */
export default function SkillsPage() {
	// Состояние выбранного навыка для редактирования
	const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	// Состояние для удаления навыка
	const [skillToDelete, setSkillToDelete] = useState<SkillData | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Подключаем реальные данные из БД
	const {
		data: skills,
		isLoading,
		refetch: refetchSkills,
	} = api.admin.skills.getAll.useQuery();

	// Статистика навыков
	const { data: skillsStats, isLoading: isStatsLoading } =
		api.admin.skills.getStats.useQuery();

	// API для удаления навыка
	const deleteSkillMutation = api.admin.skills.delete.useMutation({
		onSuccess: () => {
			// Обновляем данные после успешного удаления
			refetchSkills();
			setShowDeleteModal(false);
			setSkillToDelete(null);
		},
		onError: (error) => {
			console.error('Ошибка при удалении навыка:', error);
			// Здесь можно добавить toast уведомление
		},
	});

	// Обрабатываем данные для совместимости с существующими компонентами
	const mockSkills: SkillData[] = (skills || []).map((skill) => ({
		...skill,
		category: skill.category, // Используем категорию как есть из БД
		icon: skill.icon || '',
		createdAt: new Date(),
		updatedAt: new Date(),
	}));
	const stats = {
		total: skillsStats?.totalSkills || 0,
		byCategory: {
			Frontend: skillsStats?.categoryStats?.Frontend || 0,
			Backend: skillsStats?.categoryStats?.Backend || 0,
			DevOps: skillsStats?.categoryStats?.DevOps || 0,
			Tools: skillsStats?.categoryStats?.Tools || 0,
			Other: skillsStats?.categoryStats?.Other || 0,
		},
		averageLevel: skillsStats?.averageLevel || 0,
		expertSkills: skillsStats?.expertSkills || 0,
	};

	// Временный заглушка массив для обратной совместимости - заменим позже на реальные данные:
	const legacyMockSkills: SkillData[] = [
		{
			id: '1',
			name: 'React',
			category: 'Frontend',
			level: 95,
			icon: '⚛️',
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-08-20'),
		},
		{
			id: '2',
			name: 'TypeScript',
			category: 'Frontend',
			level: 90,
			icon: '📘',
			createdAt: new Date('2024-02-10'),
			updatedAt: new Date('2024-08-15'),
		},
		{
			id: '3',
			name: 'Node.js',
			category: 'Backend',
			level: 85,
			icon: '🟢',
			createdAt: new Date('2024-01-20'),
			updatedAt: new Date('2024-07-30'),
		},
		{
			id: '4',
			name: 'PostgreSQL',
			category: 'Backend',
			level: 80,
			icon: '🐘',
			createdAt: new Date('2024-03-05'),
			updatedAt: new Date('2024-08-10'),
		},
		{
			id: '5',
			name: 'Docker',
			category: 'DevOps',
			level: 75,
			icon: '🐳',
			createdAt: new Date('2024-04-12'),
			updatedAt: new Date('2024-08-05'),
		},
		{
			id: '6',
			name: 'AWS',
			category: 'DevOps',
			level: 70,
			icon: '☁️',
			createdAt: new Date('2024-05-18'),
			updatedAt: new Date('2024-08-01'),
		},
	];

	// Обработчик клика по навыку для редактирования
	const handleSkillClick = useCallback((skill: SkillData) => {
		setSelectedSkill(skill);
		setIsCreating(false);
		setShowForm(true);
	}, []);

	// Обработчик создания нового навыка
	const handleCreateSkill = useCallback(() => {
		setSelectedSkill(null);
		setIsCreating(true);
		setShowForm(true);
	}, []);

	// Обработчик закрытия формы
	const handleCloseForm = useCallback(() => {
		setShowForm(false);
		setSelectedSkill(null);
		setIsCreating(false);
	}, []);

	// Обработчик сохранения навыка
	const handleSaveSkill = useCallback(() => {
		// Обновляем данные после сохранения
		refetchSkills();
		setShowForm(false);
		setSelectedSkill(null);
		setIsCreating(false);
	}, [refetchSkills]);

	// Обработчик удаления навыка
	const handleDeleteSkill = useCallback((skill: SkillData) => {
		setSkillToDelete(skill);
		setShowDeleteModal(true);
	}, []);

	// Обработчик подтверждения удаления
	const handleConfirmDelete = useCallback(() => {
		if (skillToDelete) {
			deleteSkillMutation.mutate({ id: skillToDelete.id });
		}
	}, [skillToDelete, deleteSkillMutation]);

	// Обработчик закрытия модального окна удаления
	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteModal(false);
		setSkillToDelete(null);
	}, []);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon
							Icon={FaBolt}
							size={24}
							variant='intense'
						/>
						Управление навыками
					</h1>
					<p className='text-soft text-sm mt-1'>
						Создание и редактирование навыков портфолио
					</p>
				</div>
			</div>

			{/* Статистика навыков */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				{isStatsLoading ?
					// Скелетоны для статистики
					Array.from({ length: 4 }, (_, index) => (
						<div
							key={index}
							className='bg-panel border border-line rounded-lg bevel p-4'
						>
							<div className='flex items-center justify-between'>
								<div className='space-y-2'>
									<SkeletonLoader
										variant='text'
										width='80px'
										height='2rem'
									/>
									<SkeletonLoader
										variant='text'
										width='120px'
										height='0.875rem'
									/>
								</div>
								<SkeletonLoader
									variant='custom'
									width='32px'
									height='32px'
									rounded
								/>
							</div>
						</div>
					))
				:	<>
						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-neon glyph-glow'>
										{stats.total}
									</div>
									<div className='text-sm text-soft'>
										Всего навыков
									</div>
								</div>
								<NeonIcon
									Icon={FaBolt}
									size={32}
									variant='intense'
									className='stats-icon'
								/>
							</div>
						</div>

						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-cyan glyph-glow'>
										{stats.averageLevel}%
									</div>
									<div className='text-sm text-soft'>
										Средний уровень
									</div>
								</div>
								<NeonIcon
									Icon={FaChartBar}
									size={32}
									variant='cyan'
									className='stats-icon'
								/>
							</div>
						</div>

						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-purple-400 glyph-glow'>
										{stats.expertSkills}
									</div>
									<div className='text-sm text-soft'>
										Экспертные (90%+)
									</div>
								</div>
								<NeonIcon
									Icon={FaTrophy}
									size={32}
									variant='purple'
									className='stats-icon'
								/>
							</div>
						</div>

						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-yellow-400 glyph-glow'>
										{
											Object.keys(
												stats.byCategory,
											).filter(
												(category) =>
													stats.byCategory[
														category as keyof typeof stats.byCategory
													] > 0,
											).length
										}
									</div>
									<div className='text-sm text-soft'>
										Категорий
									</div>
								</div>
								<NeonIcon
									Icon={FaBullseye}
									size={32}
									variant='orange'
									className='stats-icon'
								/>
							</div>
						</div>
					</>
				}
			</div>

			{/* Быстрые действия */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<h2 className='text-xl font-bold text-base'>
						Управление навыками
					</h2>
					<div className='flex items-center space-x-2 text-sm text-soft'>
						{Object.entries(stats.byCategory).map(
							([category, count]) =>
								count > 0 && (
									<span
										key={category}
										className='px-2 py-1 bg-subtle border border-line rounded'
									>
										{category}: {count}
									</span>
								),
						)}
					</div>
				</div>

				<button
					onClick={handleCreateSkill}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300'
				>
					<NeonIcon
						Icon={FaPlus}
						size={16}
						variant='default'
					/>
					Добавить навык
				</button>
			</div>

			{/* Сетка навыков */}
			{isLoading ?
				<div className='flex items-center justify-center min-h-[400px]'>
					<Spinner
						size='large'
						label='Загрузка навыков...'
						variant='inline'
					/>
				</div>
			:	<SkillsGrid
					skills={mockSkills}
					loading={isLoading}
					onSkillClick={handleSkillClick}
					onCreateSkill={handleCreateSkill}
					onDeleteSkill={handleDeleteSkill}
				/>
			}

			{/* Форма создания/редактирования навыка */}
			{showForm && (
				<SkillForm
					skill={selectedSkill}
					isCreating={isCreating}
					onClose={handleCloseForm}
					onSave={handleSaveSkill}
				/>
			)}

			{/* Модальное окно подтверждения удаления */}
			<DeleteSkillModal
				skill={skillToDelete}
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				isDeleting={deleteSkillMutation.isPending}
			/>
		</div>
	);
}
