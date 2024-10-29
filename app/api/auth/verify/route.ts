import { NextResponse } from 'next/server';
import twilio from 'twilio';
import User from '@/models/users'; // Adjust the path as necessary
import { dbConnect } from '@/config/dbconnect'; // Ensure you have the correct path
import { z } from 'zod';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Validation schema for phone number and OTP
const verifySchema = z.object({
  phone: z.string()
    .trim() // Remove leading and trailing whitespace
    .regex(/^[1-9]\d{1,14}$/, "Invalid phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});


export async function POST(req: Request) {
  const body = await req.json();
  const result: any = verifySchema.safeParse(body);

  // Check for validation errors
  // if (!result.success) {
  //   return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  // }
  const { phone, otp } = result.data;
  const phoneNumber =  phone;
  const formetedphoneNumber = `+${phoneNumber}`;
  try {
    await dbConnect(); // Ensure you're connected to the database
    console.log(formetedphoneNumber);
    
    // Verify OTP using Twilio
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({ to: formetedphoneNumber, code: otp });
      
      console.log(verification.status);
  
    // Check if verification is approved
    if (verification.status === 'approved') {
      // Fetch user by phone number
      console.log(phoneNumber);
      
      const user = await User.findOne({ 'phoneNo.value': phoneNumber }).exec();

      if (user) {
        // User exists, return the user data
        return NextResponse.json({
          success: true,
          message: 'Account verified successfully',
          user: {
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo.value,
            isVerified: user.phoneNo.isVerified
          }
        }, { status: 200 });
    } else {
      // If OTP is not approved
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
  }
  }
   catch (error) {
    console.error('Error in OTP verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
