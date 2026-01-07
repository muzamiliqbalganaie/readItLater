import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getLoginUrl } from '@/const';
import Library from './Library';
import EnhancedReadingInterface from '@/components/EnhancedReadingInterface';
import { Document } from '@/types';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Read It Later</h1>
          <p className="text-gray-600 mb-8">
            A distraction-free reading experience for long-form content. Save articles, PDFs, and text for focused reading.
          </p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full"
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <EnhancedReadingInterface
        document={selectedDocument}
        onBack={() => setSelectedDocument(null)}
      />
    );
  }

  return <Library onSelectDocument={setSelectedDocument} />;
}
