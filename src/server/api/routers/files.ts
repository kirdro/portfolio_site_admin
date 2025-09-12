import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { uploadFileToS3, deleteFileFromS3 } from "../../../lib/s3";
import sharp from "sharp";

export const filesRouter = createTRPCRouter({
  // Загрузка файла
  upload: protectedProcedure
    .input(z.object({
      file: z.string(), // base64 encoded file
      fileName: z.string(),
      mimeType: z.string(),
      maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB default
      category: z.enum(['project', 'skill', 'blog', 'chat', 'main_photo']),
      optimizeImage: z.boolean().optional().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверка размера файла
      const fileBuffer = Buffer.from(input.file, 'base64');
      if (fileBuffer.length > input.maxSize) {
        throw new Error(`Файл слишком большой. Максимум: ${input.maxSize / 1024 / 1024}MB`);
      }

      // Оптимизация изображений
      let finalBuffer: Buffer = fileBuffer;
      if (input.optimizeImage && input.mimeType.startsWith('image/')) {
        finalBuffer = await sharp(Buffer.from(fileBuffer))
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Загрузка в S3
      const { s3Key, s3Url } = await uploadFileToS3(
        finalBuffer,
        input.fileName,
        input.mimeType
      );

      // Сохранение в БД
      const fileRecord = await ctx.prisma.files.create({
        data: {
          id: s3Key, // Используем s3Key как уникальный ID
          s3Key,
          s3Url,
          size: finalBuffer.length,
          mimeType: input.mimeType,
          originalName: input.fileName,
          uploadedBy: ctx.session.user.id,
          updatedAt: new Date(),
        },
      });

      return {
        id: fileRecord.id,
        url: s3Url,
        s3Key,
        size: finalBuffer.length,
      };
    }),

  // Удаление файла
  delete: protectedProcedure
    .input(z.object({
      fileId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.prisma.files.findUnique({
        where: { id: input.fileId }
      });

      if (!file) {
        throw new Error('Файл не найден');
      }

      // Удаление из S3
      await deleteFileFromS3(file.s3Key);

      // Удаление из БД
      await ctx.prisma.files.delete({
        where: { id: input.fileId }
      });

      return { success: true };
    }),

  // Получение файлов пользователя
  getUserFiles: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.files.findMany({
        where: {
          uploadedBy: ctx.session.user.id,
          ...(input.category && { originalName: { contains: input.category } }),
        },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      });
    }),

});