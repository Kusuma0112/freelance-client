import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import Order from "@/models/orders";
import { NextResponse } from "next/server";

const createOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  diagnosticCenterId: z.string().min(1, "Diagnostic Center ID is required"),
  tests: z.array(z.object({
    name: z.string().min(1, "Test name is required"),
    price: z.number().min(0, "Price must be a positive number")
  })),
  packages: z.array(z.object({
    name: z.string().min(1, "Package name is required"), 
    testCount: z.number().min(1, "Test count must be at least 1"),
    price: z.number().min(0, "Price must be a positive number"),
    tests: z.array(z.string().min(1, "Test name is required"))
  })).optional(),
  totalAmount: z.number().min(0, "Total amount must be a positive number"),
  appointmentDate: z.string().transform(str => new Date(str)),
  homeSampleCollection: z.boolean().default(false),
  onlineReports: z.boolean().default(false),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"), 
    state: z.string().min(1, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode")
  }).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    await dbConnect();

    // Generate unique order ID
    const orderId = "ORD" + Date.now().toString();

    const newOrder = new Order({
      orderId,
      ...result.data,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrder.save();

    return NextResponse.json(
      { message: "Order created successfully", orderId },
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
