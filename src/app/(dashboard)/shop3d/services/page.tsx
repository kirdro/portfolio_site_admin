'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../../utils/api';
import { SimpleList } from '../../../../components/admin/shop3d/SimpleList';
import { SimpleFormModal } from '../../../../components/admin/shop3d/SimpleFormModal';
import { FileUploadDeferred } from '../../../../components/ui/FileUploadDeferred';
import { NeonIcon } from '../../../../components/ui/NeonIcon';
import { FaPlus, FaWrench, FaRubleSign, FaImage } from 'react-icons/fa';

interface Service {
	id: string;
	name: string;
	description: string | null;
	priceFrom: number;
	imageUrl: string | null;
	isActive: boolean;
}

interface FormData {
	name: string;
	description: string;
	priceFrom: string;
	imageUrl: string;
	isActive: boolean;
}

/**
 * Страница управления услугами 3D печати
 * CRUD операции для услуг магазина
 */
export default function ServicesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Service | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		description: '',
		priceFrom: '',
		imageUrl: '',
		isActive: true,
	});

	// API запросы
	const { data: services, isLoading, refetch } = api.shop3d.services.getAll.useQuery();
	const uploadFile = api.files.upload.useMutation();
	const createMutation = api.shop3d.services.create.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const updateMutation = api.shop3d.services.update.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const deleteMutation = api.shop3d.services.delete.useMutation({
		onSuccess: refetch,
	});

	// Сброс формы
	const resetForm = useCallback(() => {
		setFormData({
			name: '',
			description: '',
			priceFrom: '',
			imageUrl: '',
			isActive: true,
		});
		setEditingItem(null);
		setSelectedFile(null);
	}, []);

	// Открытие формы создания
	const handleCreate = useCallback(() => {
		resetForm();
		setIsFormOpen(true);
	}, [resetForm]);

	// Открытие формы редактирования
	const handleEdit = useCallback((item: Service) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			description: item.description || '',
			priceFrom: item.priceFrom.toString(),
			imageUrl: item.imageUrl || '',
			isActive: item.isActive,
		});
		setIsFormOpen(true);
	}, []);

	// Удаление
	const handleDelete = useCallback(
		(item: Service) => {
			if (confirm(`Удалить услугу "${item.name}"?`)) {
				deleteMutation.mutate({ id: item.id });
			}
		},
		[deleteMutation],
	);

	// Переключение активности
	const handleToggleActive = useCallback(
		(item: Service) => {
			updateMutation.mutate({
				id: item.id,
				data: { isActive: !item.isActive },
			});
		},
		[updateMutation],
	);

	// Отправка формы
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			const priceFrom = parseFloat(formData.priceFrom);
			if (isNaN(priceFrom) || priceFrom < 0) {
				alert('Укажите корректную цену');
				return;
			}

			let imageUrl = formData.imageUrl;

			// Загружаем файл, если он выбран
			if (selectedFile) {
				try {
					const fileBase64 = await new Promise<string>((resolve) => {
						const reader = new FileReader();
						reader.onloadend = () => {
							const base64 = reader.result as string;
							resolve(base64.split(',')[1] || '');
						};
						reader.readAsDataURL(selectedFile);
					});

					const uploadResult = await uploadFile.mutateAsync({
						file: fileBase64,
						fileName: selectedFile.name,
						mimeType: selectedFile.type,
						category: 'project',
					});

					imageUrl = uploadResult.url;
				} catch (error) {
					console.error('Ошибка загрузки файла:', error);
					alert('Ошибка при загрузке изображения');
					return;
				}
			}

			const data = {
				name: formData.name.trim(),
				description: formData.description.trim() || null,
				priceFrom,
				imageUrl: imageUrl?.trim() || null,
				isActive: formData.isActive,
			};

			if (editingItem) {
				updateMutation.mutate({ id: editingItem.id, data });
			} else {
				createMutation.mutate(data);
			}
		},
		[formData, editingItem, createMutation, updateMutation, selectedFile, uploadFile],
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
						<NeonIcon Icon={FaWrench} size={24} variant='intense' />
						Услуги 3D печати
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление услугами интернет-магазина
					</p>
				</div>

				<button
					onClick={handleCreate}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2 cursor-pointer'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить услугу
				</button>
			</div>

			{/* Список услуг */}
			<SimpleList
				items={services || []}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				renderItem={(item: Service) => ({
					title: item.name,
					subtitle: item.description || undefined,
					badge: `от ${item.priceFrom} ₽`,
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
				title={editingItem ? 'Редактировать услугу' : 'Новая услуга'}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			>
				<div className='space-y-4'>
					{/* Название */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Название услуги *
						</label>
						<input
							type='text'
							value={formData.name}
							onChange={(e) => handleFieldChange('name', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='Печать на 3D принтере'
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
							placeholder='Детальное описание услуги...'
							rows={3}
						/>
					</div>

					{/* Цена от */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Цена от (₽) *
						</label>
						<div className='relative'>
							<input
								type='number'
								value={formData.priceFrom}
								onChange={(e) => handleFieldChange('priceFrom', e.target.value)}
								className='w-full px-3 py-2 pr-10 bg-subtle border border-line rounded-md
                         text-base focus:border-neon focus:outline-none
                         transition-colors'
								placeholder='500'
								min='0'
								step='0.01'
								required
							/>
							<div className='absolute right-3 top-1/2 -translate-y-1/2 text-soft'>
								<NeonIcon Icon={FaRubleSign} size={14} variant='subtle' />
							</div>
						</div>
					</div>

					{/* Изображение */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							<FaImage className='inline mr-2' />
							Изображение услуги
						</label>
						<FileUploadDeferred
							onFileSelected={(file, previewUrl) => {
								setSelectedFile(file);
								if (!file && editingItem?.imageUrl) {
									handleFieldChange('imageUrl', editingItem.imageUrl);
								}
							}}
							currentFileUrl={editingItem?.imageUrl || formData.imageUrl || undefined}
							category='project'
							acceptedTypes='image/*'
							preview={true}
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
							Услуга активна
						</label>
					</div>
				</div>
			</SimpleFormModal>
		</div>
	);
}
