import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import twilio from 'twilio';
import { dbConnect } from '@/config/dbconnect';
import User from '@/models/users';

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Schema for account creation validation
const createAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().regex(/^(91|0)?[789]\d{9}$/, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { email, firstName, lastName, password, phone, otp } = result.data;

    // Verify OTP
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({ to: phone, code: otp });

    if (verification.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Connect to MongoDB
    await dbConnect();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      phoneNo: {
        value: phone,
        isVerified: true, // Mark as verified after successful OTP verification
      },
    });

    // Remove sensitive information before sending the response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      user: userWithoutPassword 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in creating account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await mongoose.connection.close(); // Close connection to avoid leaks
  }
}
