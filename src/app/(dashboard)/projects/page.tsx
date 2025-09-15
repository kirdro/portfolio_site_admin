'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { ProjectsGrid } from '../../../components/admin/projects/ProjectsGrid';
import { ProjectForm } from '../../../components/admin/projects/ProjectForm';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import { Spinner, SkeletonLoader } from '../../../components/ui/loaders';
import { FaFolder, FaPlus } from 'react-icons/fa';

// Типы данных для проектов
export interface ProjectData {
	id: string;
	title: string;
	description: string;
	imageUrl: string | null;
	demoUrl: string | null;
	githubUrl: string | null;
	featured: boolean;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Страница управления проектами портфолио
 * Отображает сетку проектов с возможностью создания, редактирования и удаления
 */
export default function ProjectsPage() {
	const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
		null,
	);
	const [isCreating, setIsCreating] = useState(false);

	// Подключаем реальные данные из БД
	const {
		data: projectsData,
		isLoading,
		refetch: refetchProjects,
	} = api.admin.projects.getAll.useQuery({
		limit: 20,
		offset: 0,
	});

	// Статистика проектов
	const { data: projectStats, isLoading: isStatsLoading } =
		api.admin.projects.getStats.useQuery();

	// Обработчики событий (используем useCallback для оптимизации)
	const handleSelectProject = useCallback((project: ProjectData) => {
		setSelectedProject(project);
	}, []);

	const handleCreateProject = useCallback(() => {
		setIsCreating(true);
	}, []);

	const handleCloseForm = useCallback(() => {
		setSelectedProject(null);
		setIsCreating(false);
	}, []);

	const handleSaveProject = useCallback(() => {
		// Обновляем данные после сохранения
		refetchProjects();
		setSelectedProject(null);
		setIsCreating(false);
	}, [refetchProjects]);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon
							Icon={FaFolder}
							size={24}
							variant='intense'
						/>
						Управление проектами
					</h1>
					<p className='text-soft text-sm mt-1'>
						Создание и редактирование проектов портфолио
					</p>
				</div>

				{/* Быстрое создание */}
				<button
					onClick={handleCreateProject}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md text-sm font-medium
                     bevel transition-all duration-300'
				>
					<NeonIcon
						Icon={FaPlus}
						size={16}
						variant='default'
					/>
					Создать проект
				</button>
			</div>

			{/* Статистика проектов */}
			<div className='bg-panel border border-line rounded-lg bevel p-4'>
				{isStatsLoading ?
					<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
						{Array.from({ length: 5 }, (_, index) => (
							<div
								key={index}
								className='text-center space-y-2'
							>
								<SkeletonLoader
									variant='text'
									width='60px'
									height='1.5rem'
								/>
								<SkeletonLoader
									variant='text'
									width='80px'
									height='0.75rem'
								/>
							</div>
						))}
					</div>
				:	<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
						<div className='text-center'>
							<div className='text-neon font-mono text-xl glyph-glow'>
								{projectStats?.totalProjects || 0}
							</div>
							<div className='text-soft text-xs'>Всего</div>
						</div>
						<div className='text-center'>
							<div className='text-cyan font-mono text-xl'>
								{projectStats?.featuredProjects || 0}
							</div>
							<div className='text-soft text-xs'>Избранные</div>
						</div>
						<div className='text-center'>
							<div className='text-green-400 font-mono text-xl'>
								{projectStats?.regularProjects || 0}
							</div>
							<div className='text-soft text-xs'>
								Опубликованы
							</div>
						</div>
						<div className='text-center'>
							<div className='text-yellow-400 font-mono text-xl'>
								{0}
							</div>
							<div className='text-soft text-xs'>Черновики</div>
						</div>
						<div className='text-center'>
							<div className='text-purple-400 font-mono text-xl'>
								{projectStats?.projectsLast30Days || 0}
							</div>
							<div className='text-soft text-xs'>За месяц</div>
						</div>
					</div>
				}
			</div>

			{/* Сетка проектов */}
			<ProjectsGrid
				projects={(projectsData?.projects || []).map((project) => ({
					...project,
					createdAt: new Date(project.createdAt),
					updatedAt: new Date(project.updatedAt),
				}))}
				loading={isLoading}
				onProjectClick={handleSelectProject}
				onCreateProject={handleCreateProject}
			/>

			{/* Форма редактирования/создания проекта */}
			<ProjectForm
				project={selectedProject}
				isCreating={isCreating}
				isOpen={!!(selectedProject || isCreating)}
				onClose={handleCloseForm}
				onSave={handleSaveProject}
			/>
		</div>
	);
}
