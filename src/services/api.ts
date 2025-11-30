import { LoginRequest, LoginResponse, TodoItem } from '../types';

interface ApiClient {
  login(payload: LoginRequest): Promise<LoginResponse>;
  fetchTodos(token: string): Promise<TodoItem[]>;
  addTodo(token: string, todo: Omit<TodoItem, 'id'>): Promise<TodoItem>;
  updateTodo(token: string, todo: TodoItem): Promise<TodoItem>;
  deleteTodo(token: string, id: string): Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Fallback mock client useful for local development without a backend
class MockApiClient implements ApiClient {
  private todos: TodoItem[] = [
    { id: '1', title: '環境セットアップ', description: '開発環境を準備する', status: 'pending' },
    { id: '2', title: '要件確認', description: 'TODO管理機能の確認', status: 'in_progress' }
  ];

  async login(payload: LoginRequest): Promise<LoginResponse> {
    if (payload.userId === 'demo' && payload.password === 'password') {
      return { token: 'mock-token', userId: payload.userId };
    }
    throw new Error('ユーザIDまたはパスワードが正しくありません');
  }

  async fetchTodos(): Promise<TodoItem[]> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...this.todos];
  }

  async addTodo(_token: string, todo: Omit<TodoItem, 'id'>): Promise<TodoItem> {
    const newTodo: TodoItem = { ...todo, id: crypto.randomUUID() };
    this.todos.push(newTodo);
    return newTodo;
  }

  async updateTodo(_token: string, todo: TodoItem): Promise<TodoItem> {
    this.todos = this.todos.map((item) => (item.id === todo.id ? todo : item));
    return todo;
  }

  async deleteTodo(_token: string, id: string): Promise<void> {
    this.todos = this.todos.filter((item) => item.id !== id);
  }
}

class HttpApiClient implements ApiClient {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async fetchTodos(token: string): Promise<TodoItem[]> {
    return request<TodoItem[]>('/todos', {
      headers: { Authorization: `Bearer ${token}` },
      method: 'GET'
    });
  }

  async addTodo(token: string, todo: Omit<TodoItem, 'id'>): Promise<TodoItem> {
    return request<TodoItem>('/todos', {
      headers: { Authorization: `Bearer ${token}` },
      method: 'POST',
      body: JSON.stringify(todo)
    });
  }

  async updateTodo(token: string, todo: TodoItem): Promise<TodoItem> {
    return request<TodoItem>(`/todos/${todo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: 'PUT',
      body: JSON.stringify(todo)
    });
  }

  async deleteTodo(token: string, id: string): Promise<void> {
    await request<void>(`/todos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: 'DELETE'
    });
  }
}

const client: ApiClient = useMockApi ? new MockApiClient() : new HttpApiClient();

export default client;
