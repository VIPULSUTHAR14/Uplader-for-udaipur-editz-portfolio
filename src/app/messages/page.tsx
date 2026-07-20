'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login');
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/messages');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => {
        setCopiedEmail(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
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
            onClick={fetchMessages}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Inquiries & Messages</h1>
        <p className="text-muted-foreground">
          View and manage client messages received from the portfolio website
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Inquiries from your portfolio contact form will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((message) => (
            <div key={message._id} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    👤 {message.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>📧 {message.email}</span>
                    <button
                      onClick={() => copyToClipboard(message.email)}
                      className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded hover:bg-secondary/80 transition-colors cursor-pointer flex items-center gap-1 font-medium border border-border"
                    >
                      {copiedEmail === message.email ? '✓ Copied' : '📋 Copy Email'}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  📅 {formatDate(message.createdAt)}
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
