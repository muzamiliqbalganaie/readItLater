import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Trash2, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import ContentInput from '@/components/ContentInput';
import { Document } from '@/types';

interface LibraryPageProps {
  onSelectDocument: (doc: Document) => void;
}

export default function Library({ onSelectDocument }: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: documents, isLoading, refetch } = trpc.documents.list.useQuery();
  const { data: tags } = trpc.tags.list.useQuery();
  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success('Document deleted');
      refetch();
    },
  });

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDoc.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Reading List</h1>
            <Button
              onClick={() => setShowInput(!showInput)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Content
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Content Input Modal */}
        {showInput && (
          <div className="mb-8">
            <ContentInput
              onSuccess={() => {
                setShowInput(false);
                refetch();
              }}
            />
          </div>
        )}

        {/* Tags Filter */}
        {tags && tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag.name)}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        )}

        {/* Documents Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No documents yet</p>
            <Button onClick={() => setShowInput(true)}>Add your first document</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onSelectDocument(doc)}
              >
                <div className="flex flex-col h-full">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                    {doc.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
                    {doc.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {doc.readingTime || 5} min
                    </div>
                    <Badge variant="outline">
                      {Math.round(doc.readingProgress || 0)}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      disabled={deleteDoc.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
