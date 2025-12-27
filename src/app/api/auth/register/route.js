import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "সব fields পূরণ করুন" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password কমপক্ষে 6 characters হতে হবে" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "এই email ইতিমধ্যে ব্যবহার করা হয়েছে" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await usersCollection.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে",
        userId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "কিছু একটা সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

