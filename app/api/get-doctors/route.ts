import { NextResponse } from "next/server";
import { dbConnect } from "@/config/dbconnect";
import Doctor from "@/models/doctors";

export async function POST(req: Request) {
  const { location, specialization, consultType, symptoms } = await req.json();
  console.log(consultType, symptoms);

  if (!location) {
    return NextResponse.json(
      { error: "Location is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const doctors = await Doctor.find({
      clinicLocation: location,
      speciality: specialization,
    });

    if (doctors.length === 0) {
      return NextResponse.json({ error: "No doctors found" }, { status: 404 });
    }

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
