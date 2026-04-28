import type { NextAuthConfig } from "next-auth";

/**
 * Lightweight auth config used in Edge middleware.
 * Must NOT import Prisma (not supported in Edge runtime).
 * The real `authorize` logic lives in src/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // Providers are added in src/auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/api/auth");
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
};
