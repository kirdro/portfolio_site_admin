import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const SettingValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.unknown()),
	z.record(z.string(), z.unknown()),
]);

const SettingSchema = z.object({
	key: z.string().min(1, 'Ключ настройки не может быть пустым'),
	value: SettingValueSchema,
});

const SystemSettingsSchema = z.object({
	siteName: z.string().min(1, 'Название сайта обязательно'),
	siteDescription: z.string().min(1, 'Описание сайта обязательно'),
	maintenanceMode: z.boolean(),
	allowRegistration: z.boolean(),
	maxFileSize: z.number().min(1).max(100),
	timezone: z.string(),
	language: z.string(),
});

const SecuritySettingsSchema = z.object({
	enableTwoFactor: z.boolean(),
	sessionTimeout: z.number().min(5).max(1440),
	passwordMinLength: z.number().min(6).max(50),
	enableCaptcha: z.boolean(),
	blockedIPs: z.array(z.string()),
	allowedDomains: z.array(z.string()),
});

export const settingsRouter = createTRPCRouter({
	// Получить настройку по ключу
	get: protectedProcedure
		.input(z.object({ key: z.string() }))
		.query(async ({ ctx, input }) => {
			const setting = await ctx.prisma.settings.findUnique({
				where: { key: input.key },
			});

			return setting?.value || null;
		}),

	// Получить все настройки
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const settings = await ctx.prisma.settings.findMany();
		return settings;
	}),

	// Сохранить одну настройку
	update: protectedProcedure
		.input(SettingSchema)
		.mutation(async ({ ctx, input }) => {
			const setting = await ctx.prisma.settings.upsert({
				where: { key: input.key },
				update: { value: input.value as any },
				create: {
					key: input.key,
					value: input.value as any,
				},
			});

			return setting;
		}),

	// Сохранить несколько настроек
	setMany: protectedProcedure
		.input(z.array(SettingSchema))
		.mutation(async ({ ctx, input }) => {
			const results = [];

			for (const setting of input) {
				const result = await ctx.prisma.settings.upsert({
					where: { key: setting.key },
					update: { value: setting.value as any },
					create: {
						key: setting.key,
						value: setting.value as any,
					},
				});
				results.push(result);
			}

			return results;
		}),

	// Сохранить системные настройки
	setSystemSettings: protectedProcedure
		.input(SystemSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const settingsToSave = Object.entries(input).map(
				([key, value]) => ({
					key: `system.${key}`,
					value,
				}),
			);

			const results = [];
			for (const setting of settingsToSave) {
				const result = await ctx.prisma.settings.upsert({
					where: { key: setting.key },
					update: { value: setting.value as any },
					create: {
						key: setting.key,
						value: setting.value as any,
					},
				});
				results.push(result);
			}

			return results;
		}),

	// Получить системные настройки
	getSystemSettings: protectedProcedure.query(async ({ ctx }) => {
		const settings = await ctx.prisma.settings.findMany({
			where: {
				key: {
					startsWith: 'system.',
				},
			},
		});

		const systemSettings: any = {
			siteName: 'Kirdro Portfolio Admin',
			siteDescription: 'Административная панель портфолио',
			maintenanceMode: false,
			allowRegistration: false,
			maxFileSize: 10,
			timezone: 'Europe/Moscow',
			language: 'ru',
		};

		settings.forEach((setting) => {
			const key = setting.key.replace('system.', '');
			systemSettings[key] = setting.value;
		});

		return systemSettings;
	}),

	// Сохранить настройки безопасности
	setSecuritySettings: protectedProcedure
		.input(SecuritySettingsSchema)
		.mutation(async ({ ctx, input }) => {
			const settingsToSave = Object.entries(input).map(
				([key, value]) => ({
					key: `security.${key}`,
					value,
				}),
			);

			const results = [];
			for (const setting of settingsToSave) {
				const result = await ctx.prisma.settings.upsert({
					where: { key: setting.key },
					update: { value: setting.value as any },
					create: {
						key: setting.key,
						value: setting.value as any,
					},
				});
				results.push(result);
			}

			return results;
		}),

	// Получить настройки безопасности
	getSecuritySettings: protectedProcedure.query(async ({ ctx }) => {
		const settings = await ctx.prisma.settings.findMany({
			where: {
				key: {
					startsWith: 'security.',
				},
			},
		});

		const securitySettings: any = {
			enableTwoFactor: false,
			sessionTimeout: 60,
			passwordMinLength: 8,
			enableCaptcha: false,
			blockedIPs: [],
			allowedDomains: ['kirdro.ru', 'admin.kirdro.ru'],
		};

		settings.forEach((setting) => {
			const key = setting.key.replace('security.', '');
			securitySettings[key] = setting.value;
		});

		return securitySettings;
	}),

	// Удалить настройку
	delete: protectedProcedure
		.input(z.object({ key: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.settings.delete({
				where: { key: input.key },
			});

			return { success: true };
		}),

	// Сбросить настройки к значениям по умолчанию
	reset: protectedProcedure
		.input(z.object({ category: z.enum(['system', 'security', 'all']) }))
		.mutation(async ({ ctx, input }) => {
			if (input.category === 'all') {
				await ctx.prisma.settings.deleteMany();
			} else {
				await ctx.prisma.settings.deleteMany({
					where: {
						key: {
							startsWith: `${input.category}.`,
						},
					},
				});
			}

			return {
				success: true,
				message: 'Настройки сброшены к значениям по умолчанию',
			};
		}),
});
