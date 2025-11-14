import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Plastics/Materials Management
 */
export const shop3dPlasticsRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z
				.object({
					isActive: z.boolean().optional(),
					material: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const where: any = {};
			if (input?.isActive !== undefined) {
				where.isActive = input.isActive;
			}
			if (input?.material) {
				where.material = input.material;
			}

			return await prisma.shop3DPlastic.findMany({
				where,
				include: {
					_count: {
						select: { products: true },
					},
				},
				orderBy: [{ material: 'asc' }, { color: 'asc' }],
			});
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.shop3DPlastic.findUnique({
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
				material: z.string().min(1, 'Материал обязателен'),
				color: z.string().min(1, 'Цвет обязателен'),
				colorHex: z.string().optional(),
				characteristics: z.any().optional(),
				pricePerGram: z.number().min(0).optional(),
				isActive: z.boolean().default(true),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DPlastic.create({
				data: input,
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				material: z.string().min(1).optional(),
				color: z.string().min(1).optional(),
				colorHex: z.string().optional(),
				characteristics: z.any().optional(),
				pricePerGram: z.number().min(0).optional(),
				isActive: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { id, ...data } = input;
			return await prisma.shop3DPlastic.update({
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

			return await prisma.shop3DPlastic.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Get unique materials
	 */
	getMaterials: protectedProcedure.query(async () => {
		const plastics = await prisma.shop3DPlastic.findMany({
			where: { isActive: true },
			select: { material: true },
			distinct: ['material'],
			orderBy: { material: 'asc' },
		});

		return plastics.map((p) => p.material);
	}),

	getStats: protectedProcedure.query(async () => {
		const [total, active, materials] = await Promise.all([
			prisma.shop3DPlastic.count(),
			prisma.shop3DPlastic.count({ where: { isActive: true } }),
			prisma.shop3DPlastic.findMany({
				select: { material: true },
				distinct: ['material'],
			}),
		]);

		return {
			total,
			active,
			inactive: total - active,
			materials: materials.length,
		};
	}),
});
