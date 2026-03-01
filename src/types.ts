export type TodoStatus = 'pending' | 'in_progress' | 'done';

export interface TodoAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  attachmentCount?: number;
  attachments?: TodoAttachment[];
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
}

export type ApiErrorKind = 'auth' | 'session_timeout' | 'unexpected';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
