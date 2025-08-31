'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UploadResult = {
  _id: string;
  title: string;
  videoUrl: string;
  imageUrl: string; 
  createdAt?: string;
};

export default function ImageUploader() {
  // <-- Add state for the new fields
  const [title, setTitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Login");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !title || !videoUrl) {
      setError('Please fill in all fields.');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    // <-- Append the new text fields to the FormData
    formData.append('title', title);
    formData.append('videoUrl', videoUrl);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      console.log('API Response:', data);
      setResult(data.data as UploadResult); // Save the returned data to state

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload New Project</h1>
        <p className="text-muted-foreground">Share your project with the world by uploading an image and video</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Project Title *
              </label>
              <input 
                type="text" 
                id="title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter your project title"
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="videoUrl" className="text-sm font-medium text-foreground">
                Video URL *
              </label>
              <input 
                type="url" 
                id="videoUrl"
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Project Image *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input 
                type="file" 
                id="image"
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label htmlFor="image" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <div className="text-sm text-muted-foreground">
                    {file ? file.name : 'Click to select an image'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 5MB
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </span>
            ) : (
              'Upload Project'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-6 p-6 bg-accent border border-border rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Upload Successful!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Project ID:</span>
                  <p className="text-sm text-foreground font-mono">{result._id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Title:</span>
                  <p className="text-sm text-foreground">{result.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Video URL:</span>
                  <a 
                    href={result.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {result.videoUrl}
                  </a>
                </div>
              </div>
              
              <div className="flex justify-center">
                <img 
                  src={result.imageUrl} 
                  alt="Uploaded preview" 
                  className="max-w-full h-48 object-cover rounded-lg border border-border"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}