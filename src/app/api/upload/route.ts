import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Writable } from 'stream';
import type { NextRequest } from 'next/server';
import type { WithId, Db, Collection, InsertOneResult, MongoClient } from 'mongodb';
import clientPromise from '../../../../lib/mongo';

// --- Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const database = process.env.MONGO_DATABASE;

// --- Constants for Validation ---
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// --- Type Definition for Database Document ---
interface Project {
  title: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const videoUrl = formData.get('videoUrl') as string | null;

  // --- 1. Input and File Validation ---
  if (!file || !title || !videoUrl) {
    return NextResponse.json(
      { error: "File, title, and video URL are required." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File size must be less than ${MAX_FILE_SIZE_MB}MB.` },
      { status: 400 }
    );
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // --- 2. Stream-based Upload to Cloudinary ---
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        }
      );
      
      const writableStream = new Writable({
        write(chunk, encoding, callback) {
          uploadStream.write(chunk, encoding, callback);
        },
        final(callback) {
          uploadStream.end(callback);
        },
      });
      writableStream.end(fileBuffer);
    });

    const imageUrl = uploadResult.secure_url;

    // --- 3. Database Insertion with Strong Typing ---
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection<Project> = db.collection<Project>("PROJECTS");

    const newProject: Project = {
      title,
      imageUrl,
      videoUrl,
      createdAt: new Date(),
    };

    const result: InsertOneResult<Project> = await collection.insertOne(newProject);
    
    const savedData: WithId<Project> = {
      ...newProject,
      _id: result.insertedId,
    };
    
    return NextResponse.json({
      message: "Upload successful!",
      data: savedData
    });

  } catch (error) {
    console.error("Error during operation:", error);
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}