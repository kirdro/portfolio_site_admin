'use client';

import React, { useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import { UserStatusBadge } from './UserStatusBadge';
import { Spinner } from '../../ui/loaders';

// Типы для данных пользователя
interface UserFormData {
	id: string;
	name: string;
	email: string;
	role: 'USER' | 'ADMIN';
	image?: string | null;
	_count?: {
		projects: number;
		generalMessages: number;
		aiMessages: number;
	};
}

// Пропсы для UserForm
interface UserFormProps {
	user: UserFormData;
	onClose: () => void;
	onSave?: (updatedUser: UserFormData) => void;
}

/**
 * Форма редактирования пользователя
 * Позволяет изменять роль и блокировать/разблокировать пользователя
 */
export function UserForm({ user, onClose, onSave }: UserFormProps) {
	const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN'>(
		user.role,
	);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [actionType, setActionType] = useState<'role' | 'block' | null>(null);

	// Мутации tRPC
	const updateRoleMutation = api.admin.users.updateRole.useMutation();
	const toggleBlockMutation = api.admin.users.toggleBlock.useMutation();

	// Получаем активность пользователя
	const { data: активность } = api.admin.users.getActivity.useQuery({
		userId: user.id,
		days: 30,
	});

	// Обработчик изменения роли
	const обработчикИзмененияРоли = useCallback((newRole: 'USER' | 'ADMIN') => {
		setSelectedRole(newRole);
		setActionType('role');
		setShowConfirmation(true);
	}, []);

	// Обработчик блокировки/разблокировки
	const обработчикБлокировки = useCallback(() => {
		setActionType('block');
		setShowConfirmation(true);
	}, []);

	// Подтверждение действия
	const подтвердитьДействие = useCallback(async () => {
		if (actionType === 'role') {
			try {
				await updateRoleMutation.mutateAsync({
					userId: user.id,
					role: selectedRole,
				});

				onSave?.({ ...user, role: selectedRole });
				onClose();
			} catch (error) {
				console.error('Ошибка при изменении роли:', error);
				alert('Не удалось изменить роль пользователя');
			}
		} else if (actionType === 'block') {
			try {
				await toggleBlockMutation.mutateAsync({
					userId: user.id,
				});

				// Заглушка - функция блокировки не реализована
				console.log('Блокировка пользователя будет добавлена позже');
				onClose();
			} catch (error) {
				console.error('Ошибка при блокировке/разблокировке:', error);
				alert('Не удалось изменить статус блокировки');
			}
		}

		setShowConfirmation(false);
		setActionType(null);
	}, [
		actionType,
		selectedRole,
		user,
		updateRoleMutation,
		toggleBlockMutation,
		onSave,
		onClose,
	]);

	// Отмена действия
	const отменитьДействие = useCallback(() => {
		setSelectedRole(user.role);
		setShowConfirmation(false);
		setActionType(null);
	}, [user.role]);

	return (
		<div className='fixed inset-0 bg-bg/90 flex items-center justify-center z-50'>
			<div className='bg-panel border border-line rounded-lg bevel shadow-neon max-w-2xl w-full m-4'>
				{/* Заголовок */}
				<div className='flex items-center justify-between p-6 border-b border-line'>
					<h2 className='text-xl font-bold text-neon glyph-glow'>
						Редактирование пользователя
					</h2>
					<button
						onClick={onClose}
						className='text-soft hover:text-base transition-colors'
					>
						<svg
							className='w-6 h-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>

				{/* Основная информация */}
				<div className='p-6 space-y-6'>
					{/* Профиль пользователя */}
					<div className='flex items-center space-x-4'>
						<div className='flex-shrink-0'>
							{user.image ?
								<img
									className='h-16 w-16 rounded-full border-2 border-neon shadow-neon'
									src={user.image}
									alt={`Аватар ${user.name}`}
								/>
							:	<div className='h-16 w-16 rounded-full bg-subtle border-2 border-neon flex items-center justify-center shadow-neon'>
									<span className='text-2xl font-bold text-neon glyph-glow'>
										{user.name.charAt(0).toUpperCase()}
									</span>
								</div>
							}
						</div>
						<div className='flex-1 min-w-0'>
							<h3 className='text-lg font-medium text-base'>
								{user.name}
							</h3>
							<p className='text-sm text-soft'>{user.email}</p>
							<div className='mt-2'>
								<UserStatusBadge
									role={user.role}
									isBlocked={false}
								/>
							</div>
						</div>
					</div>

					{/* Статистика активности */}
					{активность && (
						<div className='grid grid-cols-2 gap-4'>
							<div className='bg-subtle p-4 rounded-lg border border-line'>
								<div className='text-sm text-soft'>
									Активность за 30 дней
								</div>
								<div className='mt-2 space-y-1'>
									<div className='flex justify-between'>
										<span className='text-xs text-soft'>
											Проекты:
										</span>
										<span className='text-xs text-neon font-mono glyph-glow'>
											{активность.summary.projectsCreated}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-xs text-soft'>
											Сообщения:
										</span>
										<span className='text-xs text-cyan font-mono'>
											{активность.summary
												.messagesGeneral +
												активность.summary.messagesAi}
										</span>
									</div>
								</div>
							</div>
							<div className='bg-subtle p-4 rounded-lg border border-line'>
								<div className='text-sm text-soft'>
									Общая статистика
								</div>
								<div className='mt-2 space-y-1'>
									<div className='flex justify-between'>
										<span className='text-xs text-soft'>
											Всего проектов:
										</span>
										<span className='text-xs text-neon font-mono glyph-glow'>
											{user._count?.projects || 0}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-xs text-soft'>
											Всего сообщений:
										</span>
										<span className='text-xs text-cyan font-mono'>
											{(user._count?.generalMessages ||
												0) +
												(user._count?.aiMessages || 0)}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Управление ролью */}
					<div className='space-y-3'>
						<label className='block text-sm font-medium text-base'>
							Роль пользователя:
						</label>
						<div className='flex space-x-4'>
							<button
								onClick={() => обработчикИзмененияРоли('USER')}
								className={`px-4 py-2 rounded-md border transition-all bevel
                  ${
						selectedRole === 'USER' ?
							'bg-cyan/20 border-cyan text-cyan shadow-neon'
						:	'bg-panel border-line text-soft hover:border-cyan'
					}`}
							>
								👤 Пользователь
							</button>
							<button
								onClick={() => обработчикИзмененияРоли('ADMIN')}
								className={`px-4 py-2 rounded-md border transition-all bevel
                  ${
						selectedRole === 'ADMIN' ?
							'bg-neon/20 border-neon text-neon shadow-neon glyph-glow'
						:	'bg-panel border-line text-soft hover:border-neon'
					}`}
							>
								⚡ Администратор
							</button>
						</div>
					</div>

					{/* Блокировка пользователя */}
					<div className='space-y-3'>
						<label className='block text-sm font-medium text-base'>
							Доступ к системе:
						</label>
						<button
							onClick={обработчикБлокировки}
							className='px-4 py-2 rounded-md border transition-all bevel bg-gray-500/20 border-gray-500 text-gray-400 cursor-not-allowed'
							disabled
						>
							🚧 Функция блокировки будет добавлена позже
						</button>
					</div>
				</div>

				{/* Подтверждение действий */}
				{showConfirmation && (
					<div className='bg-subtle border-t border-line p-6'>
						<div className='text-sm text-soft mb-4'>
							{actionType === 'role' && (
								<>
									Вы уверены, что хотите изменить роль
									пользователя на "
									{selectedRole === 'ADMIN' ?
										'Администратор'
									:	'Пользователь'}
									"?
								</>
							)}
							{actionType === 'block' && (
								<>
									Функция блокировки/разблокировки будет
									добавлена в следующих версиях
								</>
							)}
						</div>
						<div className='flex space-x-3'>
							<button
								onClick={подтвердитьДействие}
								disabled={
									updateRoleMutation.isPending ||
									toggleBlockMutation.isPending
								}
								className='px-4 py-2 bg-neon/20 border border-neon text-neon rounded-md
                         hover:bg-neon/30 transition-colors bevel shadow-neon
                         disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{(
									updateRoleMutation.isPending ||
									toggleBlockMutation.isPending
								) ?
									<div className='flex items-center gap-2'>
										<Spinner
											size='small'
											variant='inline'
										/>
										<span>Сохранение...</span>
									</div>
								:	'Подтвердить'}
							</button>
							<button
								onClick={отменитьДействие}
								className='px-4 py-2 bg-panel border border-line text-soft rounded-md
                         hover:bg-hover transition-colors bevel'
							>
								Отмена
							</button>
						</div>
					</div>
				)}

				{/* Кнопки управления */}
				{!showConfirmation && (
					<div className='bg-subtle border-t border-line px-6 py-3 flex justify-end space-x-3'>
						<button
							onClick={onClose}
							className='px-4 py-2 bg-panel border border-line text-soft rounded-md
                       hover:bg-hover transition-colors bevel'
						>
							Закрыть
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
