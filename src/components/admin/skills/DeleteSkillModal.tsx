'use client';

import React from 'react';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import type { SkillData } from '../../../app/(dashboard)/skills/page';

interface DeleteSkillModalProps {
	skill: SkillData | null;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isDeleting?: boolean;
}

/**
 * Модальное окно подтверждения удаления навыка
 * Киберпанк дизайн с предупреждением
 */
export function DeleteSkillModal({
	skill,
	isOpen,
	onClose,
	onConfirm,
	isDeleting = false,
}: DeleteSkillModalProps) {
	if (!isOpen || !skill) return null;

	return (
		<div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
			<div className='bg-panel border border-red-500 rounded-lg bevel max-w-md w-full overflow-hidden'>
				{/* Заголовок */}
				<div className='bg-red-500/20 border-b border-red-500 p-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-3'>
							<div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
								<FaExclamationTriangle className='text-white' size={16} />
							</div>
							<h3 className='text-lg font-bold text-red-400 glyph-glow'>
								Подтверждение удаления
							</h3>
						</div>
						<button
							onClick={onClose}
							disabled={isDeleting}
							className='w-8 h-8 bg-subtle hover:bg-red-500/20 border border-line hover:border-red-400
							         rounded transition-all duration-200 flex items-center justify-center
							         disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<FaTimes size={14} />
						</button>
					</div>
				</div>

				{/* Содержимое */}
				<div className='p-6'>
					<div className='text-center space-y-4'>
						{/* Иконка навыка */}
						<div className='text-4xl mb-4'>{skill.icon}</div>

						{/* Предупреждающий текст */}
						<div className='space-y-2'>
							<p className='text-base text-base'>
								Вы действительно хотите удалить навык
							</p>
							<p className='text-lg font-bold text-neon glyph-glow'>
								"{skill.name}"?
							</p>
							<p className='text-sm text-soft'>
								Это действие нельзя отменить. Навык будет удален из базы данных навсегда.
							</p>
						</div>

						{/* Информация о навыке */}
						<div className='bg-subtle border border-line rounded-lg p-3 text-left'>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span className='text-soft'>Категория:</span>
									<span className='text-base'>{skill.category}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-soft'>Уровень:</span>
									<span className='text-base font-bold'>{skill.level}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Кнопки действий */}
				<div className='border-t border-line p-4 flex space-x-3'>
					<button
						onClick={onClose}
						disabled={isDeleting}
						className='flex-1 px-4 py-2 bg-subtle border border-line text-base
						         hover:bg-line hover:border-soft rounded-md transition-all duration-200
						         disabled:opacity-50 disabled:cursor-not-allowed'
					>
						Отмена
					</button>
					<button
						onClick={onConfirm}
						disabled={isDeleting}
						className='flex-1 px-4 py-2 bg-red-500/20 border border-red-500 text-red-500
						         hover:bg-red-500/30 hover:shadow-red-500 hover:text-white rounded-md font-medium
						         bevel transition-all duration-200 flex items-center justify-center space-x-2
						         disabled:opacity-50 disabled:cursor-not-allowed glyph-glow'
					>
						{isDeleting ? (
							<>
								<div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
								<span>Удаление...</span>
							</>
						) : (
							<>
								<FaTrash size={14} />
								<span>Удалить навык</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}