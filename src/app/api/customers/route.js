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
      
      const customer = await db.collection("customers").findOne({ _id: new ObjectId(id) });
      
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      // Fetch customer's sales history
      const sales = await db.collection("sales")
        .find({ customerName: customer.name }) // Note: Ideally should link by ID, but using name for now based on Sales schema
        .sort({ date: -1 })
        .toArray();

      // Calculate totals from sales
      let totalPurchase = 0;
      let totalPaid = 0;
      let totalDue = 0;

      sales.forEach(sale => {
        totalPurchase += sale.totalAmount || 0;
        totalPaid += sale.paidAmount || 0;
        totalDue += sale.dueAmount || 0;
      });

      return NextResponse.json({ 
        customer: {
          ...customer,
          stats: {
            totalPurchase,
            totalPaid,
            totalDue
          },
          salesHistory: sales
        } 
      });
    }
    
    const customers = await db.collection("customers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate totalDue for each customer from their sales
    const customersWithDue = await Promise.all(
      customers.map(async (customer) => {
        const sales = await db.collection("sales")
          .find({ customerName: customer.name })
          .toArray();

        const totalDue = sales.reduce((sum, sale) => sum + (sale.dueAmount || 0), 0);

        return {
          ...customer,
          totalDue: totalDue
        };
      })
    );

    return NextResponse.json({ customers: customersWithDue });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
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
    const { name, phone, email, address, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and Phone are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Check if phone already exists
    const existingCustomer = await db.collection("customers").findOne({ phone });
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    const newCustomer = {
      name,
      phone,
      email: email || "",
      address: address || "",
      notes: notes || "",
      totalDue: 0,
      totalPaid: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    const result = await db.collection("customers").insertOne(newCustomer);

    return NextResponse.json({ 
      message: "Customer created successfully",
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, phone, email, address, notes } = body;

    if (!id || !name || !phone) {
      return NextResponse.json({ error: "ID, Name and Phone are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const updateData = {
      name,
      phone,
      email,
      address,
      notes,
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    const result = await db.collection("customers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer updated successfully" });

  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const result = await db.collection("customers").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
