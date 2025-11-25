'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../../utils/api';
import { SimpleList } from '../../../../components/admin/shop3d/SimpleList';
import { SimpleFormModal } from '../../../../components/admin/shop3d/SimpleFormModal';
import { NeonIcon } from '../../../../components/ui/NeonIcon';
import { FaPlus, FaAddressBook, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Contact {
	id: string;
	type: string;
	label: string;
	value: string;
	icon: string | null;
	isActive: boolean;
	order: number;
}

interface FormData {
	type: string;
	label: string;
	value: string;
	icon: string;
	isActive: boolean;
	order: string;
}

/**
 * Страница управления контактами магазина
 * CRUD операции для контактной информации
 */
export default function ContactsPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Contact | null>(null);
	const [formData, setFormData] = useState<FormData>({
		type: '',
		label: '',
		value: '',
		icon: '',
		isActive: true,
		order: '0',
	});

	// API запросы
	const { data: contacts, isLoading, refetch } = api.shop3d.contacts.getAll.useQuery();
	const createMutation = api.shop3d.contacts.create.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const updateMutation = api.shop3d.contacts.update.useMutation({
		onSuccess: () => {
			refetch();
			setIsFormOpen(false);
			resetForm();
		},
	});
	const deleteMutation = api.shop3d.contacts.delete.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	// Сброс формы
	const resetForm = useCallback(() => {
		setFormData({
			type: '',
			label: '',
			value: '',
			icon: '',
			isActive: true,
			order: '0',
		});
		setEditingItem(null);
	}, []);

	// Открытие формы создания
	const handleCreate = useCallback(() => {
		resetForm();
		setIsFormOpen(true);
	}, [resetForm]);

	// Открытие формы редактирования
	const handleEdit = useCallback((item: Contact) => {
		setEditingItem(item);
		setFormData({
			type: item.type,
			label: item.label,
			value: item.value,
			icon: item.icon || '',
			isActive: item.isActive,
			order: item.order.toString(),
		});
		setIsFormOpen(true);
	}, []);

	// Удаление
	const handleDelete = useCallback(
		(item: Contact) => {
			if (confirm(`Удалить контакт "${item.label}"?`)) {
				deleteMutation.mutate({ id: item.id });
			}
		},
		[deleteMutation],
	);

	// Переключение активности
	const handleToggleActive = useCallback(
		(item: Contact) => {
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

			const order = parseInt(formData.order, 10);
			if (isNaN(order)) {
				alert('Укажите корректный порядок отображения');
				return;
			}

			if (editingItem) {
				updateMutation.mutate({
					id: editingItem.id,
					type: formData.type.trim(),
					label: formData.label.trim(),
					value: formData.value.trim(),
					icon: formData.icon.trim() || undefined,
					isActive: formData.isActive,
					order,
				});
			} else {
				createMutation.mutate({
					type: formData.type.trim(),
					label: formData.label.trim(),
					value: formData.value.trim(),
					icon: formData.icon.trim() || undefined,
					isActive: formData.isActive,
					order,
				});
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

	// Сортировка контактов по порядку
	const sortedContacts = [...(contacts || [])].sort((a, b) => a.order - b.order);

	return (
		<div className='space-y-6'>
			{/* Заголовок страницы */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold text-neon glyph-glow flex items-center gap-2'>
						<NeonIcon Icon={FaAddressBook} size={24} variant='intense' />
						Контактная информация
					</h1>
					<p className='text-soft text-sm mt-1'>
						Управление контактами для связи с магазином
					</p>
				</div>

				<button
					onClick={handleCreate}
					className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2 cursor-pointer'
				>
					<NeonIcon Icon={FaPlus} size={16} variant='default' />
					Добавить контакт
				</button>
			</div>

			{/* Список контактов */}
			<SimpleList
				items={sortedContacts}
				loading={isLoading}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleActive={handleToggleActive}
				renderItem={(item: Contact) => ({
					title: `${item.label} (${item.type})`,
					subtitle: item.value,
					badge: `#${item.order}`,
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
				title={editingItem ? 'Редактировать контакт' : 'Новый контакт'}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			>
				<div className='space-y-4'>
					{/* Тип */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Тип контакта *
						</label>
						<input
							type='text'
							value={formData.type}
							onChange={(e) => handleFieldChange('type', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='phone, email, telegram, whatsapp'
							required
						/>
						<p className='text-xs text-soft mt-1'>
							Тип контакта (phone, email, telegram, whatsapp и т.д.)
						</p>
					</div>

					{/* Название */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Название *
						</label>
						<input
							type='text'
							value={formData.label}
							onChange={(e) => handleFieldChange('label', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='Телефон для заказов'
							required
						/>
					</div>

					{/* Значение */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Значение *
						</label>
						<input
							type='text'
							value={formData.value}
							onChange={(e) => handleFieldChange('value', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='+7 (999) 123-45-67'
							required
						/>
					</div>

					{/* Иконка */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Иконка (React Icons)
						</label>
						<input
							type='text'
							value={formData.icon}
							onChange={(e) => handleFieldChange('icon', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors font-mono'
							placeholder='FaPhone'
						/>
						<p className='text-xs text-soft mt-1'>
							Название иконки из библиотеки React Icons (например: FaPhone, FaEnvelope)
						</p>
					</div>

					{/* Порядок отображения */}
					<div>
						<label className='block text-sm font-medium text-soft mb-2'>
							Порядок отображения *
						</label>
						<input
							type='number'
							value={formData.order}
							onChange={(e) => handleFieldChange('order', e.target.value)}
							className='w-full px-3 py-2 bg-subtle border border-line rounded-md
                       text-base focus:border-neon focus:outline-none
                       transition-colors'
							placeholder='0'
							min='0'
							required
						/>
						<p className='text-xs text-soft mt-1'>
							Чем меньше число, тем выше в списке отображается контакт
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
							Контакт активен
						</label>
					</div>
				</div>
			</SimpleFormModal>
		</div>
	);
}
