import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  symptoms: string[];
  clinicType: "online" | "offline";
  specialist: string;
  appointmentTime: Date;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  symptoms: {
    type: [String],
    required: true,
  },
  clinicType: {
    type: String,
    enum: ["online", "offline"],
    required: true,
  },
  specialist: {
    type: String,
    required: true,
  },
  appointmentTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);
export default Appointment;
