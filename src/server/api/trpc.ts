import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth";
import { prisma } from "../auth";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * Создание контекста для tRPC
 * Контекст используется для передачи данных, которые доступны всем процедурам
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * Создание контекста для tRPC на стороне сервера
 * Получаем сессию пользователя из NextAuth
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Получаем сессию из NextAuth с поддержкой App Router
  let session;
  try {
    if (req && res) {
      // Для Pages Router
      session = await getServerSession(req, res, authOptions);
    } else {
      // Для App Router - используем headers
      const { headers } = await import('next/headers');
      session = await getServerSession(authOptions);
    }
  } catch (error) {
    console.error('Error getting session:', error);
    session = null;
  }

  return createInnerTRPCContext({
    session,
  });
};

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Создание tRPC роутера
 */
export const createTRPCRouter = t.router;

/**
 * Публичная процедура - доступна всем пользователям
 */
export const publicProcedure = t.procedure;

/**
 * Защищённая процедура - доступна только авторизованным пользователям
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

/**
 * Админская процедура - доступна только администраторам
 */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Недостаточно прав доступа" });
  }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);