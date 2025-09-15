'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';

import type { AppRouter } from '../server/api/root';
import { createLoadingMiddleware } from '../utils/trpc-loading-middleware';

// Создаем tRPC клиент для React
export const api = createTRPCReact<AppRouter>();

// Интерфейс для пропсов провайдера
interface TRPCProviderProps {
	children: React.ReactNode;
}

function getBaseUrl() {
	if (typeof window !== 'undefined') return ''; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3007}`; // dev SSR should use localhost
}

/**
 * Провайдер tRPC и React Query для админ-панели
 * Оборачивает приложение и предоставляет доступ к API через хуки
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
	// Создаем QueryClient с оптимальными настройками для админ-панели
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Кэшируем данные на 5 минут для лучшей производительности
						staleTime: 5 * 60 * 1000,
						// Перезапрос при фокусе окна (удобно для админки)
						refetchOnWindowFocus: true,
						// Retry логика для сетевых ошибок
						retry: (failureCount, error: any) => {
							// Не retry для 401/403 ошибок аутентификации
							if (
								error?.data?.httpStatus === 401 ||
								error?.data?.httpStatus === 403
							) {
								return false;
							}
							// Максимум 3 попытки для остальных ошибок
							return failureCount < 3;
						},
					},
					mutations: {
						// Retry мутации только 1 раз
						retry: 1,
					},
				},
			}),
	);

	const [trpcClient] = useState(() =>
		api.createClient({
			links: [
				loggerLink({
					enabled: (opts) =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' &&
							opts.result instanceof Error),
				}),
				// Добавляем middleware для автоматического управления загрузкой
				createLoadingMiddleware<AppRouter>(),
				httpBatchLink({
					url: `${getBaseUrl()}/api/trpc`,
				}),
			],
		}),
	);

	return (
		<api.Provider
			client={trpcClient}
			queryClient={queryClient}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</api.Provider>
	);
}
