'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { FileUploadDeferred } from '../../ui/FileUploadDeferred';
import { Modal } from '../../ui/Modal';
import { NeonIcon } from '../../ui/NeonIcon';
import { CyberpunkSelect } from '../../ui/CyberpunkSelect';
import {
	FaCube,
	FaSave,
	FaTimes,
	FaImage,
	FaTag,
	FaBox,
	FaClock,
} from 'react-icons/fa';
import { type Product3DData } from '../../../app/(dashboard)/shop3d/products/page';

interface ProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	product?: Product3DData | null;
	onSave: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
	isOpen,
	onClose,
	product,
	onSave,
}) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: 0,
		categoryId: '',
		productionTime: 1,
		isActive: true,
		isFeatured: false,
		characteristics: {},
	});

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedPlastics, setSelectedPlastics] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const { data: categories } = api.shop3d.categories.getAll.useQuery();
	const { data: plastics } = api.shop3d.plastics.getAll.useQuery();
	const { data: tags } = api.shop3d.tags.getAll.useQuery();

	const uploadFile = api.files.upload.useMutation();
	const createProduct = api.shop3d.products.create.useMutation();
	const updateProduct = api.shop3d.products.update.useMutation();

	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name,
				description: product.description || '',
				price: product.price,
				categoryId: product.category?.id || product.categoryId || '',
				productionTime: 1,
				isActive: product.isActive,
				isFeatured: product.isFeatured || false,
				characteristics: {},
			});
			// Устанавливаем выбранные пластики и теги
			setSelectedPlastics(product.plastics?.map(p => p.plastic.id) || []);
			setSelectedTags(product.tags?.map(t => t.id) || []);
		} else {
			setFormData({
				name: '',
				description: '',
				price: 0,
				categoryId: '',
				productionTime: 1,
				isActive: true,
				isFeatured: false,
				characteristics: {},
			});
			setSelectedPlastics([]);
			setSelectedTags([]);
		}
	}, [product]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let imageUrls: string[] = [];

			// Загружаем файл, если он выбран
			if (selectedFile) {
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

				imageUrls = [uploadResult.url];
			}

			// Если загружено новое изображение, используем его
			// Иначе сохраняем существующие изображения
			const finalImages = imageUrls.length > 0 ? imageUrls : (product?.images || []);

			const productData = {
				name: formData.name,
				description: formData.description || undefined,
				price: formData.price,
				categoryId: formData.categoryId || undefined,
				productionTime: formData.productionTime,
				isActive: formData.isActive,
				isFeatured: formData.isFeatured,
				characteristics: formData.characteristics,
				images: finalImages,
				tagIds: selectedTags,
				plasticIds: selectedPlastics,
			};

			if (product?.id) {
				await updateProduct.mutateAsync({
					id: product.id,
					...productData,
				});
			} else {
				await createProduct.mutateAsync(productData);
			}

			onSave();
			onClose();
		} catch (error) {
			console.error('Ошибка при сохранении продукта:', error);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size='xl'>
			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon Icon={FaCube} size={24} variant='intense' />
						{product ? 'Редактировать продукт' : 'Новый продукт'}
					</h2>
					<button
						type='button'
						onClick={onClose}
						className='p-2 hover:bg-subtle rounded transition-colors'
					>
						<FaTimes className='text-soft' />
					</button>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<div className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-base mb-1'>
								Название продукта *
							</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className='w-full px-3 py-2 bg-subtle border border-line rounded
                         text-base placeholder-soft focus:border-neon focus:outline-none'
								required
								placeholder='Введите название продукта'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-base mb-1'>
								Описание
							</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className='w-full px-3 py-2 bg-subtle border border-line rounded
                         text-base placeholder-soft focus:border-neon focus:outline-none'
								rows={4}
								placeholder='Описание продукта'
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium text-base mb-1'>
									Цена (₽) *
								</label>
								<input
									type='number'
									value={formData.price || ''}
									onChange={(e) => {
										const value = e.target.value;
										const numValue = value === '' ? 0 : parseFloat(value);
										setFormData({
											...formData,
											price: isNaN(numValue) ? 0 : numValue,
										});
									}}
									className='w-full px-3 py-2 bg-subtle border border-line rounded
                           text-base placeholder-soft focus:border-neon focus:outline-none'
									required
									min='0'
									step='0.01'
									placeholder='0.00'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-base mb-1'>
									Время производства (дни)
								</label>
								<div className='flex items-center gap-2'>
									<FaClock className='text-soft' />
									<input
										type='number'
										value={formData.productionTime || ''}
										onChange={(e) => {
											const value = e.target.value;
											const numValue = value === '' ? 1 : parseInt(value);
											setFormData({
												...formData,
												productionTime: isNaN(numValue) ? 1 : numValue,
											});
										}}
										className='w-full px-3 py-2 bg-subtle border border-line rounded
                             text-base placeholder-soft focus:border-neon focus:outline-none'
										min='1'
										placeholder='1'
									/>
								</div>
							</div>
						</div>

						<CyberpunkSelect
							label='Категория'
							value={formData.categoryId}
							onChange={(e) =>
								setFormData({ ...formData, categoryId: e.target.value })
							}
							options={categories?.map(cat => ({
								value: cat.id,
								label: cat.name
							})) || []}
							placeholder='Выберите категорию'
						/>

						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								Пластики для печати
							</label>
							<div className='space-y-2 max-h-32 overflow-y-auto bg-subtle p-2 rounded border border-line'>
								{plastics?.map((plastic) => (
									<label
										key={plastic.id}
										className='flex items-center gap-2 cursor-pointer hover:bg-bg/50 p-1 rounded'
									>
										<input
											type='checkbox'
											checked={selectedPlastics.includes(plastic.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedPlastics([...selectedPlastics, plastic.id]);
												} else {
													setSelectedPlastics(
														selectedPlastics.filter((id) => id !== plastic.id),
													);
												}
											}}
											className='accent-neon'
										/>
										<span className='text-sm text-base'>
											{plastic.name} {plastic.pricePerGram ? `(${(plastic.pricePerGram * 1000).toFixed(0)}₽/кг)` : ''}
										</span>
									</label>
								))}
							</div>
						</div>
					</div>

					<div className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								<FaImage className='inline mr-2' />
								Изображение продукта
							</label>
							<FileUploadDeferred
								onFileSelected={(file, previewUrl) => {
									setSelectedFile(file);
								}}
								currentFileUrl={product?.images?.[0]}
								category='project'
								acceptedTypes='image/*'
								preview={true}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-base mb-2'>
								<FaTag className='inline mr-2' />
								Теги
							</label>
							<div className='space-y-2 max-h-32 overflow-y-auto bg-subtle p-2 rounded border border-line'>
								{tags?.map((tag) => (
									<label
										key={tag.id}
										className='flex items-center gap-2 cursor-pointer hover:bg-bg/50 p-1 rounded'
									>
										<input
											type='checkbox'
											checked={selectedTags.includes(tag.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedTags([...selectedTags, tag.id]);
												} else {
													setSelectedTags(
														selectedTags.filter((id) => id !== tag.id),
													);
												}
											}}
											className='accent-neon'
										/>
										<div
											className='w-4 h-4 rounded'
											style={{ backgroundColor: tag.color || '#00FF99' }}
										/>
										<span className='text-sm text-base'>{tag.name}</span>
									</label>
								))}
							</div>
						</div>

						<div className='flex items-center gap-4'>
							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									checked={formData.isActive}
									onChange={(e) =>
										setFormData({ ...formData, isActive: e.target.checked })
									}
									className='accent-neon'
								/>
								<span className='text-sm text-base'>Активный продукт</span>
							</label>

							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									checked={formData.isFeatured}
									onChange={(e) =>
										setFormData({ ...formData, isFeatured: e.target.checked })
									}
									className='accent-cyan'
								/>
								<span className='text-sm text-base'>Рекомендуемый</span>
							</label>
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-3 pt-4 border-t border-line'>
					<button
						type='button'
						onClick={onClose}
						className='px-4 py-2 bg-subtle border border-line text-soft
                     hover:bg-bg hover:text-base rounded transition-colors'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={createProduct.isPending || updateProduct.isPending}
						className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2'
					>
						<FaSave />
						{createProduct.isPending || updateProduct.isPending ?
							'Сохранение...'
						:	'Сохранить'}
					</button>
				</div>
			</form>
		</Modal>
	);
};