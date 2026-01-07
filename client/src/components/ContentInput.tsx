import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ContentInputProps {
  onSuccess?: () => void;
}

export default function ContentInput({ onSuccess }: ContentInputProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('url');

  const createDocument = trpc.documents.create.useMutation({
    onSuccess: () => {
      toast.success('Content saved successfully!');
      setUrl('');
      setText('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save content');
    },
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse URL');
      }

      const { title, content, readingTime } = await response.json();

      await createDocument.mutateAsync({
        title,
        content,
        contentType: 'url',
        originalUrl: url,
        readingTime,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to process text');
      }

      const { title, content, readingTime } = await response.json();

      await createDocument.mutateAsync({
        title,
        content,
        contentType: 'text',
        readingTime,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process text');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF');
      }

      const { title, content, readingTime } = await response.json();

      await createDocument.mutateAsync({
        title: title || file.name.replace('.pdf', ''),
        content,
        contentType: 'pdf',
        readingTime,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse PDF');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Article URL</label>
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Parse Article'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paste Text</label>
              <Textarea
                placeholder="Paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                rows={8}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save Text'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload PDF</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={isLoading}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {isLoading ? 'Processing PDF...' : 'Click to upload PDF or drag and drop'}
                </span>
                <span className="text-xs text-muted-foreground">PDF files only</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
