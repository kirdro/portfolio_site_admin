import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Схема валидации для блог-поста
const BlogPostSchema = z.object({
	title: z
		.string()
		.min(1, 'Заголовок не может быть пустым')
		.max(200, 'Заголовок слишком длинный'),
	slug: z
		.string()
		.min(1, 'Слаг не может быть пустым')
		.max(100, 'Слаг слишком длинный'),
	content: z.any(), // BlockNote JSON content
	excerpt: z.string().optional(),
	coverImage: z.string().url().optional().nullable(),
	published: z.boolean().default(false),
	tags: z.array(z.string()).default([]),
});

const BlogPostUpdateSchema = BlogPostSchema.partial();

// Схема валидации для тега
const BlogTagSchema = z.object({
	name: z
		.string()
		.min(1, 'Название тега не может быть пустым')
		.max(50, 'Название тега слишком длинное'),
	slug: z
		.string()
		.min(1, 'Слаг тега не может быть пустым')
		.max(50, 'Слаг тега слишком длинный'),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, 'Неверный формат цвета')
		.default('#00FF99'),
});

/**
 * tRPC роутер для управления блогом
 * CRUD операции для блог-постов и тегов с поддержкой BlockNote.js
 */
export const blogRouter = createTRPCRouter({
	// Получить все блог-посты с фильтрацией и пагинацией
	getAll: protectedProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(10),
				published: z.boolean().optional(),
				tag: z.string().optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, limit, published, tag, search } = input;
			const offset = (page - 1) * limit;

			// Базовые условия поиска
			const where: any = {};

			if (published !== undefined) {
				where.published = published;
			}

			if (search) {
				where.OR = [
					{ title: { contains: search, mode: 'insensitive' } },
					{ excerpt: { contains: search, mode: 'insensitive' } },
				];
			}

			if (tag) {
				where.tags = {
					some: {
						slug: tag,
					},
				};
			}

			// Получаем посты с тегами и автором
			const [posts, totalCount] = await Promise.all([
				ctx.prisma.blogPost.findMany({
					where,
					include: {
						author: true,
						tags: true,
					},
					orderBy: [{ published: 'desc' }, { createdAt: 'desc' }],
					skip: offset,
					take: limit,
				}),
				ctx.prisma.blogPost.count({ where }),
			]);

			return {
				posts,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
				currentPage: page,
			};
		}),

	// Получить блог-пост по ID
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.prisma.blogPost.findUnique({
				where: { id: input.id },
				include: {
					author: true,
					tags: true,
				},
			});

			if (!post) {
				throw new Error('Блог-пост не найден');
			}

			return post;
		}),

	// Получить блог-пост по слагу
	getBySlug: protectedProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const post = await ctx.prisma.blogPost.findUnique({
				where: { slug: input.slug },
				include: {
					author: true,
					tags: true,
				},
			});

			if (!post) {
				throw new Error('Блог-пост не найден');
			}

			return post;
		}),

	// Создать новый блог-пост
	create: protectedProcedure
		.input(BlogPostSchema)
		.mutation(async ({ ctx, input }) => {
			// Проверяем уникальность слага
			const existingPost = await ctx.prisma.blogPost.findUnique({
				where: { slug: input.slug },
			});

			if (existingPost) {
				throw new Error('Пост с таким слагом уже существует');
			}

			// Создаем пост
			const post = await ctx.prisma.blogPost.create({
				data: {
					title: input.title,
					slug: input.slug,
					content: input.content,
					excerpt: input.excerpt,
					coverImage: input.coverImage,
					published: input.published,
					publishedAt: input.published ? new Date() : null,
					authorId: ctx.session.user.id,
					tags: {
						connect: input.tags.map((tagSlug) => ({
							slug: tagSlug,
						})),
					},
				},
				include: {
					author: true,
					tags: true,
				},
			});

			return post;
		}),

	// Обновить блог-пост
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: BlogPostUpdateSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование поста
			const existingPost = await ctx.prisma.blogPost.findUnique({
				where: { id: input.id },
			});

			if (!existingPost) {
				throw new Error('Блог-пост не найден');
			}

			// Проверяем уникальность слага (если он изменился)
			if (input.data.slug && input.data.slug !== existingPost.slug) {
				const postWithSameSlug = await ctx.prisma.blogPost.findUnique({
					where: { slug: input.data.slug },
				});

				if (postWithSameSlug) {
					throw new Error('Пост с таким слагом уже существует');
				}
			}

			// Обновляем пост
			const updateData: any = {
				...input.data,
				updatedAt: new Date(),
			};

			// Устанавливаем publishedAt если пост публикуется впервые
			if (input.data.published && !existingPost.published) {
				updateData.publishedAt = new Date();
			} else if (input.data.published === false) {
				updateData.publishedAt = null;
			}

			// Обновляем теги если они переданы
			if (input.data.tags) {
				updateData.tags = {
					set: [], // Сначала отключаем все теги
					connect: input.data.tags.map((tagSlug) => ({
						slug: tagSlug,
					})),
				};
			}

			const updatedPost = await ctx.prisma.blogPost.update({
				where: { id: input.id },
				data: updateData,
				include: {
					author: true,
					tags: true,
				},
			});

			return updatedPost;
		}),

	// Удалить блог-пост
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование поста
			const existingPost = await ctx.prisma.blogPost.findUnique({
				where: { id: input.id },
			});

			if (!existingPost) {
				throw new Error('Блог-пост не найден');
			}

			// Удаляем пост
			await ctx.prisma.blogPost.delete({
				where: { id: input.id },
			});

			return { success: true, message: 'Блог-пост успешно удален' };
		}),

	// Переключить статус публикации
	togglePublished: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existingPost = await ctx.prisma.blogPost.findUnique({
				where: { id: input.id },
			});

			if (!existingPost) {
				throw new Error('Блог-пост не найден');
			}

			const newPublishedStatus = !existingPost.published;

			const updatedPost = await ctx.prisma.blogPost.update({
				where: { id: input.id },
				data: {
					published: newPublishedStatus,
					publishedAt: newPublishedStatus ? new Date() : null,
					updatedAt: new Date(),
				},
				include: {
					author: true,
					tags: true,
				},
			});

			return updatedPost;
		}),

	// --- ТЕГИ ---

	// Получить все теги
	getAllTags: protectedProcedure.query(async ({ ctx }) => {
		const tags = await ctx.prisma.blogTag.findMany({
			include: {
				_count: {
					select: {
						posts: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		});

		return tags;
	}),

	// Создать новый тег
	createTag: protectedProcedure
		.input(BlogTagSchema)
		.mutation(async ({ ctx, input }) => {
			// Проверяем уникальность имени и слага
			const existingTag = await ctx.prisma.blogTag.findFirst({
				where: {
					OR: [{ name: input.name }, { slug: input.slug }],
				},
			});

			if (existingTag) {
				throw new Error('Тег с таким именем или слагом уже существует');
			}

			const tag = await ctx.prisma.blogTag.create({
				data: {
					name: input.name,
					slug: input.slug,
					color: input.color,
				},
				include: {
					_count: {
						select: {
							posts: true,
						},
					},
				},
			});

			return tag;
		}),

	// Обновить тег
	updateTag: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: BlogTagSchema.partial(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование тега
			const existingTag = await ctx.prisma.blogTag.findUnique({
				where: { id: input.id },
			});

			if (!existingTag) {
				throw new Error('Тег не найден');
			}

			// Проверяем уникальность имени и слага (если они изменились)
			if (input.data.name || input.data.slug) {
				const conflictConditions: any[] = [];

				if (input.data.name && input.data.name !== existingTag.name) {
					conflictConditions.push({ name: input.data.name });
				}

				if (input.data.slug && input.data.slug !== existingTag.slug) {
					conflictConditions.push({ slug: input.data.slug });
				}

				if (conflictConditions.length > 0) {
					const conflictingTag = await ctx.prisma.blogTag.findFirst({
						where: {
							AND: [
								{ NOT: { id: input.id } },
								{ OR: conflictConditions },
							],
						},
					});

					if (conflictingTag) {
						throw new Error(
							'Тег с таким именем или слагом уже существует',
						);
					}
				}
			}

			const updatedTag = await ctx.prisma.blogTag.update({
				where: { id: input.id },
				data: input.data,
				include: {
					_count: {
						select: {
							posts: true,
						},
					},
				},
			});

			return updatedTag;
		}),

	// Удалить тег
	deleteTag: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// Проверяем существование тега
			const existingTag = await ctx.prisma.blogTag.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: {
							posts: true,
						},
					},
				},
			});

			if (!existingTag) {
				throw new Error('Тег не найден');
			}

			// Предупреждаем если тег используется в постах
			if (existingTag._count.posts > 0) {
				throw new Error(
					`Тег используется в ${existingTag._count.posts} постах. Сначала удалите тег из всех постов.`,
				);
			}

			// Удаляем тег
			await ctx.prisma.blogTag.delete({
				where: { id: input.id },
			});

			return { success: true, message: 'Тег успешно удален' };
		}),

	// Получить статистику блога
	getStats: protectedProcedure.query(async ({ ctx }) => {
		const [totalPosts, publishedPosts, draftPosts, totalTags, recentPosts] =
			await Promise.all([
				ctx.prisma.blogPost.count(),
				ctx.prisma.blogPost.count({ where: { published: true } }),
				ctx.prisma.blogPost.count({ where: { published: false } }),
				ctx.prisma.blogTag.count(),
				ctx.prisma.blogPost.findMany({
					take: 5,
					orderBy: { createdAt: 'desc' },
					select: {
						id: true,
						title: true,
						published: true,
						createdAt: true,
					},
				}),
			]);

		return {
			totalPosts,
			publishedPosts,
			draftPosts,
			totalTags,
			recentPosts,
		};
	}),
});
