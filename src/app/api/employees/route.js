import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Generate Custom ID: BK-2025-0001
async function generateEmployeeId(db) {
  const currentYear = new Date().getFullYear();
  const prefix = `BK-${currentYear}-`;
  
  const lastEmployee = await db.collection("employees")
    .find({ employeeId: { $regex: `^${prefix}` } })
    .sort({ employeeId: -1 })
    .limit(1)
    .toArray();

  let nextSequence = 1;
  if (lastEmployee.length > 0) {
    const lastId = lastEmployee[0].employeeId;
    const sequencePart = lastId.split("-")[2];
    nextSequence = parseInt(sequencePart) + 1;
  }

  return `${prefix}${nextSequence.toString().padStart(4, "0")}`;
}

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
      
      const employee = await db.collection("employees").findOne({ _id: new ObjectId(id) });
      
      if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }

      // Fetch employee's salary payment history
      const salaryPayments = await db.collection("salaryPayments")
        .find({ employeeId: new ObjectId(id) })
        .sort({ paymentDate: -1, createdAt: -1 })
        .toArray();

      // Calculate totals
      const totalPaid = salaryPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalPayments = salaryPayments.length;

      return NextResponse.json({ 
        employee: {
          ...employee,
          stats: {
            totalPaid,
            totalPayments
          },
          salaryHistory: salaryPayments
        } 
      });
    }
    
    const employees = await db.collection("employees")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Fetch employees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
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
      name, 
      phone, 
      role, 
      salary, 
      salaryPeriod,
      salaryDays,
      joiningDate, 
      nid,
      address,
      emergencyContact,
      status = "active",
      image 
    } = body;

    if (!name || !phone || !role || !salary || !joiningDate) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Generate Custom ID
    const employeeId = await generateEmployeeId(db);

    const newEmployee = {
      employeeId,
      name,
      phone,
      role,
      salary: parseFloat(salary),
      salaryPeriod: salaryPeriod || "monthly",
      salaryDays: salaryPeriod === "custom" && salaryDays ? parseInt(salaryDays) : null,
      joiningDate: new Date(joiningDate),
      nid: nid || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      status,
      image: image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    };

    const result = await db.collection("employees").insertOne(newEmployee);

    return NextResponse.json({ 
      message: "Employee created successfully",
      employeeId: employeeId,
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
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
    const { 
      id,
      name, 
      phone, 
      role, 
      salary, 
      salaryPeriod,
      salaryDays,
      joiningDate, 
      nid,
      address,
      emergencyContact,
      status,
      image 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const updateData = {
      name,
      phone,
      role,
      salary: parseFloat(salary),
      joiningDate: new Date(joiningDate),
      nid,
      address,
      emergencyContact,
      status,
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    if (image !== undefined) updateData.image = image;

    const result = await db.collection("employees").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee updated successfully" });

  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
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

    const result = await db.collection("employees").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
