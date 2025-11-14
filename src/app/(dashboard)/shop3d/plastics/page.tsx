'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../../utils/api';
import { SimpleList } from '../../../../components/admin/shop3d/SimpleList';
import { SimpleFormModal } from '../../../../components/admin/shop3d/SimpleFormModal';
import { NeonIcon } from '../../../../components/ui/NeonIcon';
import { FaPlus, FaFlask, FaRubleSign } from 'react-icons/fa';

interface Plastic {
	id: string;
	name: string;
	material: string;
	color: string;
	colorHex: string | null;
	pricePerGram: number | null;
	characteristics: string | null;
	isActive: boolean;
}

interface FormData {
	name: string;
	material: string;
	color: string;
	colorHex: string;
	pricePerGram: string;
	characteristics: string;
	isActive: boolean;
}

/**
 * Страница управления пластиками для 3D печати
 * CRUD операции для типов пластиков
 */
export default function PlasticsPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Plastic | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		material: '',
		color: '',
		colorHex: '',
		pricePerGram: '',
		characteristics: '',
		isActive: true,
	});

	// API запросы
	const { data: plastics, isLoading, refetch } = api.shop3d.plastics.getAll.useQuery();
	const createMutation = api.shop3d.plastics.create.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const updateMutation = api.shop3d.plastics.update.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const deleteMutation = api.shop3d.plastics.delete.useMutation({
		onSuccess: refetch,
	});

	// Сброс формы
	const resetForm = useCallback(() => {
		setFormData({
			name: '',
			material: '',
			color: '',
			colorHex: '',
			pricePerGram: '',
			characteristics: '',
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
	const handleEdit = useCallback((item: Plastic) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			material: item.material,
			color: item.color,
			colorHex: item.colorHex || '',
			pricePerGram: item.pricePerGram?.toString() || '',
			characteristics: item.characteristics || '',
			isActive: item.isActive,
		});
		setIsFormOpen(true);
	}, []);

	// Удаление
	const handleDelete = useCallback(
		(item: Plastic) => {
			if (confirm(`Удалить пластик "${item.name}"?`)) {
				deleteMutation.mutate({ id: item.id });
			}
		},
		[deleteMutation],
	);

	// Переключение активности
	const handleToggleActive = useCallback(
		(item: Plastic) => {
			updateMutation.mutate({
				id: item.id,
				data: { isActive: !item.isActive },
			});
		},
		[updateMutation],
	);

	// Отправка формы
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			// Валидация цены
			let pricePerGram: number | null = null;
			if (formData.pricePerGram.trim()) {
				pricePerGram = parseFloat(formData.pricePerGram);
				if (isNaN(pricePerGram) || pricePerGram < 0) {
					alert('Укажите корректную цену за грамм');
					return;
				}
			}

			const data = {
				name: formData.name.trim(),
				material: formData.material.trim(),
				color: formData.color.trim(),
				colorHex: formData.colorHex.trim() || null,
				pricePerGram,
				characteristics: formData.characteristics.trim() || null,
				isActive: formData.isActive,
			};

			if (editingItem) {
				updateMutation.mutate({ id: editingItem.id, data });
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
						<NeonIcon Icon={FaFlask} size={24} variant='intense' />
						Пластики для 3D печати
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление типами пластиков и их характеристиками
					</p>
				</div>

				<button
					onClick={handleCreate}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить пластик
				</button>
			</div>

			{/* Список пластиков */}
			<SimpleList
				items={plastics || []}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				renderItem={(item: Plastic) => ({
					title: `${item.name} (${item.material})`,
					subtitle: `Цвет: ${item.color}${item.pricePerGram ? ` • ${item.pricePerGram} ₽/г` : ''}`,
					badge: item.colorHex || undefined,
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
				title={editingItem ? 'Редактировать пластик' : 'Новый пластик'}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			>
				<div className='space-y-4'>
					{/* Название */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Название *
						</label>
						<input
							type='text'
							value={formData.name}
							onChange={(e) => handleFieldChange('name', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='PLA Белый'
							required
						/>
					</div>

					{/* Материал */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Материал *
						</label>
						<input
							type='text'
							value={formData.material}
							onChange={(e) => handleFieldChange('material', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='PLA'
							required
						/>
					</div>

					{/* Цвет */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Цвет *
						</label>
						<input
							type='text'
							value={formData.color}
							onChange={(e) => handleFieldChange('color', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='Белый'
							required
						/>
					</div>

					{/* HEX код цвета */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							HEX код цвета
						</label>
						<div className='flex gap-3 items-center'>
							<input
								type='color'
								value={formData.colorHex || '#FFFFFF'}
								onChange={(e) => handleFieldChange('colorHex', e.target.value)}
								className='h-10 w-20 rounded border border-line bg-subtle cursor-pointer'
							/>
							<input
								type='text'
								value={formData.colorHex}
								onChange={(e) => handleFieldChange('colorHex', e.target.value)}
								className='flex-1 px-3 py-2 bg-subtle border border-line rounded-md
                         text-base focus:border-neon focus:outline-none
                         transition-colors font-mono'
								placeholder='#FFFFFF'
								pattern='^#[0-9A-Fa-f]{6}$'
							/>
						</div>
					</div>

					{/* Цена за грамм */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Цена за грамм (₽)
						</label>
						<div className='relative'>
							<input
								type='number'
								value={formData.pricePerGram}
								onChange={(e) => handleFieldChange('pricePerGram', e.target.value)}
								className='w-full px-3 py-2 pr-10 bg-subtle border border-line rounded-md
                         text-base focus:border-neon focus:outline-none
                         transition-colors'
								placeholder='0.50'
								min='0'
								step='0.01'
							/>
							<div className='absolute right-3 top-1/2 -translate-y-1/2 text-soft'>
								<NeonIcon Icon={FaRubleSign} size={14} variant='subtle' />
							</div>
						</div>
					</div>

					{/* Характеристики */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Характеристики (JSON)
						</label>
						<textarea
							value={formData.characteristics}
							onChange={(e) => handleFieldChange('characteristics', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors resize-none font-mono text-sm'
							placeholder='{"temperature": 200, "strength": "high"}'
							rows={4}
						/>
						<p className='text-xs text-soft mt-1'>
							Характеристики в формате JSON для расширенной информации
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
							Пластик активен
						</label>
					</div>
				</div>
			</SimpleFormModal>
		</div>
	);
}
