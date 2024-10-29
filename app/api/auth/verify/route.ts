import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import twilio from 'twilio'
import { z } from 'zod'

const prisma = new PrismaClient()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const client = twilio(accountSid, authToken)

const verifySchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits")
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = verifySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { phoneNumber, otp } = result.data

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({ to: phoneNumber, code: otp })

    if (verification.status === 'approved') {
      await prisma.user.update({
        where: { phoneNumber },
        data: { phoneVerified: new Date() },
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in OTP verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}