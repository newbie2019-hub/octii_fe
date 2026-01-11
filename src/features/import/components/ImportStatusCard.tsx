import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import type { Import } from '../types/import';
import { formatDistanceToNow } from 'date-fns';

interface ImportStatusCardProps {
  importData: Import;
}

export function ImportStatusCard({ importData }: ImportStatusCardProps) {
  const getStatusIcon = () => {
    switch (importData.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (importData.status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return importData.status;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-sm">{importData.file_name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(importData.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {(importData.status === 'processing' || importData.status === 'pending') && (
            <div className="space-y-2">
              <Progress value={importData.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {importData.imported_cards ?? 0} / {importData.total_cards ?? '?'} cards
                </span>
                <span>{importData.progress}%</span>
              </div>
            </div>
          )}

          {/* Completed Stats */}
          {importData.status === 'completed' && (
            <div className="text-sm text-muted-foreground">
              Successfully imported {importData.imported_cards} cards
            </div>
          )}

          {/* Error Message */}
          {importData.status === 'failed' && importData.error_message && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {importData.error_message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

