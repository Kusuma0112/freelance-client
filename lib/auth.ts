import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import User from '@/models/users' // Adjust the import path as necessary

export const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters long"), // Adjust as needed
})

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" } // Change this if using OTP
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials.password) {
          return null
        }

        // Use Mongoose to find the user by phone number
        const user = await User.findOne({ 'phoneNo.value': credentials.phoneNumber }).exec()


        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          phoneNumber: user.phoneNo.value,
          name: user.name,
          email: user.email // Adjust based on your model
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        const existingUser = await User.findOne({ email: user.email! }).exec()

        if (!existingUser) {
          // Redirect to phone verification for new social users
          return '/auth/social-phone-verify'
        }

        if (!existingUser.phoneNo.isVerified) {
          // Redirect to phone verification if phone is not verified
          return '/auth/verify-phone'
        }
      }
      return true
    },
  },
}
