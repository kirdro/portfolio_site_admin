import React from 'react';
import { ProjectCard } from './ProjectCard';
import type { ProjectData } from '../../../app/(dashboard)/projects/page';

interface ProjectsGridProps {
	projects: ProjectData[];
	loading: boolean;
	onProjectClick: (project: ProjectData) => void;
	onCreateProject: () => void;
}

/**
 * Адаптивная сетка проектов с CSS Grid
 * Приоритет CSS Grid над Flexbox согласно архитектурным требованиям
 * Оптимизировано с React.memo для предотвращения лишних рендеров
 */
export const ProjectsGrid = React.memo(function ProjectsGrid({
	projects,
	loading,
	onProjectClick,
	onCreateProject,
}: ProjectsGridProps) {
	// Loading состояние с скелетонами
	if (loading) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{Array.from({ length: 8 }).map((_, index) => (
						<div
							key={index}
							className='animate-pulse'
						>
							<div className='aspect-video bg-subtle rounded-lg mb-3' />
							<div className='h-4 bg-subtle rounded mb-2' />
							<div className='h-3 bg-subtle rounded w-2/3' />
						</div>
					))}
				</div>
			</div>
		);
	}

	// Состояние пустых данных
	if (projects.length === 0) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-12 text-center'>
				<div className='text-6xl mb-4'>📁</div>
				<h3 className='text-xl font-bold text-base mb-2'>
					Проекты не найдены
				</h3>
				<p className='text-soft mb-6'>
					Создайте первый проект для портфолио
				</p>
				<button
					onClick={onCreateProject}
					className='px-6 py-3 bg-neon/20 border border-neon text-neon
                   hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                   bevel transition-all duration-300'
				>
					➕ Создать проект
				</button>
			</div>
		);
	}

	return (
		<div className='bg-panel border border-line rounded-lg bevel p-6'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-lg font-bold text-base'>
					Проекты портфолио ({projects.length})
				</h2>

				{/* Фильтры и сортировка */}
				<div className='flex items-center space-x-3'>
					<select
						className='px-3 py-1 bg-subtle border border-line rounded text-sm
                           focus:border-neon transition-colors'
					>
						<option value='all'>Все проекты</option>
						<option value='featured'>Избранные</option>
						<option value='draft'>Черновики</option>
					</select>

					<select
						className='px-3 py-1 bg-subtle border border-line rounded text-sm
                           focus:border-neon transition-colors'
					>
						<option value='newest'>Сначала новые</option>
						<option value='oldest'>Сначала старые</option>
						<option value='featured'>Избранные первыми</option>
					</select>
				</div>
			</div>

			{/* CSS Grid сетка - приоритет над Flexbox */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
				{projects.map((project) => (
					<ProjectCard
						key={project.id}
						project={project}
						onClick={onProjectClick}
					/>
				))}

				{/* Карточка создания нового проекта */}
				<div
					onClick={onCreateProject}
					className='aspect-video bg-subtle/50 border-2 border-dashed border-line
                   hover:border-neon hover:bg-neon/5 rounded-lg
                   flex flex-col items-center justify-center
                   cursor-pointer transition-all duration-300 group'
				>
					<div className='text-3xl mb-2 text-soft group-hover:text-neon transition-colors'>
						➕
					</div>
					<div className='text-sm text-soft group-hover:text-neon transition-colors'>
						Создать проект
					</div>
				</div>
			</div>

			{/* Пагинация если нужна */}
			{projects.length > 12 && (
				<div className='flex justify-center mt-6'>
					<div className='flex items-center space-x-2'>
						<button
							className='px-3 py-1 bg-subtle border border-line rounded text-sm
                             hover:border-neon transition-colors'
						>
							← Предыдущие
						</button>
						<span className='text-sm text-soft px-3'>
							Страница 1 из 3
						</span>
						<button
							className='px-3 py-1 bg-subtle border border-line rounded text-sm
                             hover:border-neon transition-colors'
						>
							Следующие →
						</button>
					</div>
				</div>
			)}
		</div>
	);
});
