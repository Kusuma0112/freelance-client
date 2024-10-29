import { NextResponse } from 'next/server'
import twilio from 'twilio'
import User from '@/models/users'
import { dbConnect } from '@/config/dbconnect' // Ensure you have the correct path

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const client = twilio(accountSid, authToken)

const isValidPhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export async function POST(req: Request) {
  const body = await req.json();
  const { phoneNumber } = body;

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

    try{
      await dbConnect();
  const existingUser = await User.findOne({ 'phoneNo.value': phoneNumber }).exec()
  //userexist = true orelse exist not user = null
  console.log(existingUser);
      //if  user exist then send otp to user

      if (existingUser) {
        const verification = await client.verify.v2
          .services(verifyServiceSid!)
          .verifications.create({ to: phoneNumber, channel: 'sms' });
        
        return NextResponse.json({ 
          message: 'Verification code sent to existing user', 
          isNewUser: false,
        },{ status: 200 });
      } else {
        // If user does not exist, create a new user (optional)
        // You might want to handle user creation logic here
        
        const verification = await client.verify.v2
          .services(verifyServiceSid!)
          .verifications.create({ to: phoneNumber, channel: 'sms' });
        
        return NextResponse.json({ 
          message: 'Verification code sent to new user', 
          isNewUser: true
        },{ status: 200 });

    }
  } catch (error) {
    console.error('Error in phone authentication:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
