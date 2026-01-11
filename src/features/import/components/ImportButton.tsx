import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useImport } from '../hooks/useImport';
import { ImportProgressWidget } from './ImportProgressWidget';

interface ImportButtonProps {
  onImportStart?: () => void;
  onImportComplete?: () => void;
}

export function ImportButton({ onImportStart, onImportComplete }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, currentImport, startImport, resetImport } = useImport({ onComplete: onImportComplete });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await startImport(file);
    onImportStart?.();

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".apkg"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import Deck
          </>
        )}
      </Button>

      {/* Import Progress Widget */}
      <ImportProgressWidget
        importData={currentImport}
        onDismiss={resetImport}
      />
    </>
  );
}

