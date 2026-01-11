import { useCallback, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  Code,
  Sigma,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Rich Text Editor with WYSIWYG capabilities
 * Supports: Bold, Italic, Underline, Strikethrough, Lists, Alignment, Highlight, Links, Code, and LaTeX
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false,
}: RichTextEditorProps) {
  const [latexInput, setLatexInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [latexPopoverOpen, setLatexPopoverOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for flashcards
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertLatex = useCallback(() => {
    if (!editor || !latexInput.trim()) return;

    // Insert LaTeX with delimiters that will be rendered later
    const latexContent = `\\(${latexInput}\\)`;
    editor.chain().focus().insertContent(latexContent).run();
    setLatexInput('');
    setLatexPopoverOpen(false);
  }, [editor, latexInput]);

  const insertBlockLatex = useCallback(() => {
    if (!editor || !latexInput.trim()) return;

    // Insert block LaTeX with delimiters
    const latexContent = `\\[${latexInput}\\]`;
    editor.chain().focus().insertContent(latexContent).run();
    setLatexInput('');
    setLatexPopoverOpen(false);
  }, [editor, latexInput]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden bg-background',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b bg-muted/30">
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          tooltip="Bold"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          tooltip="Italic"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          tooltip="Underline"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          tooltip="Strikethrough"
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          tooltip="Bullet List"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          tooltip="Numbered List"
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          tooltip="Align Left"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          tooltip="Align Center"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          tooltip="Align Right"
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
          tooltip="Highlight"
          disabled={disabled}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
          tooltip="Inline Code"
          disabled={disabled}
        />

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              disabled={disabled}
              className="h-8 w-8 p-0 data-[state=on]:bg-accent"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL</label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink}>
                  Set Link
                </Button>
                {editor.isActive('link') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkPopoverOpen(false);
                    }}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-1" />

        {/* LaTeX */}
        <Popover open={latexPopoverOpen} onOpenChange={setLatexPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={false}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Sigma className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-3">
              <label className="text-sm font-medium">Insert LaTeX Formula</label>
              <Input
                placeholder="x^2 + y^2 = z^2"
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && insertLatex()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={insertLatex}>
                  Inline
                </Button>
                <Button size="sm" variant="outline" onClick={insertBlockLatex}>
                  Block
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use standard LaTeX syntax. Example: x^2, \frac{'{'} a {'}'}{'{'} b {'}'}, \sqrt{'{'} x {'}'}
              </p>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().undo().run()}
          isActive={false}
          icon={Undo}
          tooltip="Undo"
          disabled={disabled || !editor.can().undo()}
        />
        <ToolbarButton
          editor={editor}
          action={() => editor.chain().focus().redo().run()}
          isActive={false}
          icon={Redo}
          tooltip="Redo"
          disabled={disabled || !editor.can().redo()}
        />
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'min-h-[100px] px-3 py-2',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[80px]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'
        )}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  editor: Editor;
  action: () => void;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  disabled?: boolean;
}

function ToolbarButton({
  action,
  isActive,
  icon: Icon,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={() => action()}
      disabled={disabled}
      className="h-8 w-8 p-0 data-[state=on]:bg-accent"
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  );
}

export default RichTextEditor;

