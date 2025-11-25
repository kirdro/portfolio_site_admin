'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../../utils/api';
import { SimpleList } from '../../../../components/admin/shop3d/SimpleList';
import { SimpleFormModal } from '../../../../components/admin/shop3d/SimpleFormModal';
import { NeonIcon } from '../../../../components/ui/NeonIcon';
import { FaPlus, FaTags } from 'react-icons/fa';

interface Tag {
	id: string;
	name: string;
	description: string | null;
	color: string | null;
	isActive: boolean;
}

interface FormData {
	name: string;
	description: string;
	color: string;
	isActive: boolean;
}

/**
 * Страница управления тегами товаров
 * CRUD операции для тегов магазина
 */
export default function TagsPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Tag | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		description: '',
		color: '#00FF99',
		isActive: true,
	});

	// API запросы
	const { data: tags, isLoading, refetch } = api.shop3d.tags.getAll.useQuery();
	const createMutation = api.shop3d.tags.create.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const updateMutation = api.shop3d.tags.update.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const deleteMutation = api.shop3d.tags.delete.useMutation({
		onSuccess: refetch,
	});

	// Сброс формы
	const resetForm = useCallback(() => {
		setFormData({
			name: '',
			description: '',
			color: '#00FF99',
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
	const handleEdit = useCallback((item: Tag) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			description: item.description || '',
			color: item.color || '#00FF99',
			isActive: item.isActive,
		});
		setIsFormOpen(true);
	}, []);

	// Удаление
	const handleDelete = useCallback(
		(item: Tag) => {
			if (confirm(`Удалить тег "${item.name}"?`)) {
				deleteMutation.mutate({ id: item.id });
			}
		},
		[deleteMutation],
	);

	// Переключение активности
	const handleToggleActive = useCallback(
		(item: Tag) => {
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
				color: formData.color.trim(),
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
						<NeonIcon Icon={FaTags} size={24} variant='intense' />
						Теги товаров
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление тегами для классификации продуктов
					</p>
				</div>

				<button
					onClick={handleCreate}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2 cursor-pointer'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить тег
				</button>
			</div>

			{/* Список тегов */}
			<SimpleList
				items={tags || []}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				renderItem={(item: Tag) => ({
					title: item.name,
					subtitle: item.description || undefined,
					badge: item.color || undefined,
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
				title={editingItem ? 'Редактировать тег' : 'Новый тег'}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			>
				<div className='space-y-4'>
					{/* Название */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Название тега *
						</label>
						<input
							type='text'
							value={formData.name}
							onChange={(e) => handleFieldChange('name', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='Популярное'
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
							placeholder='Описание тега...'
							rows={3}
						/>
					</div>

					{/* Цвет */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Цвет тега *
						</label>
						<div className='flex gap-3 items-center'>
							<input
								type='color'
								value={formData.color}
								onChange={(e) => handleFieldChange('color', e.target.value)}
								className='h-10 w-20 rounded border border-line bg-subtle cursor-pointer'
							/>
							<input
								type='text'
								value={formData.color}
								onChange={(e) => handleFieldChange('color', e.target.value)}
								className='flex-1 px-3 py-2 bg-subtle border border-line rounded-md
                         text-base focus:border-neon focus:outline-none
                         transition-colors font-mono'
								placeholder='#00FF99'
								pattern='^#[0-9A-Fa-f]{6}$'
								required
							/>
						</div>
						<p className='text-xs text-soft mt-1'>
							Используйте HEX формат (например: #00FF99)
						</p>
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
							Тег активен
						</label>
					</div>
				</div>
			</SimpleFormModal>
		</div>
	);
}
