import { NextResponse } from "next/server";
import { dbConnect } from "@/config/dbconnect";
// import Doctor from "@/models/doctors";
import Appointment from "@/models/appointments";

export async function POST(req: Request) {
  try {
    const {
      patientId,
      doctorId,
      symptoms,
      clinicType,
      specialist,
      appointmentTime,
    } = await req.json();

    //     if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    //       return NextResponse.json(
    //         { error: "Symptoms are required and must be an array" },
    //         { status: 400 }
    //       );
    //     }

    //     if (!specialist) {
    //       return NextResponse.json(
    //         { error: "Specialist is required" },
    //         { status: 400 }
    //       );
    //     }

    //     if (!clinicType || !["online", "offline"].includes(clinicType)) {
    //       return NextResponse.json(
    //         {
    //           error:
    //             "Clinic type is required and must be either 'online' or 'offline'",
    //         },
    //         { status: 400 }
    //       );
    //     }

    //     if (!appointmentTime || isNaN(new Date(appointmentTime).getTime())) {
    //       return NextResponse.json(
    //         { error: "Valid appointment time is required" },
    //         { status: 400 }
    //       );
    //     }

    await dbConnect();

    //     const doctor = await Doctor.findById(doctorId);
    //     if (!doctor) {
    //       return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    //     }

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      symptoms,
      clinicType,
      specialist,
      appointmentTime,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newAppointment.save();

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        appointment: newAppointment,
      },
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
