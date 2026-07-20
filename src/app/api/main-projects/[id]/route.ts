import { NextResponse } from 'next/server';
import type { Db, Collection, MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../../lib/mongo';

const database = process.env.MONGO_DATABASE;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection = db.collection("MainProject");

    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);

    // Delete the project
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Main project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Main project deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting main project:", error);
    return NextResponse.json(
      { error: "Failed to delete main project" },
      { status: 500 }
    );
  }
}
