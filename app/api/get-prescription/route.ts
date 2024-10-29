import { NextResponse } from "next/server";
import { dbConnect } from "@/config/dbconnect";
import Prescription from "@/models/prescription";
/*
Test with:
curl -X POST http://localhost:3000/api/get-prescription \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER123"
  }'

OR

curl -X POST http://localhost:3000/api/get-prescription \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC456"
  }'

Response will be an array of prescriptions like:
[
  {
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
    },
    "current": "2024-01-20T10:30:00.000Z"
  }
]
*/


export async function POST(req: Request) {
  const { userId, doctorId } = await req.json();
  console.log("Fetching prescriptions for:", userId ? `User ${userId}` : `Doctor ${doctorId}`);

  try {
    await dbConnect();
    const prescriptions = await Prescription.find({
      ...(userId ? { userId } : { doctorId }),
    }).sort({ current: -1 }); // Sort by date in descending order to get latest first

    if (prescriptions.length === 0) {
      return NextResponse.json({ error: "No prescriptions found" }, { status: 404 });
    }
    // All prescriptions are already being returned in the response below

    return NextResponse.json(prescriptions, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
