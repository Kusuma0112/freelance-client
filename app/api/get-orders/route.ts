import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import Order from "@/models/orders";
import { NextResponse } from "next/server";

const getOrdersSchema = z.object({
  userId: z.string().optional(),
  diagnosticCenterId: z.string().optional()
}).refine(data => {
  // Ensure either userId or diagnosticCenterId is provided, but not both
  return (data.userId !== undefined) !== (data.diagnosticCenterId !== undefined);
}, {
  message: "Either userId or diagnosticCenterId must be provided, but not both"
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = getOrdersSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    await dbConnect();

    const { userId, diagnosticCenterId } = result.data;

    // Build query based on provided ID
    const query = userId ? { userId } : { diagnosticCenterId };

    const orders = await Order.find(query).select({
      orderId: 1,
      userId: 1,
      diagnosticCenterId: 1,
      tests: 1,
      packages: 1,
      totalAmount: 1,
      status: 1,
      paymentStatus: 1,
      appointmentDate: 1,
      homeSampleCollection: 1,
      onlineReports: 1,
      address: 1,
      createdAt: 1,
      updatedAt: 1,
      _id: 0
    }).sort({ createdAt: -1 }); // Sort by newest first

    if (!orders.length) {
      return NextResponse.json(
        { message: "No orders found" },
        { status: 404 }
      );
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
