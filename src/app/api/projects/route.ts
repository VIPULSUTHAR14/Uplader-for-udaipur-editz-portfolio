import { NextResponse } from 'next/server';
import type { Db, Collection, MongoClient } from 'mongodb';
import clientPromise from '../../../../lib/mongo';

const database = process.env.MONGO_DATABASE;

// Type definition for Project document
interface Project {
  _id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection<Project> = db.collection<Project>("PROJECTS");

    // Fetch all projects, sorted by creation date (newest first)
    const projects = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" }, 
      { status: 500 }
    );
  }
}
