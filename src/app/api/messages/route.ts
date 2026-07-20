import { NextResponse } from 'next/server';
import type { Db, Collection, MongoClient } from 'mongodb';
import clientPromise from '../../../../lib/mongo';

const database = process.env.MONGO_DATABASE;

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection<Message> = db.collection<Message>("Message");

    // Fetch all messages, sorted by creation date (newest first)
    const messages = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection = db.collection("Message");

    const result = await collection.insertOne({
      name,
      email,
      message,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        name,
        email,
        message,
        createdAt: new Date()
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

