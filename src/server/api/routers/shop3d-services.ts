import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Services Management
 * Handles CRUD operations for services
 */
export const shop3dServicesRouter = createTRPCRouter({
	/**
	 * Get all services
	 */
	getAll: protectedProcedure
		.input(
			z
				.object({
					isActive: z.boolean().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const where: any = {};
			if (input?.isActive !== undefined) {
				where.isActive = input.isActive;
			}

			return await prisma.shop3DService.findMany({
				where,
				orderBy: { createdAt: 'desc' },
			});
		}),

	/**
	 * Get service by ID
	 */
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.shop3DService.findUnique({
				where: { id: input.id },
			});
		}),

	/**
	 * Create new service
	 */
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Название обязательно'),
				description: z.string().optional(),
				priceFrom: z.number().min(0, 'Цена должна быть положительной'),
				imageUrl: z.string().optional(),
				isActive: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DService.create({
				data: input,
			});
		}),

	/**
	 * Update service
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				priceFrom: z.number().min(0).optional(),
				imageUrl: z.string().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { id, ...data } = input;
			return await prisma.shop3DService.update({
				where: { id },
				data,
			});
		}),

	/**
	 * Delete service
	 */
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DService.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Toggle active status
	 */
	toggleActive: protectedProcedure
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DService.update({
				where: { id: input.id },
				data: { isActive: input.isActive },
			});
		}),

	/**
	 * Get stats
	 */
	getStats: protectedProcedure.query(async () => {
		const [total, active] = await Promise.all([
			prisma.shop3DService.count(),
			prisma.shop3DService.count({ where: { isActive: true } }),
		]);

		return { total, active, inactive: total - active };
	}),
});
