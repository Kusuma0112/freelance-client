import mongoose, { Document, Schema } from "mongoose";

export interface IDiagnosticCenter extends Document {
  id: string;
  name: string;
  email: string;
  phoneNo: {
    value: string;
    isVerified: boolean;
  };
  password: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  rating: number;
  tests: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  certifications: string[];
  accreditations: string[];
  packages: Array<{
    name: string;
    testCount: number;
    price: number;
    tests: string[];
  }>;
  services: {
    homeSampleCollection: boolean;
    onlineReports: boolean;
  };
  specialities: string[];
  image?: object;
}

const DiagnosticCenterSchema: Schema<IDiagnosticCenter> = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
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
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  tests: [{
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
  }],
  certifications: [{
    type: String
  }],
  accreditations: [{
    type: String
  }],
  packages: [{
    name: {
      type: String,
      required: false
    },
    testCount: {
      type: Number,
      required: false
    },
    price: {
      type: Number,
      required: false
    },
    tests: [{
      type: String,
      required: false
    }]
  }],
  services: {
    homeSampleCollection: {
      type: Boolean,
      default: false
    },
    onlineReports: {
      type: Boolean,
      default: false
    }
  },
  specialities: [{
    type: String
  }],
  image: {
    type: Object,
    required: false
  },
});

export default mongoose.models.DiagnosticCenter ||
  mongoose.model<IDiagnosticCenter>("DiagnosticCenter", DiagnosticCenterSchema);