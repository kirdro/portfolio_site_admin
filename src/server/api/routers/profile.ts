import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

const ProfileSchema = z.object({
	fullName: z.string().min(1, 'Имя обязательно'),
	title: z.string().min(1, 'Должность обязательна'),
	description: z.string().min(1, 'Описание обязательно'),
	avatarUrl: z.string().url().optional().or(z.literal('')),
	location: z.string().optional(),
	email: z.string().email().optional().or(z.literal('')),
	phone: z.string().optional(),
	website: z.string().url().optional().or(z.literal('')),
	github: z.string().url().optional().or(z.literal('')),
	linkedin: z.string().url().optional().or(z.literal('')),
	telegram: z.string().optional(),
	experienceYears: z.number().min(0).optional(),
	availability: z.enum(['available', 'busy', 'unavailable']).optional(),
});

export const profileRouter = createTRPCRouter({
	// Получить профиль
	get: publicProcedure.query(async ({ ctx }) => {
		const profile = await ctx.prisma.profileInfo.findFirst({
			orderBy: { createdAt: 'desc' },
		});

		// Если профиль не существует, возвращаем значения по умолчанию
		if (!profile) {
			return {
				id: '',
				fullName: 'Кирилл',
				title: 'Full-stack разработчик',
				description: 'Full-stack разработчик, создающий инновационные веб-решения с использованием современных технологий',
				avatarUrl: '',
				location: 'Россия',
				email: 'kirdro@yandex.ru',
				phone: '',
				website: '',
				github: '',
				linkedin: '',
				telegram: '',
				experienceYears: 5,
				availability: 'available' as const,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
		}

		return profile;
	}),

	// Создать или обновить профиль
	upsert: protectedProcedure
		.input(ProfileSchema)
		.mutation(async ({ ctx, input }) => {
			// Ищем существующий профиль
			const existingProfile = await ctx.prisma.profileInfo.findFirst();

			if (existingProfile) {
				// Обновляем существующий
				return await ctx.prisma.profileInfo.update({
					where: { id: existingProfile.id },
					data: {
						...input,
						updatedAt: new Date(),
					},
				});
			} else {
				// Создаем новый
				return await ctx.prisma.profileInfo.create({
					data: input,
				});
			}
		}),

	// Получить только основную информацию для главного сайта
	getBasicInfo: publicProcedure.query(async ({ ctx }) => {
		const profile = await ctx.prisma.profileInfo.findFirst({
			select: {
				fullName: true,
				title: true,
				description: true,
				avatarUrl: true,
				location: true,
				experienceYears: true,
				availability: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		// Значения по умолчанию
		if (!profile) {
			return {
				fullName: 'Кирилл',
				title: 'Full-stack разработчик',
				description: 'Full-stack разработчик, создающий инновационные веб-решения с использованием современных технологий',
				avatarUrl: null,
				location: 'Россия',
				experienceYears: 5,
				availability: 'available',
			};
		}

		return profile;
	}),

	// Получить контактную информацию
	getContactInfo: publicProcedure.query(async ({ ctx }) => {
		const profile = await ctx.prisma.profileInfo.findFirst({
			select: {
				email: true,
				phone: true,
				website: true,
				github: true,
				linkedin: true,
				telegram: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		if (!profile) {
			return {
				email: 'kirdro@yandex.ru',
				phone: null,
				website: null,
				github: null,
				linkedin: null,
				telegram: null,
			};
		}

		return profile;
	}),

	// Удалить профиль (только для админа)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.profileInfo.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),
});