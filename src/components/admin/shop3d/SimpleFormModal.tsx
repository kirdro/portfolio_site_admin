import React, { type ReactNode } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal';
import { NeonIcon } from '../../ui/NeonIcon';
import { FaSave, FaTimes } from 'react-icons/fa';

interface SimpleFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	title: string;
	children: ReactNode;
	isSubmitting?: boolean;
}

export function SimpleFormModal({
	isOpen,
	onClose,
	onSubmit,
	title,
	children,
	isSubmitting = false,
}: SimpleFormModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size='md'>
			<form onSubmit={onSubmit}>
				<ModalHeader>{title}</ModalHeader>

				<ModalBody>{children}</ModalBody>

				<ModalFooter>
					<button
						type='button'
						onClick={onClose}
						className='px-4 py-2 bg-subtle border border-line text-soft
                     hover:border-base rounded-md font-medium
                     transition-all duration-300 flex items-center gap-2'
						disabled={isSubmitting}
					>
						<NeonIcon Icon={FaTimes} size={16} variant='subtle' />
						Отмена
					</button>

					<button
						type='submit'
						className='px-4 py-2 bg-neon/20 border border-neon text-neon
                     hover:bg-neon/30 hover:shadow-neon rounded-md font-medium
                     bevel transition-all duration-300 flex items-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed'
						disabled={isSubmitting}
					>
						<NeonIcon Icon={FaSave} size={16} variant='default' />
						{isSubmitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</ModalFooter>
			</form>
		</Modal>
	);
}
