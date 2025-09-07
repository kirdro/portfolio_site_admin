import NextAuth from "next-auth";
import { authOptions } from "../../../../server/auth";

// Создаем обработчик NextAuth
const handler = NextAuth(authOptions);

// Экспортируем методы GET и POST для App Router
export { handler as GET, handler as POST };