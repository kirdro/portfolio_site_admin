'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NeonIcon } from './ui/NeonIcon';
import { type IconType } from 'react-icons';
import {
	FaTachometerAlt,
	FaUsers,
	FaRocket,
	FaBolt,
	FaComments,
	FaRobot,
	FaPen,
	FaEnvelope,
	FaCog,
	FaChevronLeft,
	FaChevronRight,
} from 'react-icons/fa';

interface AdminSidebarProps {
	isOpen: boolean;
	onToggle: () => void;
}

interface MenuItem {
	href: string;
	label: string;
	icon: IconType;
	description: string;
}

const menuItems: MenuItem[] = [
	{
		href: '/dashboard',
		label: 'Dashboard',
		icon: FaTachometerAlt,
		description: 'Главная панель',
	},
	{
		href: '/users',
		label: 'Пользователи',
		icon: FaUsers,
		description: 'Управление пользователями',
	},
	{
		href: '/projects',
		label: 'Проекты',
		icon: FaRocket,
		description: 'Портфолио проекты',
	},
	{
		href: '/skills',
		label: 'Навыки',
		icon: FaBolt,
		description: 'Управление навыками',
	},
	{
		href: '/chat',
		label: 'Чат',
		icon: FaComments,
		description: 'Общий чат сайта',
	},
	{
		href: '/ai-chat',
		label: 'ИИ Чат',
		icon: FaRobot,
		description: 'Чат с ИИ',
	},
	{
		href: '/blog',
		label: 'Блог',
		icon: FaPen,
		description: 'Управление блогом',
	},
	{
		href: '/contacts',
		label: 'Обращения',
		icon: FaEnvelope,
		description: 'Контактные формы',
	},
	{
		href: '/settings',
		label: 'Настройки',
		icon: FaCog,
		description: 'Системные параметры',
	},
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
	const pathname = usePathname();

	return (
		<div
			className={`fixed left-0 top-0 h-full z-20 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}
		>
			{/* Основная панель */}
			<div className='cyber-card h-full bg-black/80 border-r-2 border-green-500/30 backdrop-blur-md'>
				{/* Заголовок */}
				<div className='p-4 border-b border-green-500/30'>
					<div className='flex items-center justify-between'>
						{isOpen && (
							<h2
								className='text-xl font-mono font-bold glyph-glow'
								style={{ color: '#00FF99' }}
							>
								ADMIN
							</h2>
						)}
						<button
							onClick={onToggle}
							className='p-2 rounded hover:bg-green-500/20 transition-colors'
						>
							<NeonIcon
								Icon={isOpen ? FaChevronLeft : FaChevronRight}
								size={16}
								variant='default'
							/>
						</button>
					</div>
				</div>

				{/* Навигационное меню */}
				<nav className='flex-1 p-2'>
					<ul className='space-y-2'>
						{menuItems.map((item) => {
							const isActive = pathname === item.href;

							return (
								<li key={item.href}>
									<Link
										href={item.href as any}
										className={`
                      block p-3 rounded-lg transition-all duration-200 group border border-transparent
                      ${
							isActive ?
								'bg-green-500/20 border-green-500/50 shadow-neon'
							:	'hover:bg-green-500/10'
						}
                    `}
									>
										<div className='flex items-center space-x-3'>
											{/* Неоновая иконка */}
											<div className='flex-shrink-0'>
												<NeonIcon
													Icon={item.icon}
													size={18}
													variant={
														isActive ? 'intense' : (
															'default'
														)
													}
												/>
											</div>

											{/* Текст (показываем только когда боковая панель открыта) */}
											{isOpen && (
												<div className='min-w-0 flex-1'>
													<div
														className={`font-mono text-sm font-semibold ${
															isActive ?
																'text-white'
															:	'text-gray-300 group-hover:text-white'
														}`}
													>
														{item.label}
													</div>
													<div className='text-xs text-gray-500 truncate'>
														{item.description}
													</div>
												</div>
											)}
										</div>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* Статус системы (внизу) */}
				<div className='p-4 border-t border-green-500/30'>
					{isOpen ?
						<div className='text-xs font-mono space-y-1'>
							<div className='flex justify-between'>
								<span style={{ color: '#B8C5C0' }}>
									STATUS:
								</span>
								<span style={{ color: '#00FF99' }}>ONLINE</span>
							</div>
							<div className='flex justify-between'>
								<span style={{ color: '#B8C5C0' }}>PORT:</span>
								<span style={{ color: '#00FFCC' }}>3008</span>
							</div>
						</div>
					:	<div className='text-center'>
							<div
								className='w-2 h-2 rounded-full mx-auto animate-pulse'
								style={{ backgroundColor: '#00FF99' }}
							/>
						</div>
					}
				</div>
			</div>
		</div>
	);
}
