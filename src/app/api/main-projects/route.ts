import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Writable } from 'stream';
import type { NextRequest } from 'next/server';
import type { WithId, Db, Collection, InsertOneResult, MongoClient } from 'mongodb';
import clientPromise from '../../../../lib/mongo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const database = process.env.MONGO_DATABASE;

// Constants for Validation
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Type definition for MainProject document
interface MainProject {
  title: string;
  videoUrl: string;
  imageUrl: string;
  category: string;
  subCategory: string;
  location: string;
  date: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection<MainProject> = db.collection<MainProject>("MainProject");

    // Fetch all main projects, sorted by creation date (newest first)
    const mainProjects = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: mainProjects
    });

  } catch (error) {
    console.error("Error fetching main projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch main projects" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const videoUrl = formData.get('videoUrl') as string | null;
    const category = formData.get('category') as string | null;
    const subCategory = formData.get('subCategory') as string | null;
    const location = formData.get('location') as string | null;
    const date = formData.get('date') as string | null;

    // 1. Validation
    if (!file || !title || !videoUrl || !category || !subCategory || !location || !date) {
      return NextResponse.json(
        { error: "All fields are required (file, title, videoUrl, category, subCategory, location, date)." },
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

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 2. Stream-based Upload to Cloudinary
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

    // 3. Save to MainProject Collection
    const client: MongoClient = await clientPromise;
    const db: Db = client.db(database);
    const collection: Collection<MainProject> = db.collection<MainProject>("MainProject");

    const newProject: MainProject = {
      title,
      imageUrl,
      videoUrl,
      category,
      subCategory,
      location,
      date,
      createdAt: new Date(),
    };

    const result: InsertOneResult<MainProject> = await collection.insertOne(newProject);
    
    const savedData: WithId<MainProject> = {
      ...newProject,
      _id: result.insertedId,
    };
    
    return NextResponse.json({
      success: true,
      message: "Main project uploaded successfully!",
      data: savedData
    });

  } catch (error) {
    console.error("Error during main project upload:", error);
    return NextResponse.json({ error: "Operation failed." }, { status: 500 });
  }
}
