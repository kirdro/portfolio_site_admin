'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../../utils/api';
import { SimpleList } from '../../../../components/admin/shop3d/SimpleList';
import { SimpleFormModal } from '../../../../components/admin/shop3d/SimpleFormModal';
import { NeonIcon } from '../../../../components/ui/NeonIcon';
import { FaPlus, FaBox } from 'react-icons/fa';

interface Category {
	id: string;
	name: string;
	description: string | null;
	isActive: boolean;
}

interface FormData {
	name: string;
	description: string;
	isActive: boolean;
}

/**
 * Страница управления категориями товаров
 * CRUD операции для категорий магазина
 */
export default function CategoriesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Category | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		description: '',
		isActive: true,
	});

	// API запросы
	const { data: categories, isLoading, refetch } = api.shop3d.categories.getAll.useQuery();
	const createMutation = api.shop3d.categories.create.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const updateMutation = api.shop3d.categories.update.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const deleteMutation = api.shop3d.categories.delete.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	// Сброс формы
	const resetForm = useCallback(() => {
		setFormData({
			name: '',
			description: '',
			isActive: true,
		});
		setEditingItem(null);
	}, []);

	// Открытие формы создания
	const handleCreate = useCallback(() => {
		resetForm();
		setIsFormOpen(true);
	}, [resetForm]);

	// Открытие формы редактирования
	const handleEdit = useCallback((item: Category) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			description: item.description || '',
			isActive: item.isActive,
		});
		setIsFormOpen(true);
	}, []);

	// Удаление
	const handleDelete = useCallback(
		(item: Category) => {
			if (confirm(`Удалить категорию "${item.name}"?`)) {
				deleteMutation.mutate({ id: item.id });
			}
		},
		[deleteMutation],
	);

	// Переключение активности
	const handleToggleActive = useCallback(
		(item: Category) => {
			updateMutation.mutate({
				id: item.id,
				isActive: !item.isActive,
			});
		},
		[updateMutation],
	);

	// Отправка формы
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const data = {
				name: formData.name.trim(),
				description: formData.description.trim() || undefined,
				isActive: formData.isActive,
			};

			if (editingItem) {
				updateMutation.mutate({ id: editingItem.id, ...data });
			} else {
				createMutation.mutate(data);
			}
		},
		[formData, editingItem, createMutation, updateMutation],
	);

	// Изменение поля формы
	const handleFieldChange = useCallback(
		(field: keyof FormData, value: string | boolean) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon Icon={FaBox} size={24} variant='intense' />
						Категории товаров
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление категориями продуктов магазина
					</p>
				</div>

				<button
					onClick={handleCreate}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2 cursor-pointer'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить категорию
				</button>
			</div>

			{/* Список категорий */}
			<SimpleList
				items={categories || []}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				renderItem={(item: Category) => ({
					title: item.name,
					subtitle: item.description || undefined,
					isActive: item.isActive,
				})}
			/>

			{/* Модальное окно формы */}
			<SimpleFormModal
				isOpen={isFormOpen}
				onClose={() => {
					setIsFormOpen(false);
					resetForm();
				}}
				onSubmit={handleSubmit}
				title={editingItem ? 'Редактировать категорию' : 'Новая категория'}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			>
				<div className='space-y-4'>
					{/* Название */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Название категории *
						</label>
						<input
							type='text'
							value={formData.name}
							onChange={(e) => handleFieldChange('name', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='Декоративные изделия'
							required
						/>
					</div>

					{/* Описание */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Описание
						</label>
						<textarea
							value={formData.description}
							onChange={(e) => handleFieldChange('description', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors resize-none'
							placeholder='Описание категории товаров...'
							rows={3}
						/>
					</div>

					{/* Активность */}
					<div className='flex items-center gap-2'>
						<input
							type='checkbox'
							id='isActive'
							checked={formData.isActive}
							onChange={(e) => handleFieldChange('isActive', e.target.checked)}
							className='w-4 h-4 rounded border-line bg-subtle
                       text-neon focus:ring-neon focus:ring-offset-0
                       transition-colors cursor-pointer'
						/>
						<label htmlFor='isActive' className='text-sm text-soft cursor-pointer'>
							Категория активна
						</label>
					</div>
				</div>
			</SimpleFormModal>
		</div>
	);
}
