import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");
    
    // Get query params for filtering by date if needed
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    let query = {};
    if (dateParam) {
      const startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateParam);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const productionLogs = await db.collection("production")
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(100) // Limit to last 100 entries for performance
      .toArray();

    return NextResponse.json({ productionLogs });
  } catch (error) {
    console.error("Fetch production error:", error);
    return NextResponse.json(
      { error: "Failed to fetch production logs" },
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
    const { productName, quantity, unit, status, date, notes, image } = body;

    if (!productName || !quantity || !unit) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const newProduction = {
      productName,
      quantity: parseFloat(quantity),
      unit,
      status: status || "Completed",
      notes: notes || "",
      image: image || null,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    const result = await db.collection("production").insertOne(newProduction);

    return NextResponse.json({ 
      message: "Production logged successfully",
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create production error:", error);
    return NextResponse.json(
      { error: "Failed to log production" },
      { status: 500 }
    );
  }
}
