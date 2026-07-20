'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MainProject {
  _id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  category: string;
  subCategory: string;
  location: string;
  date: string;
  createdAt: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Social Media': '📱',
  'YouTube': '▶️',
  'Corporate & Commercial': '🏢',
  'Real Estate': '🏠',
  'Travel & Lifestyle': '✈️'
};

export default function MainProjectsPage() {
  const [projects, setProjects] = useState<MainProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Login");
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/main-projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch main projects');
      }

      setProjects(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this main project? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/main-projects/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete project');
      }

      // Remove from local state
      setProjects(prev => prev.filter(proj => proj._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading main projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-destructive text-lg mb-4">Error: {error}</div>
          <button 
            onClick={fetchProjects}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Main Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} total in Main Projects collection
          </p>
        </div>
        <Link
          href="/upload-main"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2 text-sm font-medium"
        >
          <span>📤</span>
          <span>Upload Main Project</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No main projects yet</h3>
          <p className="text-muted-foreground mb-6">Upload some projects to display them in this section</p>
          <Link
            href="/upload-main"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
          >
            <span>📤</span>
            <span>Upload Main Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-muted relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 backdrop-blur-xs">
                    <span>{CATEGORY_EMOJIS[project.category] || '📁'}</span>
                    <span>{project.category}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <a
                      href={project.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium"
                    >
                      ▶️ Watch Video
                    </a>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded font-semibold border border-primary/20">
                      {project.subCategory}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2 text-base md:text-lg">
                    {project.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span>📍</span>
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>Project Date: {formatDate(project.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground/75 mt-2">
                      <span>🆔</span>
                      <span>{project._id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex space-x-2 border-t border-border pt-4">
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors text-center"
                  >
                    Watch Video
                  </a>
                  <button
                    onClick={() => deleteProject(project._id)}
                    disabled={deletingId === project._id}
                    className="bg-destructive text-destructive-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === project._id ? (
                      <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      '🗑️'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
