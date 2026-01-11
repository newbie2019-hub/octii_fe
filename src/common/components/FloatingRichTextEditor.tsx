import { useCallback, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
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

interface FloatingRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * Rich Text Editor with floating toolbar
 * The toolbar appears when text is selected
 */
export function FloatingRichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false,
  minHeight = '120px',
}: FloatingRichTextEditorProps) {
  const [latexInput, setLatexInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [latexPopoverOpen, setLatexPopoverOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
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
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const insertLatex = useCallback(() => {
    if (!editor || !latexInput.trim()) return;
    const latexContent = `\\(${latexInput}\\)`;
    editor.chain().focus().insertContent(latexContent).run();
    setLatexInput('');
    setLatexPopoverOpen(false);
  }, [editor, latexInput]);

  const insertBlockLatex = useCallback(() => {
    if (!editor || !latexInput.trim()) return;
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

  const insertImage = useCallback((url: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative border rounded-lg overflow-hidden bg-background transition-all',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Floating Bubble Menu - appears on text selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 150,
          placement: 'top',
          appendTo: () => document.body,
        }}
        className="flex items-center gap-0.5 p-1.5 rounded-lg border bg-popover shadow-lg"
      >
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-0.5" />

        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-0.5" />

        <FloatingToolbarButton
          action={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          disabled={disabled}
        />

        <div className="w-px h-5 bg-border mx-0.5" />

        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
          disabled={disabled}
        />
        <FloatingToolbarButton
          action={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
          disabled={disabled}
        />

        {/* Link Popover */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              disabled={disabled}
              className="h-7 w-7 p-0 data-[state=on]:bg-accent"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL</label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink} className="h-7 text-xs">
                  Set Link
                </Button>
                {editor.isActive('link') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkPopoverOpen(false);
                    }}
                  >
                    <Unlink className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* LaTeX Popover */}
        <Popover open={latexPopoverOpen} onOpenChange={setLatexPopoverOpen}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={false}
              disabled={disabled}
              className="h-7 w-7 p-0"
            >
              <Sigma className="h-3.5 w-3.5" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              <label className="text-sm font-medium">Insert LaTeX</label>
              <Input
                placeholder="x^2 + y^2 = z^2"
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                className="font-mono text-sm h-8"
                onKeyDown={(e) => e.key === 'Enter' && insertLatex()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={insertLatex} className="h-7 text-xs">
                  Inline
                </Button>
                <Button size="sm" variant="outline" onClick={insertBlockLatex} className="h-7 text-xs">
                  Block
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </BubbleMenu>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'px-4 py-3',
          '[&_.ProseMirror]:outline-none',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-md'
        )}
        style={{ minHeight }}
      />
    </div>
  );
}

interface FloatingToolbarButtonProps {
  action: () => void;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

function FloatingToolbarButton({
  action,
  isActive,
  icon: Icon,
  disabled,
}: FloatingToolbarButtonProps) {
  return (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={() => action()}
      disabled={disabled}
      className="h-7 w-7 p-0 data-[state=on]:bg-accent"
    >
      <Icon className="h-3.5 w-3.5" />
    </Toggle>
  );
}

export type { FloatingRichTextEditorProps };

