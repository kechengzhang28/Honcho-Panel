export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Workspace {
  id: string;
  created_at: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
}

export interface QueueStatus {
  total_work_units: number;
  completed_work_units: number;
  in_progress_work_units: number;
  pending_work_units: number;
}

export interface Peer {
  id: string;
  workspace_id: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Session {
  id: string;
  is_active: boolean;
  workspace_id: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  content: string;
  peer_id: string;
  session_id: string;
  workspace_id: string;
  created_at: string;
  metadata: Record<string, unknown>;
  token_count: number;
}

export interface Conclusion {
  id: string;
  content: string;
  observer_id: string;
  observed_id: string;
  session_id: string | null;
  created_at: string;
}

export interface SessionContext {
  id: string;
  messages: Message[];
  summary: {
    content: string;
    message_id: string;
    summary_type: string;
    created_at: string;
    token_count: number;
  } | null;
  peer_representation: string | null;
  peer_card: string[] | null;
}

export interface PeerCardResponse {
  peer_card: string[];
}

export interface PeerReprRequest {
  session_id?: string;
  include_most_frequent?: boolean;
  max_conclusions?: number;
}

export interface PeerReprResponse {
  representation: string;
}

export interface PeerChatRequest {
  query: string;
  session_id?: string;
  reasoning_level?: "minimal" | "low" | "medium" | "high" | "max";
  stream?: boolean;
  target?: string | null;
}

export interface PeerChatResponse {
  content: string;
}

export interface ConclusionQueryRequest {
  query: string;
  top_k?: number;
  distance?: number;
  filters?: {
    observed?: string;
  };
}

export interface ConclusionQueryResponse {
  items: Conclusion[];
}
