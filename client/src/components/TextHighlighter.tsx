import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Highlighter } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface TextHighlighterProps {
  documentId: number;
  onHighlight?: () => void;
}

type HighlightColor = 'yellow' | 'red' | 'green';

export default function TextHighlighter({ documentId, onHighlight }: TextHighlighterProps) {
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const contentRef = useRef<HTMLDivElement>(null);
  const createHighlight = trpc.highlights.create.useMutation({
    onSuccess: () => {
      toast.success('Text highlighted!');
      onHighlight?.();
    },
  });

  const handleTextSelection = () => {
    const selection = globalThis.window?.getSelection();
    if (!selection || selection.toString().length === 0) {
      toast.error('Please select some text to highlight');
      return;
    }

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(contentRef.current || document.body);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const startOffset = preCaretRange.toString().length - selectedText.length;
    const endOffset = startOffset + selectedText.length;

    createHighlight.mutate({
      documentId,
      text: selectedText,
      color: selectedColor,
      startOffset,
      endOffset,
    });

    // Clear selection
    selection.removeAllRanges();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Highlighter className="w-4 h-4 text-gray-600" />
      
      <ToggleGroup
        type="single"
        value={selectedColor}
        onValueChange={(v) => {
          if (v) setSelectedColor(v as HighlightColor);
        }}
        className="gap-1"
      >
        <ToggleGroupItem value="yellow" className="bg-yellow-200 hover:bg-yellow-300 data-[state=on]:bg-yellow-400" />
        <ToggleGroupItem value="red" className="bg-red-200 hover:bg-red-300 data-[state=on]:bg-red-400" />
        <ToggleGroupItem value="green" className="bg-green-200 hover:bg-green-300 data-[state=on]:bg-green-400" />
      </ToggleGroup>

      <Button
        size="sm"
        onClick={handleTextSelection}
        disabled={createHighlight.isPending}
        className="ml-auto"
      >
        {createHighlight.isPending ? 'Highlighting...' : 'Highlight'}
      </Button>
    </div>
  );
}
