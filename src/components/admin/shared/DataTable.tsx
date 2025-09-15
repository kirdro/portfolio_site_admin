'use client';

import React, { useMemo } from 'react';
import { type ReactNode, useCallback, useState } from 'react';
import { SkeletonLoader, Spinner } from '../../ui/loaders';

// Типы для колонок таблицы
export interface DataTableColumn<T> {
	key: string;
	header: string;
	// Рендер функция для ячейки (следуем архитектурным требованиям)
	render: (item: T, index: number) => ReactNode;
	sortable?: boolean;
	className?: string;
}

// Пропсы для DataTable компонента
interface DataTableProps<T> {
	data: T[];
	columns: DataTableColumn<T>[];
	loading?: boolean;
	emptyMessage?: string;
	onRowClick?: (item: T, index: number) => void;
	className?: string;
	sortingLoading?: boolean; // Индикатор загрузки при сортировке
	pagination?: {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		loading?: boolean; // Индикатор загрузки при переключении страниц
	};
}

/**
 * Универсальный компонент таблицы для админ-панели
 * Поддерживает сортировку, пагинацию, custom рендеры
 * @param T - тип данных в таблице
 */
export function DataTable<T>({
	data,
	columns,
	loading = false,
	sortingLoading = false,
	emptyMessage = 'Нет данных для отображения',
	onRowClick,
	className = '',
	pagination,
}: DataTableProps<T>) {
	const [sortKey, setSortKey] = useState<string>('');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	// Обработчик клика по заголовку (сортировка)
	const обработчикСортировки = useCallback(
		(key: string) => {
			if (!columns.find((col) => col.key === key)?.sortable) return;

			if (sortKey === key) {
				setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
			} else {
				setSortKey(key);
				setSortDirection('asc');
			}
		},
		[columns, sortKey],
	);

	// Обработчик клика по строке
	const обработчикКликаСтроки = useCallback(
		(item: T, index: number) => {
			onRowClick?.(item, index);
		},
		[onRowClick],
	);

	// Сортированные данные (мемоизируем для производительности)
	const отсортированныеДанные = useMemo(() => {
		if (!sortKey) return data;

		return [...data].sort((a: any, b: any) => {
			const aValue = a[sortKey];
			const bValue = b[sortKey];

			if (aValue === bValue) return 0;

			const isAscending = sortDirection === 'asc';
			if (aValue < bValue) return isAscending ? -1 : 1;
			return isAscending ? 1 : -1;
		});
	}, [data, sortKey, sortDirection]);

	// Показываем состояние загрузки
	if (loading) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel'>
				<div className='overflow-x-auto'>
					<table className='min-w-full'>
						<thead className='bg-subtle'>
							<tr>
								{columns.map((column) => (
									<th
										key={column.key}
										className='px-6 py-3 text-left text-xs font-medium text-soft uppercase tracking-wider'
									>
										{column.header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{/* Улучшенные скелетоны для загрузки */}
							{Array.from({ length: 5 }, (_, rowIndex) => (
								<tr
									key={rowIndex}
									className='border-t border-line'
								>
									{columns.map((column, colIndex) => (
										<td
											key={column.key}
											className='px-6 py-4 whitespace-nowrap'
										>
											{/* Различные типы скелетонов в зависимости от колонки */}
											{colIndex === 0 ?
												<div className='flex items-center space-x-3'>
													<SkeletonLoader
														variant='avatar'
														width='32px'
														height='32px'
													/>
													<SkeletonLoader
														variant='text'
														width='120px'
														height='1rem'
													/>
												</div>
											: colIndex === columns.length - 1 ?
												<div className='flex space-x-2'>
													<SkeletonLoader
														variant='custom'
														width='60px'
														height='24px'
														rounded
													/>
													<SkeletonLoader
														variant='custom'
														width='60px'
														height='24px'
														rounded
													/>
												</div>
											:	<SkeletonLoader
													variant='text'
													width={
														Math.random() > 0.5 ?
															'100px'
														:	'80px'
													}
													height='1rem'
												/>
											}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	// Показываем сообщение если нет данных
	if (!отсортированныеДанные.length) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-8 text-center'>
				<div className='text-soft text-lg'>{emptyMessage}</div>
				<div className='text-soft/60 text-sm mt-2'>
					Попробуйте изменить фильтры поиска
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-panel border border-line rounded-lg bevel ${className}`}
		>
			<div className='overflow-x-auto'>
				<table className='min-w-full'>
					<thead className='bg-subtle'>
						<tr>
							{columns.map((column) => (
								<th
									key={column.key}
									onClick={() =>
										обработчикСортировки(column.key)
									}
									className={`
                    px-6 py-3 text-left text-xs font-medium text-soft uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-hover transition-colors' : ''}
                    ${column.className || ''}
                  `}
								>
									<div className='flex items-center space-x-2'>
										<span>{column.header}</span>
										{column.sortable &&
											((
												sortingLoading &&
												sortKey === column.key
											) ?
												<Spinner
													size='small'
													variant='inline'
													className='ml-1'
												/>
											:	<div className='flex flex-col'>
													<div
														className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] mb-0.5
                              ${
									(
										sortKey === column.key &&
										sortDirection === 'asc'
									) ?
										'border-b-neon'
									:	'border-b-soft/40'
								}`}
													></div>
													<div
														className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px]
                              ${
									(
										sortKey === column.key &&
										sortDirection === 'desc'
									) ?
										'border-t-neon'
									:	'border-t-soft/40'
								}`}
													></div>
												</div>)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-line'>
						{отсортированныеДанные.map((item, index) => (
							<tr
								key={index}
								onClick={() =>
									обработчикКликаСтроки(item, index)
								}
								className={`
                  bg-panel hover:bg-hover transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
							>
								{columns.map((column) => (
									<td
										key={column.key}
										className={`px-6 py-4 whitespace-nowrap text-sm text-base ${column.className || ''}`}
									>
										{column.render(item, index)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Пагинация */}
			{pagination && (
				<div className='bg-subtle px-6 py-3 flex items-center justify-between border-t border-line'>
					<div className='text-sm text-soft'>
						Страница {pagination.currentPage} из{' '}
						{pagination.totalPages}
					</div>
					{pagination.loading ?
						<div className='flex items-center gap-2'>
							<Spinner
								size='small'
								variant='inline'
							/>
							<span className='text-xs text-soft'>
								Загрузка...
							</span>
						</div>
					:	<div className='flex space-x-2'>
							<button
								onClick={() =>
									pagination.onPageChange(
										pagination.currentPage - 1,
									)
								}
								disabled={pagination.currentPage <= 1}
								className='px-3 py-1 text-xs font-medium bg-panel border border-line rounded-md
                           hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors text-soft'
							>
								Назад
							</button>
							<button
								onClick={() =>
									pagination.onPageChange(
										pagination.currentPage + 1,
									)
								}
								disabled={
									pagination.currentPage >=
									pagination.totalPages
								}
								className='px-3 py-1 text-xs font-medium bg-panel border border-line rounded-md
                           hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors text-soft'
							>
								Вперед
							</button>
						</div>
					}
				</div>
			)}
		</div>
	);
}
