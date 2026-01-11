import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { importService } from '../services/importService';
import { ImportFileSchema } from '../schemas/importSchema';
import type { Import } from '../types/import';

const ACTIVE_IMPORT_KEY = 'octii_active_import_id';

interface UseImportOptions {
  onComplete?: () => void;
}

export function useImport(options?: UseImportOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentImport, setCurrentImport] = useState<Import | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownCompletionToastRef = useRef(false);
  const onCompleteRef = useRef(options?.onComplete);

  // Keep the ref in sync with the latest callback
  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const clearStoredImport = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_IMPORT_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const storeActiveImport = useCallback((importId: number) => {
    try {
      localStorage.setItem(ACTIVE_IMPORT_KEY, importId.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const getStoredImportId = useCallback((): number | null => {
    try {
      const stored = localStorage.getItem(ACTIVE_IMPORT_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  }, []);

  const checkStatus = useCallback(async (importId: number, isResume = false) => {
    try {
      const status = await importService.getImportStatus(importId);
      setCurrentImport(status);

      // Stop polling and clear storage if import is complete or failed
      if (status.status === 'completed' || status.status === 'failed') {
        stopPolling();
        clearStoredImport();

        // Only show toast once (and not on resume for completed imports)
        if (!hasShownCompletionToastRef.current) {
          hasShownCompletionToastRef.current = true;

          if (status.status === 'completed') {
            // Don't show toast if resuming and already completed
            if (!isResume) {
              toast.success(`Import completed! ${status.imported_cards} cards imported.`);
            }
            onCompleteRef.current?.();
          } else if (status.status === 'failed') {
            if (!isResume) {
              toast.error(`Import failed: ${status.error_message}`);
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Failed to check import status:', error);
      // If we get an error (e.g., 404), clear the stored import
      if (isResume) {
        clearStoredImport();
      }
    }
  }, [stopPolling, clearStoredImport]);

  const startPolling = useCallback((importId: number, isResume = false) => {
    // Clear any existing polling
    stopPolling();

    // Reset toast flag for new import (but not for resume)
    if (!isResume) {
      hasShownCompletionToastRef.current = false;
    }

    // Initial fetch
    checkStatus(importId, isResume);

    // Poll every 2 seconds
    const interval = setInterval(() => {
      checkStatus(importId, false);
    }, 2000);

    pollingIntervalRef.current = interval;
  }, [checkStatus, stopPolling]);

  // Resume polling on mount if there's an active import, cleanup on unmount
  useEffect(() => {
    const storedImportId = getStoredImportId();
    if (storedImportId) {
      // Resume polling for the stored import
      startPolling(storedImportId, true);
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [getStoredImportId, startPolling, stopPolling]);

  const startImport = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file
      console.log('Validating file:', file.name, file.type, file.size);
      const validation = ImportFileSchema.safeParse({ file });
      if (!validation.success) {
        console.error('Validation error:', validation.error);
        const errorMessage = validation.error.errors?.[0]?.message || 'Invalid file';
        toast.error(errorMessage);
        return null;
      }

      // Upload file
      console.log('Uploading file to API...');
      const response = await importService.uploadDeck(file);
      console.log('Upload response:', response);
      toast.success('Import started successfully');

      // Store import ID for persistence
      storeActiveImport(response.import_id);

      // Start polling for status
      startPolling(response.import_id);

      return response;
    } catch (error: any) {
      console.error('Import error:', error);
      console.error('Error response:', error.response);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.file?.[0] ||
        'Failed to start import';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetImport = () => {
    stopPolling();
    clearStoredImport();
    setCurrentImport(null);
  };

  return {
    isUploading,
    currentImport,
    startImport,
    stopPolling,
    resetImport,
  };
}

