import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Lightweight config for Edge Runtime (middleware)
// Does NOT import Prisma or bcryptjs
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // authorize runs only in Node.js context (API route), not in Edge middleware
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
    authorized({ auth }) {
      return !!auth?.user
    },
  },
}
