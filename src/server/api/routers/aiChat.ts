import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { sendAIMessage, checkAIStatus, DEFAULT_SYSTEM_PROMPT, AI_MODELS, type AIModel } from "../../../lib/ai";

/**
 * tRPC роутер для управления AI-чатом
 * Все диалоги пользователей с AI, настройки и статистика
 * Обновлен для работы с реальной БД и поддержкой Groq API
 */
export const aiChatRouter = createTRPCRouter({
  // Получить все диалоги пользователей с AI
  getAllDialogs: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(["all", "active", "completed", "blocked"]).default("all"),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Группируем сообщения по пользователям для создания диалогов
      const messagesQuery = await ctx.prisma.aiChatMessage.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
        _min: {
          createdAt: true,
        },
        orderBy: {
          _max: {
            createdAt: 'desc',
          },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      });

      // Получаем данные пользователей и последние сообщения
      const dialogsData = await Promise.all(
        messagesQuery.map(async (group) => {
          const user = await ctx.prisma.user.findUnique({
            where: { id: group.userId },
            select: { id: true, name: true, email: true, image: true },
          });

          const lastMessage = await ctx.prisma.aiChatMessage.findFirst({
            where: { userId: group.userId },
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true },
          });

          return {
            id: group.userId,
            пользовательId: group.userId,
            пользователь: {
              id: user?.id || '',
              имя: user?.name || 'Неизвестно',
              email: user?.email || '',
              аватар: user?.image || `https://i.pravatar.cc/40?u=${group.userId}`,
            },
            статус: "active" as const, // По умолчанию активный
            количествоСообщений: group._count.id,
            последнееСообщение: lastMessage?.content?.slice(0, 100) + (lastMessage?.content && lastMessage?.content.length > 100 ? '...' : '') || '',
            времяСоздания: group._min.createdAt || new Date(),
            последняяАктивность: group._max.createdAt || new Date(),
            тегиТематики: [] as string[], // Заполним позже при необходимости
          };
        })
      );

      // Применяем фильтры поиска
      let filteredDialogs = dialogsData;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredDialogs = dialogsData.filter(d => 
          d.пользователь.имя.toLowerCase().includes(searchLower) ||
          d.пользователь.email.toLowerCase().includes(searchLower) ||
          d.последнееСообщение.toLowerCase().includes(searchLower)
        );
      }

      // Получаем общее количество диалогов
      const totalDialogs = await ctx.prisma.aiChatMessage.groupBy({
        by: ['userId'],
        _count: { id: true },
      });

      return {
        диалоги: filteredDialogs,
        всего: totalDialogs.length,
        страниц: Math.ceil(totalDialogs.length / input.limit),
        текущаяСтраница: input.page,
      };
    }),

  // Получить конкретный диалог со всеми сообщениями
  getDialogById: protectedProcedure
    .input(z.object({ 
      id: z.string() 
    }))
    .query(async ({ ctx, input }) => {
      // Получаем пользователя
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: { id: true, name: true, email: true, image: true },
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Получаем все сообщения диалога с этим пользователем
      const messages = await ctx.prisma.aiChatMessage.findMany({
        where: { userId: input.id },
        orderBy: { createdAt: 'asc' },
      });

      // Преобразуем сообщения в нужный формат
      const сообщения = messages.map(msg => ({
        id: msg.id,
        диалогId: input.id,
        отправитель: msg.isAI ? "ai" as const : "user" as const,
        содержимое: msg.content,
        времяОтправки: msg.createdAt,
        обработано: true,
        токеныИспользовано: msg.isAI ? Math.floor(msg.content.length / 4) : undefined, // Примерная оценка токенов
        времяГенерации: msg.isAI ? 1.5 : undefined,
        модель: msg.modelName || undefined,
      }));

      // Статистика
      const userMessages = сообщения.filter(m => m.отправитель === "user");
      const aiMessages = сообщения.filter(m => m.отправитель === "ai");
      const totalTokens = aiMessages.reduce((sum, m) => sum + (m.токеныИспользовано || 0), 0);

      const диалог = {
        id: input.id,
        пользователь: {
          id: user.id,
          имя: user.name || 'Неизвестно',
          email: user.email || '',
          аватар: user.image || `https://i.pravatar.cc/40?u=${user.id}`,
        },
        статус: "active" as const,
        времяСоздания: messages[0]?.createdAt || new Date(),
        последняяАктивность: messages[messages.length - 1]?.createdAt || new Date(),
        сообщения,
        статистика: {
          всегоСообщений: сообщения.length,
          сообщенийПользователя: userMessages.length,
          сообщенийAI: aiMessages.length,
          токеновПотрачено: totalTokens,
          среднееВремяОтвета: 1.5,
        },
      };

      return диалог;
    }),

  // Отправить сообщение от имени администратора в диалог
  sendAdminMessage: protectedProcedure
    .input(z.object({
      диалогId: z.string(),
      содержимое: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("Отправка сообщения администратора:", input);

      // Создаем новое сообщение в БД
      const новоеСообщение = await ctx.prisma.aiChatMessage.create({
        data: {
          content: input.содержимое,
          userId: input.диалогId,
          isAI: false, // Сообщение администратора считается пользовательским
          modelName: "admin",
          updatedAt: new Date(),
        },
      });

      return {
        id: новоеСообщение.id,
        диалогId: input.диалогId,
        отправитель: "admin" as const,
        содержимое: input.содержимое,
        времяОтправки: новоеСообщение.createdAt,
      };
    }),

  // Обновить настройки AI
  updateSettings: protectedProcedure
    .input(z.object({
      model: z.enum(["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]).default("llama3-8b-8192"),
      temperature: z.number().min(0).max(2),
      maxTokens: z.number().min(100).max(4096),
      systemPrompt: z.string().max(2000),
      messageLimit: z.number().min(1).max(200),
      moderationEnabled: z.boolean(),
      autoRespond: z.boolean(),
      responseDelay: z.number().min(0.5).max(5),
    }))
    .mutation(async ({ input }) => {
      console.log("Обновление настроек AI:", input);

      // В реальности здесь будет сохранение в БД
      // Можно добавить таблицу Settings для хранения этих значений
      return { 
        успех: true, 
        сообщение: "Настройки AI успешно обновлены" 
      };
    }),

  // Получить статистику использования AI
  getStats: protectedProcedure
    .input(z.object({
      период: z.enum(["day", "week", "month"]).default("day")
    }))
    .query(async ({ ctx, input }) => {
      // Определяем период для статистики
      const now = new Date();
      let dateFrom: Date;
      
      switch (input.период) {
        case "day":
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Получаем общее количество сообщений
      const totalMessages = await ctx.prisma.aiChatMessage.count({
        where: {
          createdAt: {
            gte: dateFrom,
          },
        },
      });

      // Сообщения пользователей vs AI
      const userMessages = await ctx.prisma.aiChatMessage.count({
        where: {
          isAI: false,
          createdAt: {
            gte: dateFrom,
          },
        },
      });

      const aiMessages = await ctx.prisma.aiChatMessage.count({
        where: {
          isAI: true,
          createdAt: {
            gte: dateFrom,
          },
        },
      });

      // Уникальные диалоги (пользователи)
      const uniqueDialogs = await ctx.prisma.aiChatMessage.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: dateFrom,
          },
        },
      });

      // Активность по часам
      const hourlyActivity = await ctx.prisma.$queryRaw<Array<{hour: number, count: bigint}>>`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as count
        FROM "AiChatMessage"
        WHERE "createdAt" >= ${dateFrom}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour
      `;

      // Преобразуем данные по часам
      const активностьПоЧасам = Array.from({ length: 24 }, (_, час) => {
        const hourData = hourlyActivity.find(h => Number(h.hour) === час);
        return {
          час,
          диалоги: 0, // Можно добавить подсчет уникальных пользователей по часам
          сообщения: Number(hourData?.count || 0),
        };
      });

      const статистика = {
        всегоДиалогов: uniqueDialogs.length,
        активныхДиалогов: uniqueDialogs.length, // Все считаем активными
        завершенныхДиалогов: 0,
        заблокированныхДиалогов: 0,
        всегоСообщений: totalMessages,
        сообщенийПользователей: userMessages,
        сообщенийAI: aiMessages,
        среднееВремяОтвета: 2.3, // Статическое значение пока
        успешныхОтветов: aiMessages > 0 ? Math.round((aiMessages / (userMessages + aiMessages)) * 100 * 10) / 10 : 0,
        использованиеТокенов: {
          всего: aiMessages * 120, // Примерная оценка
          среднееНаСообщение: aiMessages > 0 ? 120 : 0,
          топЗапросовПоТокенам: [] as Array<{диалогId: string, токены: number, тема: string}>,
        },
        популярныеТемы: [
          { тема: "проекты", количество: Math.floor(totalMessages * 0.3) },
          { тема: "навыки", количество: Math.floor(totalMessages * 0.25) },
          { тема: "технологии", количество: Math.floor(totalMessages * 0.2) },
          { тема: "карьера", количество: Math.floor(totalMessages * 0.15) },
          { тема: "контакты", количество: Math.floor(totalMessages * 0.1) },
        ],
        активностьПоЧасам,
      };

      return статистика;
    }),

  // Заблокировать пользователя в AI чате
  blockUser: protectedProcedure
    .input(z.object({
      пользовательId: z.string(),
      причина: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log("Блокировка пользователя в AI чате:", input);

      // В реальности здесь будет обновление статуса в БД
      // Можно добавить поле blocked в таблицу User или создать отдельную таблицу BlockedUsers
      return { 
        успех: true, 
        сообщение: "Пользователь заблокирован в AI чате" 
      };
    }),

  // Экспортировать диалог
  exportDialog: protectedProcedure
    .input(z.object({
      диалогId: z.string(),
      формат: z.enum(["json", "txt", "csv"]),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("Экспорт диалога:", input);

      // Получаем все сообщения диалога
      const messages = await ctx.prisma.aiChatMessage.findMany({
        where: { userId: input.диалогId },
        orderBy: { createdAt: 'asc' },
      });

      // В реальности здесь будет генерация файла для скачивания
      let content = "";
      switch (input.формат) {
        case "json":
          content = JSON.stringify(messages, null, 2);
          break;
        case "txt":
          content = messages.map(msg => 
            `[${msg.createdAt.toISOString()}] ${msg.isAI ? 'AI' : 'User'}: ${msg.content}`
          ).join('\n');
          break;
        case "csv":
          content = "timestamp,sender,content\n" + messages.map(msg => 
            `${msg.createdAt.toISOString()},${msg.isAI ? 'AI' : 'User'},"${msg.content.replace(/"/g, '""')}"`
          ).join('\n');
          break;
      }

      return {
        файл: `dialog-${input.диалогId}.${input.формат}`,
        содержимое: content,
        размер: `${(content.length / 1024).toFixed(1)} KB`,
      };
    }),

  // Получить настройки AI
  getSettings: protectedProcedure
    .query(async () => {
      // Проверяем статус AI API
      const aiStatus = await checkAIStatus();

      // Получаем настройки из БД или используем значения по умолчанию
      // В будущем можно добавить таблицу Settings для хранения этих значений
      const настройки = {
        model: "llama3-8b-8192" as AIModel,
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        messageLimit: 50,
        moderationEnabled: true,
        autoRespond: true,
        responseDelay: 1.5,
        доступныеМодели: AI_MODELS,
        статусAPI: {
          доступен: aiStatus.available,
          задержка: aiStatus.latency,
          последняяПроверка: new Date(),
          ошибка: aiStatus.error,
        }
      };

      return настройки;
    }),

  // Тестировать настройки AI 
  testSettings: protectedProcedure
    .input(z.object({
      тестовоеСообщение: z.string().default("Привет! Расскажи о проектах Кирилла."),
      модель: z.enum(["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]).optional(),
    }))
    .mutation(async ({ input }) => {
      console.log("Тестирование настроек AI с сообщением:", input.тестовоеСообщение);

      try {
        // Реальный вызов AI API
        const aiResponse = await sendAIMessage([
          { role: "system", content: DEFAULT_SYSTEM_PROMPT },
          { role: "user", content: input.тестовоеСообщение }
        ], {
          model: input.модель || "llama3-8b-8192",
          temperature: 0.7,
          maxTokens: 200,
        });

        const результатТеста = {
          запрос: input.тестовоеСообщение,
          ответAI: aiResponse.content,
          времяОтвета: aiResponse.responseTime,
          токеныИспользовано: aiResponse.tokens,
          статус: "success" as const,
          модель: aiResponse.model,
          температура: 0.7,
        };

        return результатТеста;
      } catch (error) {
        console.error("Ошибка тестирования AI:", error);
        
        return {
          запрос: input.тестовоеСообщение,
          ответAI: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          времяОтвета: 0,
          токеныИспользовано: 0,
          статус: "error" as const,
          модель: input.модель || "llama3-8b-8192",
          температура: 0.7,
        };
      }
    }),

  // Отправить сообщение AI и получить ответ (для реального AI чата)
  sendAIResponse: protectedProcedure
    .input(z.object({
      пользовательId: z.string(),
      сообщение: z.string().min(1).max(2000),
      модель: z.enum(["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Сохраняем сообщение пользователя в БД
        const userMessage = await ctx.prisma.aiChatMessage.create({
          data: {
            content: input.сообщение,
            userId: input.пользовательId,
            isAI: false,
            updatedAt: new Date(),
          },
        });

        // Получаем последние сообщения для контекста (последние 10)
        const recentMessages = await ctx.prisma.aiChatMessage.findMany({
          where: { userId: input.пользовательId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        // Формируем контекст для AI
        const messages = [
          { role: "system", content: DEFAULT_SYSTEM_PROMPT } as const,
          ...recentMessages.reverse().map(msg => ({
            role: msg.isAI ? "assistant" : "user",
            content: msg.content,
          } as const))
        ];

        // Отправляем запрос к AI
        const aiResponse = await sendAIMessage(messages, {
          model: input.модель || "llama3-8b-8192",
          temperature: 0.7,
          maxTokens: 1024,
        });

        // Сохраняем ответ AI в БД
        const aiMessage = await ctx.prisma.aiChatMessage.create({
          data: {
            content: aiResponse.content,
            userId: input.пользовательId,
            isAI: true,
            modelName: aiResponse.model,
            updatedAt: new Date(),
          },
        });

        return {
          пользовательскоеСообщение: {
            id: userMessage.id,
            содержимое: userMessage.content,
            время: userMessage.createdAt,
          },
          ответAI: {
            id: aiMessage.id,
            содержимое: aiResponse.content,
            время: aiMessage.createdAt,
            модель: aiResponse.model,
            токены: aiResponse.tokens,
            времяОтвета: aiResponse.responseTime,
          },
        };
      } catch (error) {
        console.error("Ошибка AI чата:", error);
        throw new Error(`Ошибка обращения к AI: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }),
});