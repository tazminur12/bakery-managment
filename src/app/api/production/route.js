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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const dateParam = searchParams.get("date");

    // Get single production entry by ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
      
      const productionLog = await db.collection("production").findOne({ _id: new ObjectId(id) });
      
      if (!productionLog) {
        return NextResponse.json({ error: "Production log not found" }, { status: 404 });
      }

      return NextResponse.json({ productionLog });
    }

    // Get all production logs with optional date filter
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
      .limit(100)
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

    const productionDate = date ? new Date(date) : new Date();
    productionDate.setHours(0, 0, 0, 0);
    const productionDateEnd = new Date(productionDate);
    productionDateEnd.setHours(23, 59, 59, 999);

    // Check if production entry exists for same product and date
    const existingProduction = await db.collection("production").findOne({
      productName: productName,
      date: {
        $gte: productionDate,
        $lte: productionDateEnd
      }
    });

    // Find product by name to update stock
    const product = await db.collection("products").findOne({ name: productName });
    
    if (existingProduction) {
      // Update existing entry by adding new quantity
      const updatedQuantity = existingProduction.quantity + parseFloat(quantity);
      
      const result = await db.collection("production").updateOne(
        { _id: existingProduction._id },
        {
          $set: {
            quantity: updatedQuantity,
            status: status || existingProduction.status,
            notes: notes !== undefined ? notes : existingProduction.notes,
            image: image !== undefined ? image : existingProduction.image,
            updatedAt: new Date(),
            updatedBy: {
              id: session.user.id,
              name: session.user.name
            }
          }
        }
      );

      // Update product stock (add the new quantity)
      if (product) {
        const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
        await db.collection("products").updateOne(
          { _id: product._id },
          {
            $set: {
              stock: currentStock + parseFloat(quantity),
              updatedAt: new Date()
            }
          }
        );
      }

      return NextResponse.json({ 
        message: "Production updated successfully (quantity added)",
        id: existingProduction._id,
        isUpdate: true
      }, { status: 200 });
    } else {
      // Create new entry
      const newProduction = {
        productName,
        quantity: parseFloat(quantity),
        unit,
        status: status || "Completed",
        notes: notes || "",
        image: image || null,
        date: productionDate,
        createdAt: new Date(),
        createdBy: {
          id: session.user.id,
          name: session.user.name
        }
      };

      const result = await db.collection("production").insertOne(newProduction);

      // Update product stock (add the production quantity)
      if (product) {
        const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
        await db.collection("products").updateOne(
          { _id: product._id },
          {
            $set: {
              stock: currentStock + parseFloat(quantity),
              updatedAt: new Date()
            }
          }
        );
      }

      return NextResponse.json({ 
        message: "Production logged successfully",
        id: result.insertedId,
        isUpdate: false
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Create production error:", error);
    return NextResponse.json(
      { error: "Failed to log production" },
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
    const { id, productName, quantity, unit, status, date, notes, image } = body;

    if (!id || !productName || !quantity || !unit) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Get old production entry to calculate stock difference
    const oldProduction = await db.collection("production").findOne({ _id: new ObjectId(id) });
    
    if (!oldProduction) {
      return NextResponse.json({ error: "Production log not found" }, { status: 404 });
    }

    const updateData = {
      productName,
      quantity: parseFloat(quantity),
      unit,
      status: status || "Completed",
      notes: notes || "",
      updatedAt: new Date(),
      updatedBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    if (date) {
      const productionDate = new Date(date);
      productionDate.setHours(0, 0, 0, 0);
      updateData.date = productionDate;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    const result = await db.collection("production").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Production log not found" }, { status: 404 });
    }

    // Update product stock (calculate difference)
    const product = await db.collection("products").findOne({ name: productName });
    if (product) {
      const oldQuantity = oldProduction.quantity || 0;
      const newQuantity = parseFloat(quantity);
      const quantityDifference = newQuantity - oldQuantity;
      
      if (quantityDifference !== 0) {
        const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
        const newStock = currentStock + quantityDifference;
        
        await db.collection("products").updateOne(
          { _id: product._id },
          {
            $set: {
              stock: Math.max(0, newStock), // Don't allow negative stock
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({ message: "Production updated successfully" });

  } catch (error) {
    console.error("Update production error:", error);
    return NextResponse.json(
      { error: "Failed to update production" },
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

    // Get production entry before deleting to update stock
    const production = await db.collection("production").findOne({ _id: new ObjectId(id) });

    const result = await db.collection("production").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Production log not found" }, { status: 404 });
    }

    // Reduce product stock when production is deleted
    if (production && production.productName) {
      const product = await db.collection("products").findOne({ name: production.productName });
      if (product) {
        const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
        const newStock = Math.max(0, currentStock - (production.quantity || 0)); // Don't allow negative stock
        
        await db.collection("products").updateOne(
          { _id: product._id },
          {
            $set: {
              stock: newStock,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({ message: "Production deleted successfully" });
  } catch (error) {
    console.error("Delete production error:", error);
    return NextResponse.json(
      { error: "Failed to delete production" },
      { status: 500 }
    );
  }
}
