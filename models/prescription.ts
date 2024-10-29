import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  prescriptionId: string;
  userId: string;
  doctorId: string;
  name: string;
  age: number;
  specialization: string;
  phone: string;
  email: string;
  image: object;
  current: Date;
}

const PrescriptionSchema: Schema<IPrescription> = new mongoose.Schema({
  prescriptionId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
    required: true,
  },
  current: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Prescription = mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema
);
export default Prescription;
