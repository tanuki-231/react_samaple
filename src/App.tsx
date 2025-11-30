import { useState } from 'react';
import LoginForm from './components/LoginForm';
import TodoDashboard from './components/TodoDashboard';
import { TodoItem } from './types';
import api from './services/api';

interface AuthState {
  token: string;
  userId: string;
}

const App = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const handleLogin = async (userId: string, password: string) => {
    try {
      const result = await api.login({ userId, password });
      setAuth(result);
      const loadedTodos = await api.fetchTodos(result.token);
      setTodos(loadedTodos);
    } catch (error) {
      // rethrow for the form to display an error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ログイン処理で不明なエラーが発生しました');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setTodos([]);
  };

  const handleAddTodo = async (todo: Omit<TodoItem, 'id'>) => {
    if (!auth) return;
    const created = await api.addTodo(auth.token, todo);
    setTodos((current) => [...current, created]);
  };

  const handleUpdateTodo = async (todo: TodoItem) => {
    if (!auth) return;
    const updated = await api.updateTodo(auth.token, todo);
    setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteTodo = async (id: string) => {
    if (!auth) return;
    await api.deleteTodo(auth.token, id);
    setTodos((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TODOリスト管理</h1>
        {auth && (
          <button className="secondary" onClick={handleLogout}>
            ログアウト
          </button>
        )}
      </header>

      {!auth ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <TodoDashboard
          todos={todos}
          onAddTodo={handleAddTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      )}
    </div>
  );
};

export default App;
