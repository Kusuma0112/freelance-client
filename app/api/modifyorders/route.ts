import { z } from "zod";
import { dbConnect } from "@/config/dbconnect";
import Order from "@/models/orders";
import { NextResponse } from "next/server";

const modifyOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  userId: z.string().optional(),
  diagnosticCenterId: z.string().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional()
}).refine(data => {
  // Ensure either userId or diagnosticCenterId is provided, but not both
  return (data.userId !== undefined) !== (data.diagnosticCenterId !== undefined);
}, {
  message: "Either userId or diagnosticCenterId must be provided, but not both"
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = modifyOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    await dbConnect();

    const { orderId, userId, diagnosticCenterId, status } = result.data;

    // Find the existing order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // If userId is provided, only allow cancellation
    if (userId) {
      if (userId !== order.userId) {
        return NextResponse.json(
          { error: "Unauthorized: User ID does not match order" },
          { status: 403 }
        );
      }

      if (order.status === "completed") {
        return NextResponse.json(
          { error: "Cannot cancel completed order" },
          { status: 400 }
        );
      }

      order.status = "cancelled";
    }

    // If diagnosticCenterId is provided, allow status updates
    if (diagnosticCenterId) {
      if (diagnosticCenterId !== order.diagnosticCenterId) {
        return NextResponse.json(
          { error: "Unauthorized: Diagnostic Center ID does not match order" },
          { status: 403 }
        );
      }

      if (status) {
        order.status = status;
      }
    }

    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json(
      { message: "Order updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}