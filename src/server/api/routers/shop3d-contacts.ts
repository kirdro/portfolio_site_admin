import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../auth';

/**
 * tRPC Router for 3D Shop Contacts Management
 */
export const shop3dContactsRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z
				.object({
					isActive: z.boolean().optional(),
					type: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const where: any = {};
			if (input?.isActive !== undefined) {
				where.isActive = input.isActive;
			}
			if (input?.type) {
				where.type = input.type;
			}

			return await prisma.shop3DContact.findMany({
				where,
				orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
			});
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			return await prisma.shop3DContact.findUnique({
				where: { id: input.id },
			});
		}),

	create: protectedProcedure
		.input(
			z.object({
				type: z.string().min(1, 'Тип обязателен'),
				label: z.string().min(1, 'Название обязательно'),
				value: z.string().min(1, 'Значение обязательно'),
				icon: z.string().optional(),
				isActive: z.boolean().default(true),
				order: z.number().default(0),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			return await prisma.shop3DContact.create({
				data: input,
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				type: z.string().min(1).optional(),
				label: z.string().min(1).optional(),
				value: z.string().min(1).optional(),
				icon: z.string().optional(),
				isActive: z.boolean().optional(),
				order: z.number().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			const { id, ...data } = input;
			return await prisma.shop3DContact.update({
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

			return await prisma.shop3DContact.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Reorder contacts
	 */
	reorder: protectedProcedure
		.input(
			z.object({
				updates: z.array(
					z.object({
						id: z.string(),
						order: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			if (ctx.session.user.role !== 'ADMIN') {
				throw new Error('Недостаточно прав');
			}

			// Обновляем порядок для каждого контакта
			await Promise.all(
				input.updates.map((update) =>
					prisma.shop3DContact.update({
						where: { id: update.id },
						data: { order: update.order },
					}),
				),
			);

			return { success: true };
		}),

	/**
	 * Get contact types
	 */
	getTypes: protectedProcedure.query(async () => {
		const contacts = await prisma.shop3DContact.findMany({
			select: { type: true },
			distinct: ['type'],
			orderBy: { type: 'asc' },
		});

		return contacts.map((c) => c.type);
	}),

	getStats: protectedProcedure.query(async () => {
		const [total, active, types] = await Promise.all([
			prisma.shop3DContact.count(),
			prisma.shop3DContact.count({ where: { isActive: true } }),
			prisma.shop3DContact.findMany({
				select: { type: true },
				distinct: ['type'],
			}),
		]);

		return {
			total,
			active,
			inactive: total - active,
			types: types.length,
		};
	}),
});
