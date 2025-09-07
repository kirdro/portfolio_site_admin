import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { createTRPCContext } from "../../../../server/api/trpc";
import { appRouter } from "../../../../server/api/root";

/**
 * Обработчик HTTP запросов для tRPC API
 * Поддерживает все HTTP методы (GET, POST, etc.)
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req: undefined as any, res: undefined as any, info: undefined as any }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };