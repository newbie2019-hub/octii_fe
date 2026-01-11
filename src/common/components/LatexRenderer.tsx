import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { cn } from '@/lib/utils';

interface LatexRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders HTML content with LaTeX formulas
 * Supports both inline (\( ... \) or $ ... $) and block (\[ ... \] or $$ ... $$) LaTeX
 */
export function LatexRenderer({ content, className }: LatexRendererProps) {
  const renderedContent = useMemo(() => {
    return renderLatex(content);
  }, [content]);

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        '[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto',
        '[&_.katex]:text-base',
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

/**
 * Renders LaTeX in a string, replacing LaTeX delimiters with rendered HTML
 */
function renderLatex(content: string): string {
  if (!content) return '';

  let result = content;

  // First, handle block LaTeX: \[ ... \] or $$ ... $$
  // Block LaTeX should be on its own line
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error: ${escapeHtml(latex)}]</span>`;
    }
  });

  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error: ${escapeHtml(latex)}]</span>`;
    }
  });

  // Then, handle inline LaTeX: \( ... \) or $ ... $
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error: ${escapeHtml(latex)}]</span>`;
    }
  });

  // Handle single $ for inline math (but not $$ which is already handled)
  // This regex is more careful to avoid matching $$ or standalone $
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `<span class="text-destructive">[LaTeX Error: ${escapeHtml(latex)}]</span>`;
    }
  });

  return result;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default LatexRenderer;

