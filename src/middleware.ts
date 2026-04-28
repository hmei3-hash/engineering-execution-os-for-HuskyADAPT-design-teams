import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the lightweight (Prisma-free) config for Edge middleware
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
