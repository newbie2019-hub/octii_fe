import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useImportHistory } from '../hooks/useImportHistory';
import { ImportStatusCard } from './ImportStatusCard';
import { Loader2, RefreshCw } from 'lucide-react';

export function ImportHistory() {
  const { imports, isLoading, currentPage, totalPages, total, setCurrentPage, refresh } =
    useImportHistory();

  if (isLoading && imports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Import History</CardTitle>
            <CardDescription>
              {total > 0 ? `${total} import${total !== 1 ? 's' : ''} total` : 'No imports yet'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {imports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No import history available. Import your first deck to get started!
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {imports.map((importData) => (
                <ImportStatusCard key={importData.id} importData={importData} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

