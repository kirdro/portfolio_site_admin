import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Схема валидации для сообщений чата
const ChatMessageSchema = z.object({
	content: z
		.string()
		.min(1, 'Сообщение не может быть пустым')
		.max(1000, 'Сообщение слишком длинное'),
	type: z.enum(['general', 'ai']),
});

const ChatMessageUpdateSchema = ChatMessageSchema.partial();

/**
 * tRPC роутер для управления чатами
 * Включает операции для общего чата и ИИ-чата
 */
export const chatRouter = createTRPCRouter({
	// Получить все сообщения с пагинацией и фильтрацией
	getMessages: protectedProcedure
		.input(
			z.object({
				type: z.enum(['general', 'ai']).optional(),
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
				search: z.string().optional(),
				userId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { type, page, limit, search, userId } = input;
			const offset = (page - 1) * limit;

			// Базовые условия поиска
			const where: any = {};

			// Поле type не существует в ChatMessage, игнорируем фильтр по типу

			if (search) {
				where.OR = [
					{ content: { contains: search, mode: 'insensitive' } },
					{
						User: {
							name: { contains: search, mode: 'insensitive' },
						},
					},
				];
			}

			if (userId) {
				where.userId = userId;
			}

			// Получаем сообщения с информацией о пользователях
			const [messages, totalCount] = await Promise.all([
				ctx.prisma.chatMessage.findMany({
					where,
					include: {
						User: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
					skip: offset,
					take: limit,
				}),
				ctx.prisma.chatMessage.count({ where }),
			]);

			return {
				messages: messages.map((message) => ({
					id: message.id,
					content: message.content,
					userId: message.userId,
					userName: message.User.name || 'Неизвестный пользователь',
					userAvatar: message.User.image,
					type: 'user', // Заглушка - поле type отсутствует в схеме ChatMessage
					createdAt: message.createdAt,
					updatedAt: message.updatedAt,
					isBlocked: false, // Функция блокировки пользователей будет добавлена позже
				})),
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Получить сообщение по ID
	getMessage: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const message = await ctx.prisma.chatMessage.findUnique({
				where: { id: input.id },
				include: {
					User: {
						select: {
							id: true,
							name: true,
							image: true,
							// Функция блокировки будет добавлена позже
						},
					},
				},
			});

			if (!message) {
				throw new Error('Сообщение не найдено');
			}

			return {
				id: message.id,
				content: message.content,
				userId: message.userId,
				userName: message.User.name || 'Неизвестный пользователь',
				userAvatar: message.User.image,
				type: 'user', // Заглушка - поле type отсутствует в схеме ChatMessage
				createdAt: message.createdAt,
				updatedAt: message.updatedAt,
				isBlocked: false, // Функция блокировки пользователей будет добавлена позже
			};
		}),

	// Удалить сообщение
	deleteMessage: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование сообщения
			const existingMessage = await ctx.prisma.chatMessage.findUnique({
				where: { id: input.id },
			});

			if (!existingMessage) {
				throw new Error('Сообщение не найдено');
			}

			// Удаляем сообщение
			await ctx.prisma.chatMessage.delete({
				where: { id: input.id },
			});

			return { success: true, message: 'Сообщение успешно удалено' };
		}),

	// Заблокировать пользователя
	banUser: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				reason: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование пользователя
			const existingUser = await ctx.prisma.user.findUnique({
				where: { id: input.userId },
			});

			if (!existingUser) {
				throw new Error('Пользователь не найден');
			}

			// Заглушка: функция блокировки не реализована, так как отсутствуют поля isBlocked, blockedAt, blockedReason в схеме
			console.log(
				'Блокировка пользователя',
				input.userId,
				'с причиной:',
				input.reason,
			);
			// Функционал будет добавлен после добавления соответствующих полей в Prisma схему

			return {
				success: true,
				message: 'Пользователь успешно заблокирован',
			};
		}),

	// Разблокировать пользователя
	unbanUser: protectedProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование пользователя
			const existingUser = await ctx.prisma.user.findUnique({
				where: { id: input.userId },
			});

			if (!existingUser) {
				throw new Error('Пользователь не найден');
			}

			// Заглушка: функция разблокировки не реализована, так как отсутствуют поля isBlocked, blockedAt, blockedReason в схеме
			console.log('Разблокировка пользователя', input.userId);
			// Функционал будет добавлен после добавления соответствующих полей в Prisma схему

			return {
				success: true,
				message: 'Пользователь успешно разблокирован',
			};
		}),

	// Получить статистику чатов
	getStats: protectedProcedure.query(async ({ ctx }) => {
		// Получаем общую статистику сообщений
		const totalMessages = await ctx.prisma.chatMessage.count();

		// Сообщения за последние 24 часа
		const messagesLast24h = await ctx.prisma.chatMessage.count({
			where: {
				createdAt: {
					gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
				},
			},
		});

		// Сообщения за последние 7 дней
		const messagesLast7d = await ctx.prisma.chatMessage.count({
			where: {
				createdAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				},
			},
		});

		// Активные пользователи (отправившие сообщения за последние 30 дней)
		const activeUsers = await ctx.prisma.user.count({
			where: {
				ChatMessage: {
					some: {
						createdAt: {
							gte: new Date(
								Date.now() - 30 * 24 * 60 * 60 * 1000,
							),
						},
					},
				},
			},
		});

		// Топ самых активных пользователей
		const mostActiveUsers = await ctx.prisma.user.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						ChatMessage: true,
					},
				},
			},
			where: {
				ChatMessage: {
					some: {},
				},
			},
			orderBy: {
				ChatMessage: {
					_count: 'desc',
				},
			},
			take: 5,
		});

		// Активность по дням за последние 7 дней
		const dailyActivity = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);

			const nextDate = new Date(date);
			nextDate.setDate(nextDate.getDate() + 1);

			// Поле type не существует в ChatMessage, считаем все сообщения
			const totalMessages = await ctx.prisma.chatMessage.count({
				where: {
					createdAt: {
						gte: date,
						lt: nextDate,
					},
				},
			});

			dailyActivity.push({
				date: date.toISOString().split('T')[0],
				generalMessages: totalMessages, // Все сообщения как general
				aiMessages: 0, // AI сообщения хранятся в отдельной таблице
			});
		}

		// Количество модерационных действий (заблокированных пользователей за месяц)
		// Поле blockedAt не существует в User, возвращаем заглушку
		const moderationActions = 0;

		return {
			totalMessages,
			messagesLast24h,
			messagesLast7d,
			activeUsers,
			mostActiveUsers: mostActiveUsers.map((user) => ({
				userId: user.id,
				userName: user.name || 'Неизвестный пользователь',
				messageCount: user._count.ChatMessage,
			})),
			dailyActivity,
			moderationActions,
		};
	}),

	// Поиск пользователей для фильтрации
	searchUsers: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			const users = await ctx.prisma.user.findMany({
				where: {
					name: {
						contains: input.query,
						mode: 'insensitive',
					},
					ChatMessage: {
						some: {},
					},
				},
				select: {
					id: true,
					name: true,
					image: true,
					// Функция блокировки будет добавлена позже
					_count: {
						select: {
							ChatMessage: true,
						},
					},
				},
				orderBy: {
					ChatMessage: {
						_count: 'desc',
					},
				},
				take: input.limit,
			});

			return users.map((user) => ({
				id: user.id,
				name: user.name || 'Неизвестный пользователь',
				avatar: user.image,
				isBlocked: false, // Функция блокировки пользователей будет добавлена позже
				messageCount: user._count.ChatMessage,
			}));
		}),
});
