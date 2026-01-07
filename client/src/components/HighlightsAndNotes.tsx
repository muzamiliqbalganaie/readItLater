import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Highlight, Note } from '@/types';

interface HighlightsAndNotesProps {
  documentId: number;
  highlights: Highlight[];
  notes: Note[];
  onHighlightsChange?: () => void;
}

export default function HighlightsAndNotes({
  documentId,
  highlights,
  notes,
  onHighlightsChange,
}: HighlightsAndNotesProps) {
  const [activeTab, setActiveTab] = useState<'highlights' | 'notes'>('highlights');
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const deleteHighlight = trpc.highlights.delete.useMutation({
    onSuccess: () => {
      toast.success('Highlight deleted');
      onHighlightsChange?.();
    },
  });

  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      toast.success('Note deleted');
      onHighlightsChange?.();
    },
  });

  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => {
      toast.success('Note updated');
      setEditingNoteId(null);
      setNewNoteText('');
      onHighlightsChange?.();
    },
  });

  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      toast.success('Note added');
      setNewNoteText('');
      onHighlightsChange?.();
    },
  });

  const handleDeleteHighlight = (id: number) => {
    deleteHighlight.mutate({ id });
  };

  const handleDeleteNote = (id: number) => {
    deleteNote.mutate({ id });
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    if (editingNoteId) {
      updateNote.mutate({
        id: editingNoteId,
        content: newNoteText,
      });
    } else {
      createNote.mutate({
        documentId,
        content: newNoteText,
        offset: 0,
      });
    }
  };

  const getHighlightColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-900';
      case 'red':
        return 'bg-red-100 text-red-900';
      case 'green':
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 border-b mb-4">
        <Button
          variant={activeTab === 'highlights' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('highlights')}
          className="flex-1"
        >
          Highlights ({highlights.length})
        </Button>
        <Button
          variant={activeTab === 'notes' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notes')}
          className="flex-1"
        >
          Notes ({notes.length})
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {activeTab === 'highlights' ? (
          highlights.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No highlights yet</p>
          ) : (
            highlights.map((highlight) => (
              <Card key={highlight.id} className={`p-3 ${getHighlightColor(highlight.color)}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed flex-1">{highlight.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    disabled={deleteHighlight.isPending}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {highlight.color}
                </Badge>
              </Card>
            ))
          )
        ) : (
          <div className="space-y-3">
            {/* New Note Input */}
            {!editingNoteId && (
              <Card className="p-3">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="mb-2 text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={createNote.isPending}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </Card>
            )}

            {/* Notes List */}
            {notes.length === 0 && !editingNoteId ? (
              <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
            ) : (
              notes.map((note) => (
                <Card key={note.id} className="p-3">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNote}
                          disabled={updateNote.isPending}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNewNoteText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setNewNoteText(note.content);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteNote.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
