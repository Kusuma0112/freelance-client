import mongoose, { Document, Schema } from "mongoose";

export interface ILab extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  testsAvailable: string[];
  openingHours: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabSchema: Schema<ILab> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
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
  testsAvailable: {
    type: [String],
    required: true,
  },
  openingHours: {
    type: String,
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

const Lab = mongoose.model<ILab>("Lab", LabSchema);
export default Lab;
