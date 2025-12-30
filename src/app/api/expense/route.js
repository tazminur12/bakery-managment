import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Generate Product ID: PROD-2025-0001
async function generateProductId(db) {
  const currentYear = new Date().getFullYear();
  const prefix = `PROD-${currentYear}-`;
  
  const lastProduct = await db.collection("inventory")
    .find({ productId: { $regex: `^${prefix}` } })
    .sort({ productId: -1 })
    .limit(1)
    .toArray();

  let nextSequence = 1;
  if (lastProduct.length > 0) {
    const lastId = lastProduct[0].productId;
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");
    
    const { searchParams } = new URL(request.url);
    const inventoryOnly = searchParams.get("inventory") === "true";
    
    if (inventoryOnly) {
      // Return inventory data
      const inventory = await db.collection("inventory")
        .find({})
        .sort({ itemName: 1 })
        .toArray();
      
      return NextResponse.json({ inventory });
    }
    
    // Fetch expenses (including purchases and usages)
    const expenses = await db.collection("expenses")
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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
      type, // "purchase" or "usage"
      itemName, 
      quantity, 
      unit, 
      amount, 
      category, 
      date, 
      paymentMethod, 
      notes,
      // Legacy fields for backward compatibility
      title
    } = body;

    // For inventory-based entries (purchase/usage)
    if (type === "purchase" || type === "usage") {
      if (!itemName || !quantity || !unit) {
        return NextResponse.json(
          { error: "Item name, quantity, and unit are required for inventory entries" },
          { status: 400 }
        );
      }

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

      const quantityNum = parseFloat(quantity);
      const amountNum = amount ? parseFloat(amount) : 0;

      // Update inventory
      let productId = null;
      const inventoryItem = await db.collection("inventory").findOne({
        itemName: itemName,
        unit: unit
      });

      if (type === "purchase") {
        // Add to inventory
        if (inventoryItem) {
          // Reuse existing productId
          productId = inventoryItem.productId;
          await db.collection("inventory").updateOne(
            { _id: inventoryItem._id },
            { 
              $inc: { 
                currentStock: quantityNum,
                totalPurchased: quantityNum
              },
              $set: { lastUpdated: new Date() }
            }
          );
        } else {
          // Generate new productId for new item
          productId = await generateProductId(db);
          await db.collection("inventory").insertOne({
            productId,
            itemName,
            unit,
            currentStock: quantityNum,
            totalPurchased: quantityNum,
            totalUsed: 0,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      } else if (type === "usage") {
        // Subtract from inventory
        if (inventoryItem) {
          // Use existing productId
          productId = inventoryItem.productId;
          const newStock = inventoryItem.currentStock - quantityNum;
          if (newStock < 0) {
            // Still allow negative stock but warn
            await db.collection("inventory").updateOne(
              { _id: inventoryItem._id },
              { 
                $inc: { 
                  currentStock: -quantityNum,
                  totalUsed: quantityNum
                },
                $set: { lastUpdated: new Date() }
              }
            );
          } else {
            await db.collection("inventory").updateOne(
              { _id: inventoryItem._id },
              { 
                $inc: { 
                  currentStock: -quantityNum,
                  totalUsed: quantityNum
                },
                $set: { lastUpdated: new Date() }
              }
            );
          }
        } else {
          // Create inventory item with negative stock
          productId = await generateProductId(db);
          await db.collection("inventory").insertOne({
            productId,
            itemName,
            unit,
            currentStock: -quantityNum,
            totalPurchased: 0,
            totalUsed: quantityNum,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
      }

      const newEntry = {
        type,
        productId: productId || inventoryItem?.productId,
        itemName,
        quantity: quantityNum,
        unit,
        amount: amountNum,
        category: category || "Raw Material",
        paymentMethod: paymentMethod || "Cash",
        date: date ? new Date(date) : new Date(),
        notes: notes || "",
        createdAt: new Date(),
        createdBy: {
          id: session.user.id,
          name: session.user.name
        }
      };

      // Insert the entry
      const result = await db.collection("expenses").insertOne(newEntry);

      return NextResponse.json({ 
        message: type === "purchase" ? "Purchase recorded successfully" : "Usage recorded successfully",
        id: result.insertedId 
      }, { status: 201 });
    }

    // Legacy expense entry (without inventory tracking)
    if (!title || !amount || !category) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    const newExpense = {
      type: "expense",
      title,
      amount: parseFloat(amount),
      category,
      paymentMethod: paymentMethod || "Cash",
      date: date ? new Date(date) : new Date(),
      notes: notes || "",
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name
      }
    };

    const result = await db.collection("expenses").insertOne(newExpense);

    return NextResponse.json({ 
      message: "Expense added successfully",
      id: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
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

    // Get the expense entry first to reverse inventory changes
    const expense = await db.collection("expenses").findOne({
      _id: new ObjectId(id),
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Reverse inventory changes if it's a purchase or usage entry
    if (expense.type === "purchase" || expense.type === "usage") {
      const inventoryItem = await db.collection("inventory").findOne({
        itemName: expense.itemName,
        unit: expense.unit
      });

      if (inventoryItem) {
        if (expense.type === "purchase") {
          // Reverse purchase: subtract from stock and totalPurchased
          await db.collection("inventory").updateOne(
            { _id: inventoryItem._id },
            { 
              $inc: { 
                currentStock: -expense.quantity,
                totalPurchased: -expense.quantity
              },
              $set: { lastUpdated: new Date() }
            }
          );
        } else if (expense.type === "usage") {
          // Reverse usage: add back to stock and subtract from totalUsed
          await db.collection("inventory").updateOne(
            { _id: inventoryItem._id },
            { 
              $inc: { 
                currentStock: expense.quantity,
                totalUsed: -expense.quantity
              },
              $set: { lastUpdated: new Date() }
            }
          );
        }
      }
    }

    // Delete the expense entry
    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, notes } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "bakery-management");

    // Update inventory item notes
    const result = await db.collection("inventory").updateOne(
      { productId: productId },
      { 
        $set: { 
          notes: notes || "",
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Notes updated successfully" });
  } catch (error) {
    console.error("Update notes error:", error);
    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 }
    );
  }
}
