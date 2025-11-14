import React from 'react';
import { NeonIcon } from '../../ui/NeonIcon';
import { FaCube, FaBox, FaEye, FaEyeSlash } from 'react-icons/fa';

interface Product3DCardProps {
	product: {
		id: string;
		name: string;
		description?: string | null;
		price: number;
		category?: { id: string; name: string } | string | null;
		quantity?: number | null;
		isActive: boolean;
		files?: Array<{
			id: string;
			s3Url: string;
			originalName: string;
		}>;
	};
	onClick?: () => void;
}

export const Product3DCard = React.memo(function Product3DCard({
	product,
	onClick,
}: Product3DCardProps) {
	// Get first image if available
	const imageUrl = product.files?.[0]?.s3Url;

	return (
		<div
			onClick={onClick}
			className='bg-subtle border border-line rounded-lg bevel overflow-hidden
                 hover:border-neon hover:shadow-neon transition-all duration-300
                 cursor-pointer group relative'
		>
			{/* Status Badge */}
			<div className='absolute top-3 right-3 z-10'>
				<div
					className={`
            flex items-center gap-1 px-2 py-1 rounded text-xs font-mono
            ${product.isActive ? 'bg-neon/20 text-neon border border-neon/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}
          `}
				>
					<NeonIcon
						Icon={product.isActive ? FaEye : FaEyeSlash}
						size={12}
						variant={product.isActive ? 'default' : 'red'}
					/>
					<span>{product.isActive ? 'АКТИВЕН' : 'СКРЫТ'}</span>
				</div>
			</div>

			{/* Image Preview */}
			<div className='relative h-48 bg-bg overflow-hidden'>
				{imageUrl ?
					<img
						src={imageUrl}
						alt={product.name}
						className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
					/>
				:	<div className='w-full h-full flex items-center justify-center'>
						<NeonIcon Icon={FaCube} size={48} variant='subtle' />
					</div>
				}
				{/* Hover Overlay */}
				<div className='absolute inset-0 bg-neon/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
			</div>

			{/* Content */}
			<div className='p-4 space-y-3'>
				{/* Title */}
				<h3 className='font-bold text-base group-hover:text-neon transition-colors truncate'>
					{product.name}
				</h3>

				{/* Description */}
				{product.description && (
					<p className='text-soft text-sm line-clamp-2'>
						{product.description}
					</p>
				)}

				{/* Category */}
				{product.category && (
					<div className='flex items-center gap-2'>
						<NeonIcon Icon={FaBox} size={14} variant='subtle' />
						<span className='text-xs text-soft font-mono'>
							{typeof product.category === 'object' ? product.category.name : product.category}
						</span>
					</div>
				)}

				{/* Footer - Price & Quantity */}
				<div className='flex items-center justify-between pt-2 border-t border-line'>
					{/* Price */}
					<div className='flex items-center gap-1'>
						<span className='text-2xl font-bold text-neon glyph-glow'>
							{product.price.toFixed(2)}
						</span>
						<span className='text-sm text-soft'>₽</span>
					</div>

					{/* Quantity */}
					{product.quantity !== null && product.quantity !== undefined && (
						<div className='text-sm font-mono'>
							<span className='text-soft'>В наличии:</span>{' '}
							<span
								className={`font-bold ${
									product.quantity > 0 ? 'text-neon' : 'text-red-400'
								}`}
							>
								{product.quantity}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Corner Accent */}
			<div className='absolute top-0 left-0 w-16 h-16 opacity-20'>
				<div className='w-full h-full border-t-2 border-l-2 border-neon' />
			</div>
			<div className='absolute bottom-0 right-0 w-16 h-16 opacity-20'>
				<div className='w-full h-full border-b-2 border-r-2 border-cyan' />
			</div>
		</div>
	);
});
