'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NeonIcon } from '../../../components/ui/NeonIcon';
import {
	FaCube,
	FaConciergeBell,
	FaList,
	FaTags,
	FaBox,
	FaIndustry,
	FaAddressBook,
} from 'react-icons/fa';

interface TabItem {
	href: string;
	label: string;
	icon: any;
}

const tabs: TabItem[] = [
	{
		href: '/shop3d/products',
		label: 'Продукты',
		icon: FaCube,
	},
	{
		href: '/shop3d/services',
		label: 'Услуги',
		icon: FaConciergeBell,
	},
	{
		href: '/shop3d/categories',
		label: 'Категории',
		icon: FaList,
	},
	{
		href: '/shop3d/tags',
		label: 'Теги',
		icon: FaTags,
	},
	{
		href: '/shop3d/plastics',
		label: 'Пластики',
		icon: FaIndustry,
	},
	{
		href: '/shop3d/contacts',
		label: 'Контакты',
		icon: FaAddressBook,
	},
];

export default function Shop3DLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className='space-y-6'>
			{/* Tabs Navigation */}
			<div className='bg-panel border border-line rounded-lg bevel overflow-hidden'>
				<div className='flex overflow-x-auto'>
					{tabs.map((tab) => {
						const isActive = pathname === tab.href;

						return (
							<Link
								key={tab.href}
								href={tab.href}
								className={`
                  flex items-center gap-2 px-6 py-4 font-mono text-sm
                  border-b-2 transition-all duration-200 whitespace-nowrap
                  ${
										isActive ?
											'border-neon bg-neon/10 text-neon'
										:	'border-transparent text-soft hover:bg-hover'
									}
                `}
							>
								<NeonIcon
									Icon={tab.icon}
									size={16}
									variant={isActive ? 'intense' : 'subtle'}
								/>
								<span>{tab.label}</span>
							</Link>
						);
					})}
				</div>
			</div>

			{/* Page Content */}
			{children}
		</div>
	);
}
