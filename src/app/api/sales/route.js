import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
      
      const sale = await db.collection("sales").findOne({ _id: new ObjectId(id) });
      
      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      return NextResponse.json({ sale });
    }
    
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
      subtotal,
      discount,
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

    // Update product stock for each item (only if stock is tracked)
    for (const item of items) {
      if (item.productId || item._id) {
        const productId = item.productId || item._id;
        
        if (ObjectId.isValid(productId)) {
          const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });
          
          // Update stock (initialize to 0 if not tracked, then reduce)
          if (product) {
            const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
            const newStock = currentStock - item.quantity;
            
            if (newStock < 0) {
              return NextResponse.json(
                { error: `${item.name} এর স্টক অপর্যাপ্ত! বর্তমান স্টক: ${currentStock}` },
                { status: 400 }
              );
            }
            
            await db.collection("products").updateOne(
              { _id: new ObjectId(productId) },
              { 
                $set: { 
                  stock: newStock,
                  updatedAt: new Date()
                } 
              }
            );
          }
        }
      }
    }

    const newSale = {
      customerName: customerName || "Walk-in Customer",
      items,
      subtotal: parseFloat(subtotal || totalAmount),
      discount: parseFloat(discount || 0),
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
