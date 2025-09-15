import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

// Схема для валидации обновления роли пользователя
const updateUserRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(['USER', 'ADMIN']),
});

// Схема для фильтрации пользователей
const getUsersFilterSchema = z.object({
	search: z.string().optional(),
	role: z.enum(['USER', 'ADMIN']).optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const adminRouter = createTRPCRouter({
	// === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===

	// Получение всех пользователей портфолио с фильтрацией и поиском
	users: createTRPCRouter({
		getAll: protectedProcedure
			.input(getUsersFilterSchema)
			.query(async ({ input }) => {
				const { search, role, limit, offset } = input;

				// Строим условия фильтрации
				const where: any = {};

				if (search) {
					where.OR = [
						{ name: { contains: search, mode: 'insensitive' } },
						{ email: { contains: search, mode: 'insensitive' } },
					];
				}

				if (role) {
					where.role = role;
				}

				// Получаем пользователей с пагинацией
				const [users, totalCount] = await Promise.all([
					prisma.user.findMany({
						where,
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
							image: true,
							_count: {
								select: {
									Project: true,
									ChatMessage: true,
									AiChatMessage: true,
								},
							},
						},
						orderBy: { email: 'asc' },
						take: limit,
						skip: offset,
					}),
					prisma.user.count({ where }),
				]);

				return {
					users,
					totalCount,
					hasMore: offset + limit < totalCount,
				};
			}),

		// Получение детальной информации о пользователе
		getById: protectedProcedure
			.input(z.object({ id: z.string() }))
			.query(async ({ input }) => {
				const user = await prisma.user.findUnique({
					where: { id: input.id },
					include: {
						Project: {
							select: {
								id: true,
								title: true,
								featured: true,
								createdAt: true,
							},
							orderBy: { createdAt: 'desc' },
							take: 5,
						},
						ChatMessage: {
							select: {
								id: true,
								content: true,
								createdAt: true,
							},
							orderBy: { createdAt: 'desc' },
							take: 5,
						},
						AiChatMessage: {
							select: {
								id: true,
								content: true,
							},
							orderBy: { createdAt: 'desc' },
							take: 5,
						},
						_count: {
							select: {
								Project: true,
								ChatMessage: true,
								AiChatMessage: true,
							},
						},
					},
				});

				if (!user) {
					throw new Error('Пользователь не найден');
				}

				return user;
			}),

		// Обновление роли пользователя
		updateRole: protectedProcedure
			.input(updateUserRoleSchema)
			.mutation(async ({ input, ctx }) => {
				// Проверяем, что текущий пользователь - админ
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для изменения ролей');
				}

				const updatedUser = await prisma.user.update({
					where: { id: input.userId },
					data: { role: input.role },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
					},
				});

				return updatedUser;
			}),

		// Заглушка для блокировки/разблокировки (поле isBlocked отсутствует в схеме)
		toggleBlock: protectedProcedure
			.input(z.object({ userId: z.string() }))
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error(
						'Недостаточно прав для блокировки пользователей',
					);
				}

				// Получаем пользователя (без блокировки, так как поля нет в схеме)
				const user = await prisma.user.findUnique({
					where: { id: input.userId },
					select: { id: true, name: true, email: true },
				});

				if (!user) {
					throw new Error('Пользователь не найден');
				}

				// Возвращаем данные пользователя (функция блокировки не реализована)
				return {
					...user,
					message: 'Функция блокировки будет добавлена позже',
				};
			}),

		// Получение активности пользователя
		getActivity: protectedProcedure
			.input(
				z.object({
					userId: z.string(),
					days: z.number().min(1).max(90).default(30),
				}),
			)
			.query(async ({ input }) => {
				const { userId, days } = input;

				const startDate = new Date();
				startDate.setDate(startDate.getDate() - days);

				// Получаем активность пользователя за период
				const [projectsCreated, messagesGeneral, messagesAi] =
					await Promise.all([
						prisma.project.count({
							where: {
								userId,
								createdAt: { gte: startDate },
							},
						}),
						prisma.chatMessage.count({
							where: {
								userId,
								createdAt: { gte: startDate },
							},
						}),
						prisma.aiChatMessage.count({
							where: {
								userId,
								createdAt: { gte: startDate },
							},
						}),
					]);

				// Получаем ежедневную статистику сообщений
				const dailyActivity = await prisma.chatMessage.groupBy({
					by: ['createdAt'],
					where: {
						userId,
						createdAt: { gte: startDate },
					},
					_count: { id: true },
				});

				return {
					summary: {
						projectsCreated,
						messagesGeneral,
						messagesAi,
						totalActivity:
							projectsCreated + messagesGeneral + messagesAi,
					},
					dailyActivity: dailyActivity.map((item) => ({
						date: item.createdAt.toISOString().split('T')[0],
						count: item._count.id,
					})),
				};
			}),

		// Получение статистики пользователей
		getStats: protectedProcedure.query(async () => {
			const [
				totalUsers,
				adminUsers,
				blockedUsers,
				activeUsersLast30Days,
				newUsersLast7Days,
			] = await Promise.all([
				prisma.user.count(),
				prisma.user.count({ where: { role: 'ADMIN' } }),
				0, // Заглушка для заблокированных пользователей (поле isBlocked отсутствует)
				prisma.user.count({
					where: {
						OR: [
							{
								ChatMessage: {
									some: {
										createdAt: {
											gte: new Date(
												Date.now() -
													30 * 24 * 60 * 60 * 1000,
											),
										},
									},
								},
							},
							{
								AiChatMessage: {
									some: {
										createdAt: {
											gte: new Date(
												Date.now() -
													30 * 24 * 60 * 60 * 1000,
											),
										},
									},
								},
							},
							{
								Project: {
									some: {
										createdAt: {
											gte: new Date(
												Date.now() -
													30 * 24 * 60 * 60 * 1000,
											),
										},
									},
								},
							},
						],
					},
				}),
				0, // Заглушка для новых пользователей (поле createdAt отсутствует в схеме User)
			]);

			return {
				totalUsers,
				adminUsers,
				blockedUsers,
				activeUsersLast30Days,
				newUsersLast7Days,
				regularUsers: totalUsers - adminUsers,
			};
		}),
	}),

	// === УПРАВЛЕНИЕ ПРОЕКТАМИ ===

	// Роутеры для управления проектами портфолио
	projects: createTRPCRouter({
		// Получение всех проектов с фильтрацией
		getAll: protectedProcedure
			.input(
				z.object({
					search: z.string().optional(),
					featured: z.boolean().optional(),
					limit: z.number().min(1).max(100).default(20),
					offset: z.number().min(0).default(0),
				}),
			)
			.query(async ({ input }) => {
				const { search, featured, limit, offset } = input;

				// Строим условия фильтрации
				const where: any = {};

				if (search) {
					where.OR = [
						{ title: { contains: search, mode: 'insensitive' } },
						{
							description: {
								contains: search,
								mode: 'insensitive',
							},
						},
					];
				}

				if (featured !== undefined) {
					where.featured = featured;
				}

				// Получаем проекты с пагинацией
				const [projects, totalCount] = await Promise.all([
					prisma.project.findMany({
						where,
						select: {
							id: true,
							title: true,
							description: true,
							imageUrl: true,
							demoUrl: true,
							githubUrl: true,
							featured: true,
							tags: true,
							createdAt: true,
							updatedAt: true,
						},
						orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
						take: limit,
						skip: offset,
					}),
					prisma.project.count({ where }),
				]);

				return {
					projects,
					totalCount,
					hasMore: offset + limit < totalCount,
				};
			}),

		// Получение проекта по ID
		getById: protectedProcedure
			.input(z.object({ id: z.string() }))
			.query(async ({ input }) => {
				const project = await prisma.project.findUnique({
					where: { id: input.id },
				});

				if (!project) {
					throw new Error('Проект не найден');
				}

				return project;
			}),

		// Создание нового проекта
		create: protectedProcedure
			.input(
				z.object({
					title: z.string().min(1).max(100),
					description: z.string().min(10).max(500),
					imageUrl: z.string().url().optional().nullable(),
					demoUrl: z.string().url().optional().nullable(),
					githubUrl: z.string().url().optional().nullable(),
					featured: z.boolean().default(false),
					tags: z.array(z.string()).min(1),
				}),
			)
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для создания проектов');
				}

				const project = await prisma.project.create({
					data: {
						...input,
						userId: ctx.session.user.id,
					},
					select: {
						id: true,
						title: true,
						description: true,
						imageUrl: true,
						demoUrl: true,
						githubUrl: true,
						featured: true,
						tags: true,
						createdAt: true,
						updatedAt: true,
					},
				});

				return project;
			}),

		// Обновление проекта
		update: protectedProcedure
			.input(
				z.object({
					id: z.string(),
					title: z.string().min(1).max(100),
					description: z.string().min(10).max(500),
					imageUrl: z.string().url().optional().nullable(),
					demoUrl: z.string().url().optional().nullable(),
					githubUrl: z.string().url().optional().nullable(),
					featured: z.boolean(),
					tags: z.array(z.string()).min(1),
				}),
			)
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error(
						'Недостаточно прав для редактирования проектов',
					);
				}

				const { id, ...updateData } = input;

				const project = await prisma.project.update({
					where: { id },
					data: updateData,
					select: {
						id: true,
						title: true,
						description: true,
						imageUrl: true,
						demoUrl: true,
						githubUrl: true,
						featured: true,
						tags: true,
						updatedAt: true,
					},
				});

				return project;
			}),

		// Удаление проекта
		delete: protectedProcedure
			.input(z.object({ id: z.string() }))
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для удаления проектов');
				}

				const project = await prisma.project.delete({
					where: { id: input.id },
					select: {
						id: true,
						title: true,
					},
				});

				return project;
			}),

		// Переключение статуса избранного
		toggleFeatured: protectedProcedure
			.input(z.object({ id: z.string() }))
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для изменения проектов');
				}

				// Получаем текущий статус
				const project = await prisma.project.findUnique({
					where: { id: input.id },
					select: { featured: true },
				});

				if (!project) {
					throw new Error('Проект не найден');
				}

				// Переключаем статус
				const updatedProject = await prisma.project.update({
					where: { id: input.id },
					data: { featured: !project.featured },
					select: {
						id: true,
						title: true,
						featured: true,
					},
				});

				return updatedProject;
			}),

		// Получение статистики проектов
		getStats: protectedProcedure.query(async () => {
			const [
				totalProjects,
				featuredProjects,
				projectsLast30Days,
				mostPopularTags,
			] = await Promise.all([
				prisma.project.count(),
				prisma.project.count({ where: { featured: true } }),
				prisma.project.count({
					where: {
						createdAt: {
							gte: new Date(
								Date.now() - 30 * 24 * 60 * 60 * 1000,
							),
						},
					},
				}),
				// Получение популярных тегов (упрощенная версия)
				prisma.project.findMany({
					select: { tags: true },
					take: 100,
				}),
			]);

			// Подсчет популярных тегов
			const tagCount: Record<string, number> = {};
			mostPopularTags.forEach((project) => {
				project.tags.forEach((tag) => {
					tagCount[tag] = (tagCount[tag] || 0) + 1;
				});
			});

			const popularTags = Object.entries(tagCount)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10)
				.map(([tag, count]) => ({ tag, count }));

			return {
				totalProjects,
				featuredProjects,
				projectsLast30Days,
				regularProjects: totalProjects - featuredProjects,
				popularTags,
			};
		}),
	}),

	// === УПРАВЛЕНИЕ НАВЫКАМИ ===

	// Роутеры для управления навыками портфолио
	skills: createTRPCRouter({
		// Получение всех навыков с группировкой по категориям
		getAll: protectedProcedure
			.input(
				z
					.object({
						category: z
							.enum([
								'Frontend',
								'Backend',
								'DevOps',
								'Tools',
								'Other',
							])
							.optional(),
						minLevel: z.number().min(1).max(100).optional(),
					})
					.optional(),
			)
			.query(async ({ input = {} }) => {
				const { category, minLevel } = input;

				// Строим условия фильтрации
				const where: any = {};

				if (category) {
					where.category = category;
				}

				if (minLevel) {
					where.level = { gte: minLevel };
				}

				// Получаем навыки с сортировкой по категориям и уровню
				const skills = await prisma.skill.findMany({
					where,
					orderBy: [
						{ category: 'asc' },
						{ level: 'desc' },
						{ name: 'asc' },
					],
				});

				return skills;
			}),

		// Получение навыка по ID
		getById: protectedProcedure
			.input(z.object({ id: z.string() }))
			.query(async ({ input }) => {
				const skill = await prisma.skill.findUnique({
					where: { id: input.id },
				});

				if (!skill) {
					throw new Error('Навык не найден');
				}

				return skill;
			}),

		// Создание нового навыка
		create: protectedProcedure
			.input(
				z.object({
					name: z.string().min(1).max(50),
					category: z.enum([
						'Frontend',
						'Backend',
						'DevOps',
						'Tools',
						'Other',
					]),
					level: z.number().min(1).max(100),
					icon: z.string().min(1).max(10),
				}),
			)
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для создания навыков');
				}

				const skill = await prisma.skill.create({
					data: input,
				});

				return skill;
			}),

		// Обновление навыка
		update: protectedProcedure
			.input(
				z.object({
					id: z.string(),
					name: z.string().min(1).max(50),
					category: z.enum([
						'Frontend',
						'Backend',
						'DevOps',
						'Tools',
						'Other',
					]),
					level: z.number().min(1).max(100),
					icon: z.string().min(1).max(10),
				}),
			)
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error(
						'Недостаточно прав для редактирования навыков',
					);
				}

				const { id, ...updateData } = input;

				const skill = await prisma.skill.update({
					where: { id },
					data: updateData,
				});

				return skill;
			}),

		// Удаление навыка
		delete: protectedProcedure
			.input(z.object({ id: z.string() }))
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error('Недостаточно прав для удаления навыков');
				}

				const skill = await prisma.skill.delete({
					where: { id: input.id },
					select: {
						id: true,
						name: true,
					},
				});

				return skill;
			}),

		// Изменение порядка навыков (для будущей реализации drag & drop)
		reorder: protectedProcedure
			.input(
				z.object({
					skillIds: z.array(z.string()),
				}),
			)
			.mutation(async ({ input, ctx }) => {
				// Проверяем права администратора
				if (ctx.session.user.role !== 'ADMIN') {
					throw new Error(
						'Недостаточно прав для изменения порядка навыков',
					);
				}

				// В будущем здесь будет реализация изменения порядка
				// Пока что возвращаем успех
				return { success: true, reorderedIds: input.skillIds };
			}),

		// Получение статистики навыков
		getStats: protectedProcedure.query(async () => {
			const [totalSkills, skillsByCategory, averageLevel, expertSkills] =
				await Promise.all([
					prisma.skill.count(),
					prisma.skill.groupBy({
						by: ['category'],
						_count: { category: true },
					}),
					prisma.skill.aggregate({
						_avg: { level: true },
					}),
					prisma.skill.count({ where: { level: { gte: 90 } } }),
				]);

			// Преобразуем группированные данные в удобный формат
			const categoryStats = skillsByCategory.reduce(
				(acc, item) => {
					acc[item.category] = item._count.category;
					return acc;
				},
				{} as Record<string, number>,
			);

			return {
				totalSkills,
				categoryStats,
				averageLevel: Math.round(averageLevel._avg.level || 0),
				expertSkills,
				regularSkills: totalSkills - expertSkills,
			};
		}),
	}),

	// === ОБЩИЕ СТАТИСТИКИ ДЛЯ ДАШБОРДА ===

	// Получение общей статистики для dashboard
	getStats: protectedProcedure.query(async () => {
		const [
			usersCount,
			projectsCount,
			featuredProjectsCount,
			chatMessagesCount,
			aiMessagesCount,
			newContactsCount,
			skillsCount,
		] = await Promise.all([
			prisma.user.count(),
			prisma.project.count(),
			prisma.project.count({ where: { featured: true } }),
			prisma.chatMessage.count(),
			prisma.aiChatMessage.count(),
			prisma.contactForm.count({ where: { status: 'new' } }),
			prisma.skill.count(),
		]);

		// Активность за последние 30 дней
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentActivity = await Promise.all([
			0, // Заглушка для новых пользователей за 30 дней (поле createdAt отсутствует в схеме User)
			prisma.project.count({
				where: { createdAt: { gte: thirtyDaysAgo } },
			}),
			prisma.chatMessage.count({
				where: { createdAt: { gte: thirtyDaysAgo } },
			}),
			prisma.aiChatMessage.count({
				where: { createdAt: { gte: thirtyDaysAgo } },
			}),
		]);

		return {
			users: {
				total: usersCount,
				new30Days: recentActivity[0],
			},
			projects: {
				total: projectsCount,
				featured: featuredProjectsCount,
				new30Days: recentActivity[1],
			},
			messages: {
				general: chatMessagesCount,
				ai: aiMessagesCount,
				generalNew30Days: recentActivity[2],
				aiNew30Days: recentActivity[3],
			},
			contacts: {
				newCount: newContactsCount,
			},
			skills: {
				total: skillsCount,
			},
		};
	}),
});
