import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import Prescription from "@/models/prescription";
import { NextResponse } from "next/server";

const createPrescriptionSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID must be at least 1 character"),
  userId: z.string().min(1, "User ID must be at least 1 character"),
  doctorId: z.string().min(1, "Doctor ID must be at least 1 character"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0, "Age must be a positive number"),
  specialization: z.string().min(2, "Specialization must be at least 2 characters"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address"),
  image: z.object({
    url: z.string().url("Invalid image URL"),
    filename: z.string().min(1, "Filename is required")
  }),
  current: z.date().default(() => new Date()),
});



/*
Test with:
curl -X POST http://localhost:3000/api/prescription \
  -H "Content-Type: application/json" \
  -d '{
    "prescriptionId": "PRESC789",
    "userId": "USER123", 
    "doctorId": "DOC456",
    "name": "John Doe",
    "age": 35,
    "specialization": "Cardiology", 
    "phone": "+919876543210",
    "email": "john.doe@example.com",
    "image": {
      "url": "https://example.com/prescription1.jpg",
      "filename": "prescription1.jpg"
    }
  }'
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createPrescriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const {
      prescriptionId,
      userId,
      doctorId,
      name,
      age,
      specialization,
      phone,
      email,
      image,
      current,
    } = result.data;

    await dbConnect();

    const newPrescription = new Prescription({
      prescriptionId,
      userId,
      doctorId,
      name,
      age,
      specialization,
      phone,
      email,
      image,
      current,
    });

    await newPrescription.save();

    return NextResponse.json(
      { message: "Prescription created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
