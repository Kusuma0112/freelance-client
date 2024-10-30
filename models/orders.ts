import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  diagnosticCenterId: string;
  tests: Array<{
    name: string;
    price: number;
  }>;
  packages?: Array<{
    name: string;
    testCount: number;
    price: number;
    tests: string[];
  }>;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  appointmentDate: Date;
  homeSampleCollection: boolean;
  onlineReports: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  diagnosticCenterId: {
    type: String,
    required: true
  },
  tests: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  packages: [{
    name: {
      type: String,
      required: true
    },
    testCount: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    tests: [{
      type: String,
      required: true
    }]
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  homeSampleCollection: {
    type: Boolean,
    default: false
  },
  onlineReports: {
    type: Boolean,
    default: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Order || 
  mongoose.model<IOrder>("Order", OrderSchema);
