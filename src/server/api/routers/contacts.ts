import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * tRPC роутер для управления контактными обращениями
 * Работает только с полями, существующими в модели ContactForm: id, name, email, message, status, userId, createdAt
 */
export const contactsRouter = createTRPCRouter({
  
  // Получить все обращения с пагинацией и фильтрацией
  getContacts: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(["new", "in_progress", "completed", "rejected", "all"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status } = input;
      const offset = (page - 1) * limit;

      // Базовые условия поиска
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (status !== "all") {
        where.status = status;
      }

      // Получаем обращения
      const [contacts, totalCount] = await Promise.all([
        ctx.prisma.contactForm.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        ctx.prisma.contactForm.count({ where })
      ]);

      return {
        contacts: contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          message: contact.message,
          status: contact.status as "new" | "in_progress" | "completed" | "rejected",
          createdAt: contact.createdAt,
          userId: contact.userId,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    }),

  // Получить обращение по ID
  getContact: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contactForm.findUnique({
        where: { id: input.id },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      if (!contact) {
        throw new Error("Обращение не найдено");
      }

      return {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        status: contact.status as "new" | "in_progress" | "completed" | "rejected",
        createdAt: contact.createdAt,
        userId: contact.userId,
        user: contact.User ? {
          id: contact.User.id,
          name: contact.User.name,
          email: contact.User.email,
        } : null,
      };
    }),

  // Обновить статус обращения
  updateStatus: protectedProcedure
    .input(z.object({
      contactId: z.string(),
      status: z.enum(["new", "in_progress", "completed", "rejected"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем существование обращения
      const existingContact = await ctx.prisma.contactForm.findUnique({
        where: { id: input.contactId }
      });

      if (!existingContact) {
        throw new Error("Обращение не найдено");
      }

      // Обновляем статус
      const updatedContact = await ctx.prisma.contactForm.update({
        where: { id: input.contactId },
        data: {
          status: input.status,
        }
      });

      return { 
        success: true, 
        message: "Статус успешно обновлен",
        contact: {
          id: updatedContact.id,
          status: updatedContact.status,
        }
      };
    }),

  // Удалить обращение
  deleteContact: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем существование обращения
      const existingContact = await ctx.prisma.contactForm.findUnique({
        where: { id: input.contactId }
      });

      if (!existingContact) {
        throw new Error("Обращение не найдено");
      }

      // Удаляем обращение
      await ctx.prisma.contactForm.delete({
        where: { id: input.contactId }
      });

      return { success: true, message: "Обращение успешно удалено" };
    }),

  // Получить статистику обращений
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Общее количество обращений
      const totalContacts = await ctx.prisma.contactForm.count();
      
      // Количество по статусам
      const [newCount, inProgressCount, completedCount, rejectedCount] = await Promise.all([
        ctx.prisma.contactForm.count({ where: { status: 'new' } }),
        ctx.prisma.contactForm.count({ where: { status: 'in_progress' } }),
        ctx.prisma.contactForm.count({ where: { status: 'completed' } }),
        ctx.prisma.contactForm.count({ where: { status: 'rejected' } })
      ]);

      // Обращения за последние 30 дней
      const last30Days = await ctx.prisma.contactForm.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Активность по дням за последние 7 дней
      const dailyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await ctx.prisma.contactForm.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });

        dailyActivity.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }

      return {
        totalContacts,
        byStatus: {
          new: newCount,
          inProgress: inProgressCount,
          completed: completedCount,
          rejected: rejectedCount,
        },
        last30Days,
        dailyActivity,
      };
    }),

  // Поиск обращений для автодополнения
  searchContacts: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const contacts = await ctx.prisma.contactForm.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { email: { contains: input.query, mode: 'insensitive' } },
            { message: { contains: input.query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          message: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: input.limit
      });

      return contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        message: contact.message.substring(0, 100) + (contact.message.length > 100 ? '...' : ''), // Обрезаем длинное сообщение
        status: contact.status as "new" | "in_progress" | "completed" | "rejected",
        createdAt: contact.createdAt,
      }));
    })
});