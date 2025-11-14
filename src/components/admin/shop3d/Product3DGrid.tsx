import React from 'react';
import { Product3DCard } from './Product3DCard';
import { NeonIcon } from '../../ui/NeonIcon';
import { FaCube } from 'react-icons/fa';

interface Product {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	category?: { id: string; name: string } | string | null;
	quantity?: number | null;
	isActive: boolean;
	images?: string[];
	files?: Array<{
		id: string;
		s3Url: string;
		originalName: string;
	}>;
}

interface Product3DGridProps {
	products: Product[];
	loading?: boolean;
	onProductClick?: (product: Product) => void;
}

export const Product3DGrid = React.memo(function Product3DGrid({
	products,
	loading = false,
	onProductClick,
}: Product3DGridProps) {
	if (loading) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className='animate-pulse'>
							<div className='bg-subtle border border-line rounded-lg bevel overflow-hidden'>
								<div className='h-48 bg-hover' />
								<div className='p-4 space-y-3'>
									<div className='h-5 bg-hover rounded w-3/4' />
									<div className='h-4 bg-hover rounded w-full' />
									<div className='h-4 bg-hover rounded w-5/6' />
									<div className='flex justify-between items-center pt-2'>
										<div className='h-6 bg-hover rounded w-20' />
										<div className='h-4 bg-hover rounded w-16' />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div className='bg-panel border border-line rounded-lg bevel p-12'>
				<div className='flex flex-col items-center justify-center space-y-4 text-center'>
					<NeonIcon Icon={FaCube} size={64} variant='subtle' />
					<div className='space-y-2'>
						<h3 className='text-xl font-bold text-soft'>
							Продукты не найдены
						</h3>
						<p className='text-sm text-soft'>
							Начните с создания первого 3D продукта для магазина
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-panel border border-line rounded-lg bevel p-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
				{products.map((product) => (
					<Product3DCard
						key={product.id}
						product={product}
						onClick={() => onProductClick?.(product)}
					/>
				))}
			</div>
		</div>
	);
});
