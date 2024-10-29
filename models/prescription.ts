import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  name: string;
  age: number;
  specialization: string;
  phone: string;
  email: string;
  image: object;
  current: Date;
}

const PrescriptionSchema: Schema<IPrescription> = new mongoose.Schema({
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
