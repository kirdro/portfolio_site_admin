'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { Product3DGrid } from '../../../components/admin/shop3d/Product3DGrid';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import { Spinner, SkeletonLoader } from '../../../components/ui/loaders';
import {
	FaCube,
	FaPlus,
	FaChartBar,
	FaBox,
	FaEye,
	FaRubleSign,
} from 'react-icons/fa';

// Типы данных для 3D продуктов
export interface Product3DData {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	category?: string | null;
	quantity?: number | null;
	isActive: boolean;
	files?: Array<{
		id: string;
		s3Url: string;
		originalName: string;
	}>;
}

/**
 * Страница управления 3D магазином
 * Управление продуктами, категориями и статистикой
 */
export default function Shop3DPage() {
	// Состояние выбранного продукта для редактирования
	const [selectedProduct, setSelectedProduct] = useState<Product3DData | null>(
		null,
	);

	// Состояние фильтрации
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
		undefined,
	);
	const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
		undefined,
	);

	// Подключаем реальные данные из БД
	const {
		data: productsData,
		isLoading,
		refetch: refetchProducts,
	} = api.shop3d.getAll.useQuery({
		limit: 50,
		offset: 0,
		category: categoryFilter,
		isActive: activeFilter,
	});

	// Статистика магазина
	const { data: shopStats, isLoading: isStatsLoading } =
		api.shop3d.getStats.useQuery();

	// Категории
	const { data: categories } = api.shop3d.getCategories.useQuery();

	// Обработчик клика по продукту
	const handleProductClick = useCallback((product: Product3DData) => {
		setSelectedProduct(product);
		// TODO: Открыть модальное окно редактирования
		console.log('Selected product:', product);
	}, []);

	// Обработчик создания нового продукта
	const handleCreateProduct = useCallback(() => {
		// TODO: Открыть форму создания продукта
		console.log('Create new product');
	}, []);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon Icon={FaCube} size={24} variant='intense' />
						3D Магазин
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление продуктами интернет-магазина 3D деталей
					</p>
				</div>
			</div>

			{/* Статистика магазина */}
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
						{/* Всего продуктов */}
						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-neon glyph-glow'>
										{shopStats?.totalProducts || 0}
									</div>
									<div className='text-sm text-soft'>
										Всего продуктов
									</div>
								</div>
								<NeonIcon
									Icon={FaCube}
									size={32}
									variant='intense'
								/>
							</div>
						</div>

						{/* Активные продукты */}
						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-cyan glyph-glow'>
										{shopStats?.activeProducts || 0}
									</div>
									<div className='text-sm text-soft'>
										Активные
									</div>
								</div>
								<NeonIcon Icon={FaEye} size={32} variant='cyan' />
							</div>
						</div>

						{/* Категории */}
						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-purple-400 glyph-glow'>
										{shopStats?.categories || 0}
									</div>
									<div className='text-sm text-soft'>
										Категорий
									</div>
								</div>
								<NeonIcon
									Icon={FaBox}
									size={32}
									variant='purple'
								/>
							</div>
						</div>

						{/* Общая стоимость */}
						<div className='bg-panel border border-line rounded-lg bevel p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='text-2xl font-bold text-yellow-400 glyph-glow'>
										{shopStats?.totalValue?.toFixed(0) || 0}
									</div>
									<div className='text-sm text-soft'>
										Общая стоимость (₽)
									</div>
								</div>
								<NeonIcon
									Icon={FaRubleSign}
									size={32}
									variant='orange'
								/>
							</div>
						</div>
					</>
				}
			</div>

			{/* Фильтры и действия */}
			<div className='flex items-center justify-between gap-4 flex-wrap'>
				<div className='flex items-center space-x-4'>
					<h2 className='text-xl font-bold text-base'>
						Управление продуктами
					</h2>

					{/* Фильтр по категориям */}
					{categories && categories.length > 0 && (
						<div className='flex items-center space-x-2 text-sm'>
							<button
								onClick={() => setCategoryFilter(undefined)}
								className={`px-3 py-1 rounded border transition-all ${
									categoryFilter === undefined ?
										'bg-neon/20 border-neon text-neon'
									:	'bg-subtle border-line text-soft hover:border-neon'
								}`}
							>
								Все
							</button>
							{categories.slice(0, 5).map((cat) => (
								<button
									key={cat.name}
									onClick={() => setCategoryFilter(cat.name)}
									className={`px-3 py-1 rounded border transition-all ${
										categoryFilter === cat.name ?
											'bg-cyan/20 border-cyan text-cyan'
										:	'bg-subtle border-line text-soft hover:border-cyan'
									}`}
								>
									{cat.name} ({cat.count})
								</button>
							))}
						</div>
					)}
				</div>

				{/* Кнопка создания */}
				<button
					onClick={handleCreateProduct}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить продукт
				</button>
			</div>

			{/* Сетка продуктов */}
			{isLoading ?
				<div className='flex items-center justify-center min-h-[400px]'>
					<Spinner
						size='large'
						label='Загрузка продуктов...'
						variant='inline'
					/>
				</div>
			:	<Product3DGrid
					products={productsData?.products || []}
					loading={isLoading}
					onProductClick={handleProductClick}
				/>
			}

			{/* TODO: Добавить модальное окно для создания/редактирования продукта */}
			{/* TODO: Добавить модальное окно для удаления продукта */}
		</div>
	);
}
