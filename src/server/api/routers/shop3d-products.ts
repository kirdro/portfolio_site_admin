import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Products Management
 */
export const shop3dProductsRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					offset: z.number().min(0).default(0),
					categoryId: z.string().optional(),
					isActive: z.boolean().optional(),
					isFeatured: z.boolean().optional(),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const {
				limit = 50,
				offset = 0,
				categoryId,
				isActive,
				isFeatured,
				search,
			} = input ?? {};

			const where: any = {};
			if (categoryId) where.categoryId = categoryId;
			if (isActive !== undefined) where.isActive = isActive;
			if (isFeatured !== undefined) where.isFeatured = isFeatured;
			if (search) {
				where.OR = [
					{ name: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } },
				];
			}

			const [products, total] = await Promise.all([
				prisma.shop3DProduct.findMany({
					where,
					take: limit,
					skip: offset,
					include: {
						category: true,
						tags: true,
						plastics: {
							include: {
								plastic: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				}),
				prisma.shop3DProduct.count({ where }),
			]);

			return {
				products,
				total,
				hasMore: offset + limit < total,
			};
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.shop3DProduct.findUnique({
				where: { id: input.id },
				include: {
					category: true,
					tags: true,
					plastics: {
						include: {
							plastic: true,
						},
					},
				},
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Название обязательно'),
				description: z.string().optional(),
				price: z.number().min(0, 'Цена должна быть положительной'),
				images: z.array(z.string()).default([]),
				characteristics: z.any().optional(),
				productionTime: z.number().int().min(0).optional(),
				categoryId: z.string().optional(),
				tagIds: z.array(z.string()).default([]),
				plasticIds: z.array(z.string()).default([]),
				isActive: z.boolean().default(true),
				isFeatured: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { tagIds, plasticIds, ...productData } = input;

			return await prisma.shop3DProduct.create({
				data: {
					...productData,
					tags: {
						connect: tagIds.map((id) => ({ id })),
					},
					plastics: {
						create: plasticIds.map((plasticId) => ({
							plastic: {
								connect: { id: plasticId },
							},
						})),
					},
				},
				include: {
					category: true,
					tags: true,
					plastics: {
						include: {
							plastic: true,
						},
					},
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				price: z.number().min(0).optional(),
				images: z.array(z.string()).optional(),
				characteristics: z.any().optional(),
				productionTime: z.number().int().min(0).optional(),
				categoryId: z.string().optional(),
				tagIds: z.array(z.string()).optional(),
				plasticIds: z.array(z.string()).optional(),
				isActive: z.boolean().optional(),
				isFeatured: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { id, tagIds, plasticIds, ...productData } = input;

			// Обновление связей с тегами и пластиками
			const updateData: any = { ...productData };

			if (tagIds !== undefined) {
				updateData.tags = {
					set: tagIds.map((tagId) => ({ id: tagId })),
				};
			}

			if (plasticIds !== undefined) {
				// Удаляем старые связи и создаем новые
				await prisma.shop3DProductPlastic.deleteMany({
					where: { productId: id },
				});

				updateData.plastics = {
					create: plasticIds.map((plasticId) => ({
						plastic: {
							connect: { id: plasticId },
						},
					})),
				};
			}

			return await prisma.shop3DProduct.update({
				where: { id },
				data: updateData,
				include: {
					category: true,
					tags: true,
					plastics: {
						include: {
							plastic: true,
						},
					},
				},
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DProduct.delete({
				where: { id: input.id },
			});
		}),

	toggleActive: protectedProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DProduct.update({
				where: { id: input.id },
				data: { isActive: input.isActive },
			});
		}),

	toggleFeatured: protectedProcedure
		.input(z.object({ id: z.string(), isFeatured: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DProduct.update({
				where: { id: input.id },
				data: { isFeatured: input.isFeatured },
			});
		}),

	getStats: protectedProcedure.query(async () => {
		const [total, active, featured, avgPrice, totalByCategory] =
			await Promise.all([
				prisma.shop3DProduct.count(),
				prisma.shop3DProduct.count({ where: { isActive: true } }),
				prisma.shop3DProduct.count({ where: { isFeatured: true } }),
				prisma.shop3DProduct.aggregate({
					_avg: { price: true },
				}),
				prisma.shop3DProduct.groupBy({
					by: ['categoryId'],
					_count: true,
				}),
			]);

		return {
			total,
			active,
			inactive: total - active,
			featured,
			avgPrice: avgPrice._avg.price ?? 0,
			categories: totalByCategory.filter((c) => c.categoryId).length,
		};
	}),
});
