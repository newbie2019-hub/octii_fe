import { useEffect } from 'react';
import { useImportHistory } from '@/features/import/hooks/useImportHistory';
import { ImportButton } from '@/features/import';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import octiiSad from '@/assets/images/octii_sad.png';
import { formatDistanceToNow } from 'date-fns';

export default function ImportHistoryPage() {
  const { imports, isLoading } = useImportHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Import History</h1>
          <p className="text-muted-foreground mt-1">
            Track your Anki deck import history and status
          </p>
        </div>
        <ImportButton />
      </div>

      {/* Content */}
      {isLoading && imports.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : imports.length === 0 ? (
        <div className="text-center py-20">
          <img
            src={octiiSad}
            alt="No imports"
            className="mx-auto h-32 w-32 mb-6 opacity-80"
          />
          <h3 className="text-lg font-semibold mb-2">No imports yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by importing your first Anki deck
          </p>
          <ImportButton />
        </div>
      ) : (
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Deck Name</TableHead>
                <TableHead className="text-right">Cards</TableHead>
                <TableHead className="text-right">Media Files</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead className="w-[100px]">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((importItem) => (
                <TableRow key={importItem.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getStatusIcon(importItem.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {importItem.file_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {importItem.deck_name || (
                        <span className="text-muted-foreground italic">
                          Processing...
                        </span>
                      )}
                      {getStatusBadge(importItem.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {importItem.cards_count !== null ? (
                      <span className="font-mono">{importItem.cards_count}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {importItem.media_count !== null ? (
                      <span className="font-mono">{importItem.media_count}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(importItem.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {importItem.completed_at ? (
                      <span className="text-sm text-muted-foreground">
                        {Math.round(
                          (new Date(importItem.completed_at).getTime() -
                            new Date(importItem.created_at).getTime()) /
                            1000
                        )}
                        s
                      </span>
                    ) : importItem.status === 'processing' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stats Summary */}
      {imports.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-sm border p-4">
            <p className="text-sm text-muted-foreground">Total Imports</p>
            <p className="text-2xl font-bold">{imports.length}</p>
          </div>
          <div className="rounded-sm border p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-500">
              {imports.filter((i) => i.status === 'completed').length}
            </p>
          </div>
          <div className="rounded-sm border p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-destructive">
              {imports.filter((i) => i.status === 'failed').length}
            </p>
          </div>
          <div className="rounded-sm border p-4">
            <p className="text-sm text-muted-foreground">Total Cards</p>
            <p className="text-2xl font-bold">
              {imports.reduce((sum, i) => sum + (i.cards_count || 0), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

