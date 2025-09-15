'use client';

import { getProviders, signIn, getSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProviderType {
	id: string;
	name: string;
	type: string;
	signinUrl: string;
	callbackUrl: string;
}

export default function SignInPage() {
	const [providers, setProviders] = useState<Record<
		string,
		ProviderType
	> | null>(null);
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	// Функция для получения провайдеров аутентификации
	const fetchProviders = useCallback(async () => {
		const res = await getProviders();
		setProviders(res);
	}, []);

	// Функция для входа через провайдер
	const handleProviderSignIn = useCallback(async (providerId: string) => {
		setIsLoading(true);
		try {
			await signIn(providerId, { callbackUrl: '/' });
		} catch (error) {
			console.error('Ошибка входа:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Функция для входа через email
	const handleEmailSignIn = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			if (!email || email !== 'kirdro@yandex.ru') {
				alert('⛔ Доступ разрешен только для kirdro@yandex.ru');
				return;
			}

			setIsLoading(true);
			try {
				const result = await signIn('email', {
					email,
					callbackUrl: '/',
					redirect: false,
				});

				if (result?.ok) {
					alert('📧 Проверьте вашу почту для завершения входа!');
				}
			} catch (error) {
				console.error('Ошибка отправки email:', error);
			} finally {
				setIsLoading(false);
			}
		},
		[email],
	);

	useEffect(() => {
		fetchProviders();

		// Проверяем если пользователь уже авторизован
		getSession().then((session) => {
			if (session) {
				router.push('/');
			}
		});
	}, [fetchProviders, router]);

	return (
		<main
			className='min-h-screen flex items-center justify-center'
			style={{ backgroundColor: '#0B0D0E', color: '#E6F4EF' }}
		>
			{/* Сканлайн эффект */}
			<div className='scanline absolute inset-0 pointer-events-none' />

			<div className='w-full max-w-md p-8 relative z-10'>
				{/* Заголовок */}
				<div className='text-center mb-8'>
					<h1 className='text-4xl font-bold font-mono glyph-glow mb-2'>
						KIRDRO ADMIN
					</h1>
					<p
						className='text-sm font-mono'
						style={{ color: '#B8C5C0' }}
					>
						СИСТЕМА БЕЗОПАСНОСТИ
					</p>
				</div>

				{/* Карточка входа */}
				<div className='cyber-card p-6'>
					<div className='mb-6'>
						<h2
							className='text-xl font-semibold mb-2'
							style={{ color: '#00FF99' }}
						>
							АВТОРИЗАЦИЯ
						</h2>
						<p
							className='text-sm font-mono'
							style={{ color: '#B8C5C0' }}
						>
							Доступ только для администратора
						</p>
					</div>

					{/* Форма входа через email */}
					<form
						onSubmit={handleEmailSignIn}
						className='mb-6'
					>
						<div className='mb-4'>
							<label
								className='block text-sm font-mono mb-2'
								style={{ color: '#E6F4EF' }}
							>
								EMAIL АДРЕС:
							</label>
							<input
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='cyber-input w-full px-3 py-2 font-mono text-sm'
								placeholder='kirdro@yandex.ru'
								required
								disabled={isLoading}
							/>
						</div>

						<button
							type='submit'
							disabled={isLoading || !email}
							className='btn-glitch bevel w-full py-2 px-4 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? '[ОТПРАВКА...]' : '[ВХОД ПО EMAIL]'}
						</button>
					</form>

					{/* Разделитель */}
					<div className='flex items-center mb-6'>
						<div
							className='flex-1 h-px'
							style={{ backgroundColor: '#1C2A25' }}
						/>
						<span
							className='px-3 text-sm font-mono'
							style={{ color: '#B8C5C0' }}
						>
							ИЛИ
						</span>
						<div
							className='flex-1 h-px'
							style={{ backgroundColor: '#1C2A25' }}
						/>
					</div>

					{/* Провайдеры OAuth */}
					<div className='space-y-3'>
						{providers &&
							Object.values(providers).map((provider) => {
								if (provider.id === 'email') return null;

								return (
									<button
										key={provider.id}
										onClick={() =>
											handleProviderSignIn(provider.id)
										}
										disabled={isLoading}
										className='btn-glitch bevel w-full py-2 px-4 font-mono text-sm disabled:opacity-50'
									>
										{isLoading ?
											'[ПОДКЛЮЧЕНИЕ...]'
										:	`[ВХОД ЧЕРЕЗ ${provider.name.toUpperCase()}]`
										}
									</button>
								);
							})}
					</div>

					{/* Предупреждение безопасности */}
					<div
						className='mt-6 p-3 border border-line rounded'
						style={{
							backgroundColor: '#0F1214',
							borderColor: '#1C2A25',
						}}
					>
						<p
							className='text-xs font-mono text-center'
							style={{ color: '#B8C5C0' }}
						>
							⚠️ Все попытки входа логируются
							<br />
							Доступ только для kirdro@yandex.ru
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
