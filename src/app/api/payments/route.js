import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Record a payment for a sale
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { saleId, paymentAmount, paymentMethod, notes } = body;

    if (!saleId || !paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Sale ID and payment amount are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(saleId)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Get the sale
    const sale = await db.collection("sales").findOne({ _id: new ObjectId(saleId) });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const currentPaid = sale.paidAmount || 0;
    const currentDue = sale.dueAmount || 0;
    const totalAmount = sale.totalAmount || 0;
    const paymentValue = parseFloat(paymentAmount);

    // Check if payment amount is valid
    if (paymentValue > currentDue) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed due amount (৳${currentDue})` },
        { status: 400 }
      );
    }

    // Calculate new values
    const newPaidAmount = currentPaid + paymentValue;
    const newDueAmount = Math.max(0, currentDue - paymentValue);
    const newStatus = newDueAmount === 0 ? "Paid" : "Due";

    // Update the sale
    await db.collection("sales").updateOne(
      { _id: new ObjectId(saleId) },
      {
        $set: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: newStatus,
          updatedAt: new Date(),
          updatedBy: {
            id: session.user.id,
            name: session.user.name
          }
        }
      }
    );

    // Create payment record
    const paymentRecord = {
      saleId: new ObjectId(saleId),
      customerName: sale.customerName,
      paymentAmount: paymentValue,
      paymentMethod: paymentMethod || sale.paymentMethod || "Cash",
      notes: notes || "",
      date: new Date(),
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    await db.collection("payments").insertOne(paymentRecord);

    return NextResponse.json({
      message: "Payment recorded successfully",
      payment: paymentRecord
    }, { status: 201 });

  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}

// Get payment history for a sale or customer
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get("saleId");
    const customerName = searchParams.get("customerName");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    let query = {};
    if (saleId && ObjectId.isValid(saleId)) {
      query.saleId = new ObjectId(saleId);
    }
    if (customerName) {
      query.customerName = customerName;
    }

    const payments = await db.collection("payments")
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ payments });

  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

