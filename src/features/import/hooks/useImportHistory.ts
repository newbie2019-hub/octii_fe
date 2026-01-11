import { useState, useEffect } from 'react';
import { importService } from '../services/importService';
import type { Import } from '../types/import';

export function useImportHistory(perPage = 15) {
  const [imports, setImports] = useState<Import[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    console.log('[useImportHistory] useEffect triggered', { currentPage, perPage, refreshTrigger });

    let cancelled = false;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await importService.getImportHistory(currentPage, perPage);

        if (!cancelled) {
          setImports(response.data);
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch import history:', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [currentPage, perPage, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    imports,
    isLoading,
    currentPage,
    totalPages,
    total,
    setCurrentPage,
    refresh,
  };
}

