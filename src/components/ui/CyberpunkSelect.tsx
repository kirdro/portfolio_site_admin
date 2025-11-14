'use client';

import React from 'react';

interface CyberpunkSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	options: Array<{
		value: string | number;
		label: string;
	}>;
	placeholder?: string;
}

export const CyberpunkSelect: React.FC<CyberpunkSelectProps> = ({
	label,
	options,
	placeholder = 'Выберите опцию',
	className = '',
	...props
}) => {
	return (
		<div className='w-full'>
			{label && (
				<label className='block text-sm font-medium text-base mb-1'>
					{label}
				</label>
			)}
			<div className='relative'>
				<select
					{...props}
					className={`
						w-full px-3 py-2
						bg-subtle border border-line rounded
						text-base focus:border-neon focus:outline-none
						cursor-pointer transition-all duration-200
						appearance-none pr-10
						hover:bg-hover hover:border-neon/50
						${className}
					`}
					style={{
						WebkitAppearance: 'none',
						MozAppearance: 'none',
					}}
				>
					<option value='' className='bg-bg text-soft'>
						{placeholder}
					</option>
					{options.map((option) => (
						<option
							key={option.value}
							value={option.value}
							className='bg-bg text-base py-2 hover:bg-neon/20'
							style={{
								backgroundColor: '#0B0D0E',
								color: '#E6E6E6',
							}}
						>
							{option.label}
						</option>
					))}
				</select>

				{/* Custom dropdown arrow */}
				<div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
					<svg
						className='w-5 h-5 text-neon'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						viewBox='0 0 24 24'
					>
						<polyline points='6 9 12 15 18 9'></polyline>
					</svg>
				</div>
			</div>

			<style jsx>{`
				select option {
					background-color: #0B0D0E !important;
					color: #E6E6E6 !important;
					padding: 8px !important;
				}

				select option:hover,
				select option:focus,
				select option:checked {
					background: linear-gradient(90deg, rgba(0, 255, 153, 0.2) 0%, rgba(0, 255, 153, 0.1) 100%) !important;
					color: #00FF99 !important;
				}

				select::-webkit-scrollbar {
					width: 8px;
				}

				select::-webkit-scrollbar-track {
					background: #0B0D0E;
					border: 1px solid #2A2D2F;
				}

				select::-webkit-scrollbar-thumb {
					background: #00FF99;
					border-radius: 4px;
				}

				select::-webkit-scrollbar-thumb:hover {
					background: #00FFCC;
				}
			`}</style>
		</div>
	);
};