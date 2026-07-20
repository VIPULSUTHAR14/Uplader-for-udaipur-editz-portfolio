'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: 'Social Media', label: 'Social Media', desc: 'Instagram Reels, YouTube Shorts, TikTok, Facebook' },
  { value: 'YouTube', label: 'YouTube', desc: 'Long-form videos, Podcasts, Vlogs, Gaming' },
  { value: 'Corporate & Commercial', label: 'Corporate & Commercial', desc: 'Brand films, Ads, Company profiles' },
  { value: 'Real Estate', label: 'Real Estate', desc: 'Property tours, Builder promotions, Drone videos' },
  { value: 'Travel & Lifestyle', label: 'Travel & Lifestyle', desc: 'Travel films, Hotels, Tourism, Lifestyle content' }
];

const SUB_CATEGORIES: Record<string, string[]> = {
  'Social Media': ['Instagram Reels', 'YouTube Shorts', 'TikTok', 'Facebook'],
  'YouTube': ['Long-form videos', 'Podcasts', 'Vlogs', 'Gaming'],
  'Corporate & Commercial': ['Brand films', 'Ads', 'Company profiles'],
  'Real Estate': ['Property tours', 'Builder promotions', 'Drone videos'],
  'Travel & Lifestyle': ['Travel films', 'Hotels', 'Tourism', 'Lifestyle content']
};

type UploadResult = {
  _id: string;
  title: string;
  videoUrl: string;
  imageUrl: string;
  category: string;
  subCategory: string;
  location: string;
  date: string;
};

export default function Home() {
  const [title, setTitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [subCategory, setSubCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<string>('');
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

  // Update sub-category list when category changes
  useEffect(() => {
    const list = SUB_CATEGORIES[category] || [];
    if (list.length > 0) {
      setSubCategory(list[0]);
    } else {
      setSubCategory('');
    }
  }, [category]);

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
    if (!file || !title || !videoUrl || !category || !subCategory || !location || !date) {
      setError('Please fill in all fields.');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('videoUrl', videoUrl);
    formData.append('category', category);
    formData.append('subCategory', subCategory);
    formData.append('location', location);
    formData.append('date', date);

    try {
      const response = await fetch('/api/main-projects', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data.data as UploadResult);
      // Reset form fields
      setTitle('');
      setVideoUrl('');
      setCategory(CATEGORIES[0].value);
      setLocation('');
      setDate('');
      setFile(null);

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Main Project</h1>
        <p className="text-muted-foreground">Add a project to the Main Projects section</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Project Name / Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="videoUrl" className="text-sm font-medium text-foreground">
                Video / Demo Link *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-foreground">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subCategory" className="text-sm font-medium text-foreground">
                Project Type *
              </label>
              <select
                id="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              >
                {(SUB_CATEGORIES[category] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location *
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Udaipur, India"
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-foreground">
                Project Date *
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Project Cover Image *
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
                    {file ? file.name : 'Click to select project cover image'}
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
                <span>Uploading to Main Projects...</span>
              </span>
            ) : (
              'Upload Main Project'
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
                  <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                  <p className="text-sm text-foreground font-semibold">{result.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Category & Type:</span>
                  <p className="text-sm text-foreground">{result.category} • {result.subCategory}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Location & Date:</span>
                  <p className="text-sm text-foreground">{result.location} • {result.date}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Video Link:</span>
                  <a
                    href={result.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all block"
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