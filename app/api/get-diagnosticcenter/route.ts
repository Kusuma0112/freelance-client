import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import DiagnosticCenter from "@/models/diagnosticCenter";
import { NextResponse } from "next/server";

const searchSchema = z.object({
  name: z.string().optional(),
  tests: z.array(z.string()).optional(),
  specialities: z.array(z.string()).optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  rating: z.number().optional()
});

/*
Test with:

1. Search by name:
curl -X POST http://localhost:3000/api/get-diagnosticcenter \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Metro"
  }'

2. Search by tests and rating:
curl -X POST http://localhost:3000/api/get-diagnosticcenter \
  -H "Content-Type: application/json" \
  -d '{
    "tests": ["Blood Sugar", "Lipid Profile"],
    "rating": 4
  }'

3. Search by location:
curl -X POST http://localhost:3000/api/get-diagnosticcenter \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'

4. Search by specialities:
curl -X POST http://localhost:3000/api/get-diagnosticcenter \
  -H "Content-Type: application/json" \
  -d '{
    "specialities": ["Molecular Diagnostics", "Genetic Testing"]
  }'

5. Combined search:
curl -X POST http://localhost:3000/api/get-diagnosticcenter \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Health",
    "city": "Mumbai",
    "rating": 4,
    "tests": ["COVID-19"],
    "specialities": ["Molecular Diagnostics"]
  }'
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = searchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    await dbConnect();

    // Build query object based on provided search criteria
    const query: any = {};

    if (result.data.name) {
      query.name = { $regex: `.*${result.data.name}.*`, $options: 'i' };
    }

    if (result.data.tests?.length) {
      query['tests.name'] = { $in: result.data.tests };
    }
    if (result.data.specialities?.length) {
      query.specialities = { $in: result.data.specialities };
    }

    if (result.data.pincode) {
      query.pincode = result.data.pincode;
    }

    if (result.data.city) {
      query.city = { $regex: result.data.city, $options: 'i' };
    }

    if (result.data.state) {
      query.state = { $regex: result.data.state, $options: 'i' };
    }

    // Select only required fields
    const centers = await DiagnosticCenter.find(query).select({
      diagnosticCenterId: 1,
      name: 1,
      email: 1,
      phoneNo: 1,
      address: 1,
      city: 1,
      state: 1,
      pincode: 1,
      rating: 1,
      tests: 1,
      packages: 1,
      certifications: 1,
      accreditations: 1,
      services: 1,
      specialities: 1,
      image: 1,
      _id: 0
    });

    if (!centers.length) {
      return NextResponse.json(
        { message: "No diagnostic centers found matching the criteria" },
        { status: 404 }
      );
    }

    return NextResponse.json(centers, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
