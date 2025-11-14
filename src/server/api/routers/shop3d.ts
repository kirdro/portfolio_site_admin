import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Products Management
 * Handles CRUD operations for 3D printed products
 */
export const shop3dRouter = createTRPCRouter({
	/**
	 * Get all products with pagination and filtering
	 */
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					offset: z.number().min(0).default(0),
					category: z.string().optional(),
					isActive: z.boolean().optional(),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const { limit = 50, offset = 0, category, isActive, search } = input ?? {};

			// Build where clause
			const where: any = {};
			if (category) where.category = category;
			if (isActive !== undefined) where.isActive = isActive;
			if (search) {
				where.OR = [
					{ name: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } },
				];
			}

			const [products, total] = await Promise.all([
				prisma.products.findMany({
					where,
					take: limit,
					skip: offset,
					orderBy: { createdAt: 'desc' },
					include: {
						files: true, // Include product images
						teams: true, // Include team info if needed
					},
				}),
				prisma.products.count({ where }),
			]);

			return {
				products,
				total,
				hasMore: offset + limit < total,
			};
		}),

	/**
	 * Get product by ID
	 */
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.products.findUnique({
				where: { id: input.id },
				include: {
					files: true,
					teams: true,
				},
			});
		}),

	/**
	 * Create new product
	 */
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Название обязательно'),
				description: z.string().optional(),
				price: z.number().min(0, 'Цена должна быть положительной'),
				category: z.string().optional(),
				quantity: z.number().min(0).optional(),
				isActive: z.boolean().default(true),
				teamId: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Check admin permission
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав для создания продукта');
			}

			return await prisma.products.create({
				data: {
					id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					name: input.name,
					description: input.description,
					price: input.price,
					category: input.category,
					quantity: input.quantity,
					isActive: input.isActive,
					teamId: input.teamId,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				include: {
					files: true,
				},
			});
		}),

	/**
	 * Update existing product
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				price: z.number().min(0).optional(),
				category: z.string().optional(),
				quantity: z.number().min(0).optional(),
				isActive: z.boolean().optional(),
				teamId: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав для редактирования продукта');
			}

			const { id, ...data } = input;

			return await prisma.products.update({
				where: { id },
				data: {
					...data,
					updatedAt: new Date(),
				},
				include: {
					files: true,
				},
			});
		}),

	/**
	 * Delete product
	 */
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав для удаления продукта');
			}

			return await prisma.products.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Toggle product active status
	 */
	toggleActive: protectedProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.products.update({
				where: { id: input.id },
				data: {
					isActive: input.isActive,
					updatedAt: new Date(),
				},
			});
		}),

	/**
	 * Get shop statistics
	 */
	getStats: protectedProcedure.query(async () => {
		const [
			totalProducts,
			activeProducts,
			inactiveProducts,
			totalValue,
			categories,
		] = await Promise.all([
			prisma.products.count(),
			prisma.products.count({ where: { isActive: true } }),
			prisma.products.count({ where: { isActive: false } }),
			prisma.products.aggregate({
				_sum: { price: true, quantity: true },
			}),
			prisma.products.groupBy({
				by: ['category'],
				_count: true,
			}),
		]);

		return {
			totalProducts,
			activeProducts,
			inactiveProducts,
			totalValue: totalValue._sum.price ?? 0,
			totalQuantity: totalValue._sum.quantity ?? 0,
			categories: categories.filter((c) => c.category).length,
		};
	}),

	/**
	 * Get all unique categories
	 */
	getCategories: protectedProcedure.query(async () => {
		const categories = await prisma.products.groupBy({
			by: ['category'],
			_count: true,
			orderBy: {
				_count: {
					category: 'desc',
				},
			},
		});

		return categories
			.filter((c) => c.category)
			.map((c) => ({
				name: c.category!,
				count: c._count,
			}));
	}),
});
