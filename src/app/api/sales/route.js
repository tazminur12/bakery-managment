import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");
    
    const sales = await db.collection("sales")
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Fetch sales error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customerName, 
      items, // Array of { productName, quantity, price, unit, subtotal }
      totalAmount,
      paidAmount,
      dueAmount,
      paymentMethod,
      date,
      notes 
    } = body;

    if (!items || items.length === 0 || !totalAmount) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const newSale = {
      customerName: customerName || "Walk-in Customer",
      items,
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount || 0),
      dueAmount: parseFloat(dueAmount || 0),
      paymentMethod: paymentMethod || "Cash",
      status: parseFloat(dueAmount) > 0 ? "Due" : "Paid",
      date: date ? new Date(date) : new Date(),
      notes: notes || "",
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    const result = await db.collection("sales").insertOne(newSale);

    return NextResponse.json({ 
      message: "Sale created successfully",
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
