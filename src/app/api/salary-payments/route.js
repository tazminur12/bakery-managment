import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Record a salary payment for an employee
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, amount, paymentMethod, paymentDate, month, year, notes } = body;

    if (!employeeId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Employee ID and amount are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Get the employee
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(employeeId) });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const paymentValue = parseFloat(amount);
    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
    const paymentMonth = month || paymentDateObj.getMonth() + 1;
    const paymentYear = year || paymentDateObj.getFullYear();

    // Create salary payment record
    const salaryPayment = {
      employeeId: new ObjectId(employeeId),
      employeeName: employee.name,
      employeeEmployeeId: employee.employeeId,
      amount: paymentValue,
      paymentMethod: paymentMethod || "Cash",
      paymentDate: paymentDateObj,
      month: paymentMonth,
      year: paymentYear,
      notes: notes || "",
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    await db.collection("salaryPayments").insertOne(salaryPayment);

    return NextResponse.json({
      message: "Salary payment recorded successfully",
      payment: salaryPayment
    }, { status: 201 });

  } catch (error) {
    console.error("Record salary payment error:", error);
    return NextResponse.json(
      { error: "Failed to record salary payment" },
      { status: 500 }
    );
  }
}

// Get salary payment history for an employee or all employees
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    let query = {};
    if (employeeId && ObjectId.isValid(employeeId)) {
      query.employeeId = new ObjectId(employeeId);
    }
    if (month) {
      query.month = parseInt(month);
    }
    if (year) {
      query.year = parseInt(year);
    }

    const payments = await db.collection("salaryPayments")
      .find(query)
      .sort({ paymentDate: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ payments });

  } catch (error) {
    console.error("Fetch salary payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary payments" },
      { status: 500 }
    );
  }
}

