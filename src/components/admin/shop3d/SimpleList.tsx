import React from 'react';
import { NeonIcon } from '../../ui/NeonIcon';
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

interface SimpleListProps<T> {
	items: T[];
	loading?: boolean;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	onToggleActive?: (item: T) => void;
	renderItem: (item: T) => {
		title: string;
		subtitle?: string;
		badge?: string;
		isActive?: boolean;
	};
}

export function SimpleList<T extends { id: string }>({
	items,
	loading = false,
	onEdit,
	onDelete,
	onToggleActive,
	renderItem,
}: SimpleListProps<T>) {
	if (loading) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-6'>
				<div className='space-y-3'>
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className='animate-pulse bg-subtle rounded-lg p-4 h-16'
						/>
					))}
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-12 text-center'>
				<p className='text-soft'>Нет данных для отображения</p>
			</div>
		);
	}

	return (
		<div className='bg-panel border border-line rounded-lg bevel overflow-hidden'>
			<div className='divide-y divide-line'>
				{items.map((item) => {
					const {
						title,
						subtitle,
						badge,
						isActive = true,
					} = renderItem(item);

					return (
						<div
							key={item.id}
							className='p-4 hover:bg-hover transition-colors flex items-center justify-between group'
						>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-3'>
									<h3 className='font-medium text-base truncate'>
										{title}
									</h3>
									{badge && (
										<span className='px-2 py-1 text-xs font-mono bg-neon/20 text-neon border border-neon/50 rounded'>
											{badge}
										</span>
									)}
									{!isActive && (
										<span className='px-2 py-1 text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/50 rounded'>
											НЕАКТИВЕН
										</span>
									)}
								</div>
								{subtitle && (
									<p className='text-sm text-soft mt-1 truncate'>
										{subtitle}
									</p>
								)}
							</div>

							<div className='flex items-center gap-2 ml-4'>
								{onToggleActive && (
									<button
										onClick={() => onToggleActive(item)}
										className='p-2 rounded hover:bg-subtle transition-colors'
										title={
											isActive ? 'Деактивировать' : (
												'Активировать'
											)
										}
									>
										<NeonIcon
											Icon={isActive ? FaEye : FaEyeSlash}
											size={16}
											variant={
												isActive ? 'default' : 'subtle'
											}
										/>
									</button>
								)}
								{onEdit && (
									<button
										onClick={() => onEdit(item)}
										className='p-2 rounded hover:bg-subtle transition-colors'
										title='Редактировать'
									>
										<NeonIcon
											Icon={FaEdit}
											size={16}
											variant='cyan'
										/>
									</button>
								)}
								{onDelete && (
									<button
										onClick={() => onDelete(item)}
										className='p-2 rounded hover:bg-red-500/20 transition-colors'
										title='Удалить'
									>
										<NeonIcon
											Icon={FaTrash}
											size={16}
											variant='red'
										/>
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
