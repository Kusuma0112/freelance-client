import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import Doctor from "@/models/doctors";
import { NextResponse } from "next/server";

const createDoctorSchema = z.object({
  id: z.string().min(1, "ID must be at least 1 character"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNo: z.object({
    value: z.string().regex(/^(91|0)?[789]\d{9}$/, "Invalid phone number"),
    isVerified: z.boolean().default(false),
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  speciality: z.string().min(2, "Speciality must be at least 2 characters"),
  experience: z.number().min(0, "Experience must be a positive number"),
  language: z.string().min(2, "Language must be at least 2 characters"),
  rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
  clinicLocation: z
    .string()
    .min(2, "Clinic location must be at least 2 characters"),
  consultationFee: z
    .number()
    .min(0, "Consultation fee must be a positive number"),
  availableTimings: z
    .string()
    .min(2, "Available timings must be at least 2 characters"),
  photoUrl: z.object({}).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createDoctorSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const {
      id,
      name,
      email,
      phoneNo,
      password,
      speciality,
      experience,
      language,
      rating,
      clinicLocation,
      consultationFee,
      availableTimings,
      photoUrl,
    } = result.data;

    await dbConnect();

    const userExists = await Doctor.findOne({ "phoneNo.value": phoneNo.value });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      id,
      name,
      email,
      phoneNo,
      password: hashedPassword,
      speciality,
      experience,
      language,
      rating,
      clinicLocation,
      consultationFee,
      availableTimings,
      photoUrl,
    });

    await newDoctor.save();

    return NextResponse.json(
      { message: "Doctor created successfully" },
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
