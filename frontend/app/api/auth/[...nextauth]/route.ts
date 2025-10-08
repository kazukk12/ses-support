import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Call backend to create/update user
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              google_id: user.id,
              avatar_url: user.image,
            }),
          })

          if (!response.ok) {
            console.error('Failed to sync user with backend')
            return false
          }

          return true
        } catch (error) {
          console.error('Error syncing user with backend:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        token.google_id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.google_id = token.google_id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }