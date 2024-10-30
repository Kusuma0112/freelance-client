import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import DiagnosticCenter from "@/models/diagnosticCenter";
import { NextResponse } from "next/server";


// when creating a diagnostic center, only these fields are mandatory:
// id
// name
// email
// phoneNo
// password
// address
// city
// state
// pincode
// All other fields will use their default values if not provided in the request body.

// Sample data for testing diagnostic center creation
/*const sampleData = [
  [
    {
      "id": "DC001",
      "name": "HealthFirst Diagnostics",
      "email": "contact@healthfirst.com",
      "phoneNo": {
        "value": "9876543210",
        "isVerified": false
      },
      "password": "password123",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    {
      "id": "DC002",
      "name": "Metro Labs",
      "email": "info@metrolabs.com",
      "phoneNo": {
        "value": "9898989898",
        "isVerified": true
      },
      "password": "metrolabs2024",
      "address": "45 Park Avenue",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "rating": 4.5,
      "tests": [
        {
          "name": "Complete Blood Count",
          "price": 500,
          "description": "Comprehensive blood test"
        },
        {
          "name": "Lipid Profile",
          "price": 800,
          "description": "Cholesterol and triglycerides test"
        }
      ],
      "services": {
        "homeSampleCollection": true,
        "onlineReports": true
      }
    },
    {
      "id": "DC003",
      "name": "Advanced Diagnostic Center",
      "email": "contact@advanceddc.com",
      "phoneNo": {
        "value": "9765432109",
        "isVerified": true
      },
      "password": "advanced2024secure",
      "address": "78 Healthcare Complex",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001",
      "rating": 4.8,
      "tests": [
        {
          "name": "COVID-19 RT-PCR",
          "price": 1200,
          "description": "Gold standard COVID test"
        }
      ],
      "certifications": ["ISO 9001:2015", "NABL"],
      "accreditations": ["NABH", "CAP"],
      "packages": [
        {
          "name": "Executive Health Checkup",
          "testCount": 3,
          "price": 2500,
          "tests": ["Blood Sugar", "Thyroid Profile", "Vitamin D"]
        }
      ],
      "services": {
        "homeSampleCollection": true,
        "onlineReports": true
      },
      "specialities": ["Molecular Diagnostics", "Genetic Testing"],
      "image": {
        "url": "https://example.com/center-image.jpg",
        "filename": "advanced-dc-building.jpg"
      }
    }
  ]
]; */


const createDiagnosticCenterSchema = z.object({
    id: z.string().min(1, "ID must be at least 1 character"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNo: z.object({
        value: z.string().regex(/^(91|0)?[789]\d{9}$/, "Invalid phone number"),
        isVerified: z.boolean().default(false),
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    address: z.string().min(2, "Address must be at least 2 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
    rating: z.number().min(0).max(5, "Rating must be between 0 and 5").default(0),
    tests: z.array(z.object({
        name: z.string().min(2, "Test name must be at least 2 characters"),
        price: z.number().min(0, "Price must be a positive number"),
        description: z.string().min(2, "Description must be at least 2 characters"),
    })).default([]),
    certifications: z.array(z.string()).default([]),
    accreditations: z.array(z.string()).default([]),
    packages: z.array(z.object({
        name: z.string().min(2, "Package name must be at least 2 characters"),
        testCount: z.number().min(1, "Test count must be at least 1"),
        price: z.number().min(0, "Price must be a positive number"),
        tests: z.array(z.string()),
    })).default([]),
    services: z.object({
        homeSampleCollection: z.boolean(),
        onlineReports: z.boolean(),
    }).default({ homeSampleCollection: false, onlineReports: false }),
    specialities: z.array(z.string()).default([]),
    image: z.object({}).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createDiagnosticCenterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const {
      id,
      name,
      email,
      phoneNo,
      password,
      address,
      city,
      state,
      pincode,
      rating,
      tests,
      certifications,
      accreditations,
      packages,
      services,
      specialities,
      image
    } = result.data;

    await dbConnect();

    const userExists = await DiagnosticCenter.findOne({ "phoneNo.value": phoneNo.value });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDiagnosticCenter = new DiagnosticCenter({
      id,
      name,
      email,
      phoneNo,
      password: hashedPassword,
      address,
      city,
      state,
      pincode,
      rating,
      tests,
      certifications,
      accreditations,
      packages,
      services,
      specialities,
      image,
    });

    await newDiagnosticCenter.save();

    return NextResponse.json(
      { message: "Diagnostic Center created successfully" },
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
