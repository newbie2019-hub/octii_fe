export interface Import {
  id: number;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_cards: number | null;
  imported_cards: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ImportStartResponse {
  import_id: number;
  status: 'pending';
  message: string;
}

export interface ImportHistoryResponse {
  data: Import[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

