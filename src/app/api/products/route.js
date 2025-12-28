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
    
    // Check if ID is provided
    if (id) {
       if (!ObjectId.isValid(id)) {
         return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
       }
       const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
       if (!product) {
         return NextResponse.json({ error: "Product not found" }, { status: 404 });
       }
       return NextResponse.json({ product });
    }

    const products = await db.collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const { name, price, costPrice, unit, category, image, description } = body;

    if (!name || !price || !unit) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const newProduct = {
      name,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      unit,
      category: category || "General",
      image: image || null,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    };

    const result = await db.collection("products").insertOne(newProduct);

    return NextResponse.json({ 
      message: "Product created successfully",
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
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
    const { id, name, price, costPrice, unit, category, image, description } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const updateData = {
      name,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      unit,
      category,
      description,
      updatedAt: new Date(),
      updatedBy: session.user.id
    };

    if (image !== undefined) updateData.image = image;

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated successfully" });

  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
