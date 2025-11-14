import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Tags Management
 */
export const shop3dTagsRouter = createTRPCRouter({
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

			return await prisma.shop3DTag.findMany({
				where,
				include: {
					_count: {
						select: { products: true },
					},
				},
				orderBy: { createdAt: 'desc' },
			});
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.shop3DTag.findUnique({
				where: { id: input.id },
				include: {
					_count: {
						select: { products: true },
					},
				},
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Название обязательно'),
				description: z.string().optional(),
				color: z.string().optional().default('#00FF99'),
				isActive: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DTag.create({
				data: input,
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				color: z.string().optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { id, ...data } = input;
			return await prisma.shop3DTag.update({
				where: { id },
				data,
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DTag.delete({
				where: { id: input.id },
			});
		}),

	getStats: protectedProcedure.query(async () => {
		const [total, active] = await Promise.all([
			prisma.shop3DTag.count(),
			prisma.shop3DTag.count({ where: { isActive: true } }),
		]);

		return { total, active, inactive: total - active };
	}),
});
