/**
 * lib/authOptions.js
 * Description: Central NextAuth configuration shared by the API route
 * handler and any server component that needs the current session. Uses
 * the Credentials provider so users log in with email + password stored
 * (hashed) in MongoDB. On successful login, the user's database role
 * ("admin" or "employee") is embedded in the JWT and then exposed on
 * session.user.role, which the rest of the app uses for authorization.
 * Inputs: email/password submitted via the login form.
 * Processing: looks up the user, compares password hash with bcrypt.
 * Output: a NextAuth session object (or null on failed login).
 */

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        // Only return the fields we want exposed to the client/session.
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Persist role onto the JWT the first time (on sign-in).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Expose id/role on the session object used throughout the app.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
