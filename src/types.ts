export type TodoStatus = 'pending' | 'in_progress' | 'done';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
}

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
}
