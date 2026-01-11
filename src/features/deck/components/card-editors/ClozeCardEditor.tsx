import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BracesIcon,
  Eye,
  Pencil,
  Plus,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ClozeCardEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface ClozeInstance {
  id: number;
  text: string;
  preview: string;
}

/**
 * ClozeCardEditor - Create cloze deletion cards
 *
 * Syntax: {{c1::text}} or {{c2::text}} etc.
 * Example: "The capital of {{c1::France}} is {{c2::Paris}}."
 *
 * This generates multiple card instances:
 * - Instance 1: "The capital of [...] is Paris."
 * - Instance 2: "The capital of France is [...]."
 */
export function ClozeCardEditor({
  value,
  onChange,
  disabled = false,
}: ClozeCardEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Parse cloze deletions from the value
  const clozeInstances = useMemo(() => {
    const regex = /\{\{c(\d+)::([^}]+)\}\}/g;
    const instances: Map<number, { text: string; matches: string[] }> = new Map();

    let match;
    while ((match = regex.exec(value)) !== null) {
      const clozeId = parseInt(match[1], 10);
      const clozeText = match[2];

      if (instances.has(clozeId)) {
        instances.get(clozeId)!.matches.push(clozeText);
      } else {
        instances.set(clozeId, { text: clozeText, matches: [clozeText] });
      }
    }

    // Generate previews
    const result: ClozeInstance[] = [];
    instances.forEach((data, id) => {
      // Create preview by hiding this cloze
      let preview = value;
      const hideRegex = new RegExp(`\\{\\{c${id}::([^}]+)\\}\\}`, 'g');
      preview = preview.replace(hideRegex, '[...]');

      // Show other clozes normally
      preview = preview.replace(/\{\{c\d+::([^}]+)\}\}/g, '$1');

      result.push({
        id,
        text: data.matches.join(', '),
        preview,
      });
    });

    return result.sort((a, b) => a.id - b.id);
  }, [value]);

  // Get the next cloze ID
  const nextClozeId = useMemo(() => {
    if (clozeInstances.length === 0) return 1;
    return Math.max(...clozeInstances.map((c) => c.id)) + 1;
  }, [clozeInstances]);

  // Track selection
  const handleSelect = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  }, []);

  // Wrap selected text in cloze
  const wrapSelection = useCallback((clozeId?: number) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText.trim()) {
      // If no selection, insert placeholder
      const id = clozeId ?? nextClozeId;
      const clozeText = `{{c${id}::answer}}`;
      const newValue = value.substring(0, start) + clozeText + value.substring(end);
      onChange(newValue);

      // Position cursor inside the cloze
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + `{{c${id}::`.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos + 6); // Select "answer"
      }, 0);
      return;
    }

    const id = clozeId ?? nextClozeId;
    const clozeText = `{{c${id}::${selectedText}}}`;
    const newValue = value.substring(0, start) + clozeText + value.substring(end);
    onChange(newValue);

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + clozeText.length, start + clozeText.length);
    }, 0);
  }, [value, onChange, nextClozeId]);

  // Add to existing cloze group
  const addToGroup = useCallback((clozeId: number) => {
    wrapSelection(clozeId);
  }, [wrapSelection]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const hasSelection = selectionEnd > selectionStart;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Cloze Deletion Content</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select text and click the button to create blanks
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <HelpCircle className="h-3.5 w-3.5" />
              How it works
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm" align="end">
            <div className="space-y-3">
              <p className="font-medium">Cloze Deletion Cards</p>
              <p className="text-muted-foreground">
                Hide parts of your text to test your recall. Each numbered cloze creates a separate card.
              </p>
              <div className="p-3 bg-muted rounded-lg font-mono text-xs">
                <p>The capital of {'{{c1::France}}'} is {'{{c2::Paris}}'}.</p>
              </div>
              <p className="text-muted-foreground">This creates 2 cards:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Card 1: "The capital of [...] is Paris."</li>
                <li>• Card 2: "The capital of France is [...]."</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Area */}
      <div className="relative">
        <div
          className={cn(
            'relative border rounded-lg overflow-hidden bg-background transition-all',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelect}
            onMouseUp={handleSelect}
            onKeyUp={handleSelect}
            disabled={disabled}
            placeholder="Type your content here and select text to create cloze deletions...

Example: The {{c1::mitochondria}} is the powerhouse of the {{c2::cell}}."
            className={cn(
              'w-full resize-none bg-transparent px-4 py-3 text-sm',
              'placeholder:text-muted-foreground focus:outline-none',
              'min-h-[120px]'
            )}
          />

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 border-t bg-muted/30">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => wrapSelection()}
              disabled={disabled}
              className="h-8 gap-1.5"
            >
              <BracesIcon className="h-3.5 w-3.5" />
              {hasSelection ? `Add Cloze c${nextClozeId}` : 'Insert Cloze'}
            </Button>

            {clozeInstances.length > 0 && hasSelection && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                  >
                    Add to Group
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  {clozeInstances.map((instance) => (
                    <button
                      key={instance.id}
                      onClick={() => addToGroup(instance.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
                    >
                      <Badge variant="secondary" className="text-xs">
                        c{instance.id}
                      </Badge>
                      <span className="truncate text-muted-foreground">
                        {instance.text}
                      </span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}

            <div className="flex-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              disabled={clozeInstances.length === 0}
              className="h-8 gap-1.5"
            >
              {showPreview ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Cloze Preview */}
      {showPreview && clozeInstances.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Card Instances</Label>
          <div className="grid gap-3">
            {clozeInstances.map((instance) => (
              <div
                key={instance.id}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-xs">
                    Card {instance.id}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Hidden: {instance.text}
                  </span>
                </div>
                <p className="text-sm">{instance.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cloze Summary */}
      {clozeInstances.length > 0 && !showPreview && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Clozes:</span>
          {clozeInstances.map((instance) => (
            <Badge key={instance.id} variant="secondary" className="text-xs gap-1">
              c{instance.id}: {instance.text.substring(0, 20)}{instance.text.length > 20 ? '...' : ''}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClozeCardEditor;

