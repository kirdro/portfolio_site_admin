'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaGithub, FaLinkedin, FaTelegram, FaMapMarkerAlt, FaBriefcase, FaCalendar } from 'react-icons/fa';

export default function ProfilePage() {
	const [formData, setFormData] = useState({
		fullName: '',
		title: '',
		description: '',
		avatarUrl: '',
		location: '',
		email: '',
		phone: '',
		website: '',
		github: '',
		linkedin: '',
		telegram: '',
		experienceYears: 0,
		availability: 'available' as 'available' | 'busy' | 'unavailable',
	});

	const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
	const { data: profile, isLoading } = api.profile.get.useQuery();
	const updateProfile = api.profile.upsert.useMutation({
		onSuccess: () => {
			setShowToast({ message: 'Профиль успешно сохранен!', type: 'success' });
			setTimeout(() => setShowToast(null), 3000);
		},
		onError: (error) => {
			setShowToast({ message: 'Ошибка при сохранении: ' + error.message, type: 'error' });
			setTimeout(() => setShowToast(null), 3000);
		},
	});

	useEffect(() => {
		if (profile) {
			setFormData({
				fullName: profile.fullName || '',
				title: profile.title || '',
				description: profile.description || '',
				avatarUrl: profile.avatarUrl || '',
				location: profile.location || '',
				email: profile.email || '',
				phone: profile.phone || '',
				website: profile.website || '',
				github: profile.github || '',
				linkedin: profile.linkedin || '',
				telegram: profile.telegram || '',
				experienceYears: profile.experienceYears || 0,
				availability: profile.availability || 'available',
			});
		}
	}, [profile]);

	const handleInputChange = (field: string, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateProfile.mutate(formData);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="cyber-loader"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{/* Toast уведомление */}
			{showToast && (
				<div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
					showToast.type === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
				}`}>
					<p className="text-white">{showToast.message}</p>
				</div>
			)}

			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white cyber-text">
					Редактирование профиля
				</h1>
				<p className="text-gray-400 mt-2">
					Управление информацией о профиле разработчика для главного сайта
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Основная информация */}
				<div className="cyber-card p-6 rounded-lg">
					<div className="mb-6">
						<h2 className="flex items-center gap-2 text-[#00FF99] text-xl font-bold mb-2">
							<FaUser size={20} />
							Основная информация
						</h2>
						<p className="text-gray-400 text-sm">
							Базовые данные, отображаемые на главной странице
						</p>
					</div>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
									Полное имя *
								</label>
								<input
									id="fullName"
									type="text"
									value={formData.fullName}
									onChange={(e) => handleInputChange('fullName', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="Ваше полное имя"
									required
								/>
							</div>
							<div>
								<label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
									Должность *
								</label>
								<input
									id="title"
									type="text"
									value={formData.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="Full-stack разработчик"
									required
								/>
							</div>
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
								Описание *
							</label>
							<textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange('description', e.target.value)}
								className="cyber-textarea w-full px-3 py-2 rounded min-h-[100px]"
								placeholder="Краткое описание ваших навыков и специализации"
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaMapMarkerAlt size={16} />
									Местоположение
								</label>
								<input
									id="location"
									type="text"
									value={formData.location}
									onChange={(e) => handleInputChange('location', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="Город, Страна"
								/>
							</div>
							<div>
								<label htmlFor="experienceYears" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaCalendar size={16} />
									Опыт работы (лет)
								</label>
								<input
									id="experienceYears"
									type="number"
									min="0"
									max="50"
									value={formData.experienceYears}
									onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="5"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-1">
									URL аватара
								</label>
								<input
									id="avatarUrl"
									type="url"
									value={formData.avatarUrl}
									onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="https://example.com/avatar.jpg"
								/>
							</div>
							<div>
								<label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaBriefcase size={16} />
									Статус доступности
								</label>
								<select
									id="availability"
									value={formData.availability}
									onChange={(e) => handleInputChange('availability', e.target.value)}
									className="cyber-select w-full px-3 py-2 rounded"
								>
									<option value="available">Доступен для работы</option>
									<option value="busy">Занят</option>
									<option value="unavailable">Недоступен</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Контактная информация */}
				<div className="cyber-card p-6 rounded-lg">
					<div className="mb-6">
						<h2 className="flex items-center gap-2 text-[#00FFCC] text-xl font-bold mb-2">
							<FaEnvelope size={20} />
							Контактная информация
						</h2>
						<p className="text-gray-400 text-sm">
							Способы связи для потенциальных клиентов
						</p>
					</div>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaEnvelope size={16} />
									Email
								</label>
								<input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="your@email.com"
								/>
							</div>
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaPhone size={16} />
									Телефон
								</label>
								<input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => handleInputChange('phone', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="+7 (xxx) xxx-xx-xx"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaGlobe size={16} />
									Веб-сайт
								</label>
								<input
									id="website"
									type="url"
									value={formData.website}
									onChange={(e) => handleInputChange('website', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="https://yourwebsite.com"
								/>
							</div>
							<div>
								<label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaTelegram size={16} />
									Telegram
								</label>
								<input
									id="telegram"
									type="text"
									value={formData.telegram}
									onChange={(e) => handleInputChange('telegram', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="@yourusername"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaGithub size={16} />
									GitHub
								</label>
								<input
									id="github"
									type="url"
									value={formData.github}
									onChange={(e) => handleInputChange('github', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="https://github.com/username"
								/>
							</div>
							<div>
								<label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
									<FaLinkedin size={16} />
									LinkedIn
								</label>
								<input
									id="linkedin"
									type="url"
									value={formData.linkedin}
									onChange={(e) => handleInputChange('linkedin', e.target.value)}
									className="cyber-input w-full px-3 py-2 rounded"
									placeholder="https://linkedin.com/in/username"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Кнопка сохранения */}
				<div className="flex justify-end">
					<button 
						type="submit" 
						disabled={updateProfile.isPending}
						className="cyber-button-primary px-8 py-3 rounded font-semibold"
					>
						{updateProfile.isPending ? 'Сохранение...' : 'Сохранить профиль'}
					</button>
				</div>
			</form>
		</div>
	);
}