import mongoose, { Document, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  phoneNo: {
    value: string;
    isVerified: boolean;
  };
  password: string;
  speciality: string;
  experience: number;
  language: string;
  rating: number;
  clinicLocation: string;
  consultationFee: number;
  availableTimings: string;
  photoUrl?: object;
}

const DoctorSchema: Schema<IDoctor> = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNo: {
    value: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  password: {
    type: String,
    required: true,
  },
  speciality: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  clinicLocation: {
    type: String,
    required: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  availableTimings: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: Object,
    required: false,
  },
});

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);
