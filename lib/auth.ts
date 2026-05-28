import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (
          credentials?.email === "company@demo.com" &&
          credentials?.password === "password123"
        ) {
          return { id: "1", name: "Demo Company", email: "company@demo.com" }
        }
        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
})
