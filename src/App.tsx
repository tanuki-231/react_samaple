import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import TodoDashboard from './components/TodoDashboard';
import ErrorScreen from './components/ErrorScreen';
import SessionTimeoutScreen from './components/SessionTimeoutScreen';
import { ApiError, TodoItem } from './types';
import api from './services/api';

interface AuthState {
  token: string;
  userId: string;
}

type AppScreen = 'default' | 'error' | 'session-timeout';

const AUTH_STORAGE_KEY = 'todo_auth';

const App = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [screen, setScreen] = useState<AppScreen>('default');
  const [globalErrorMessage, setGlobalErrorMessage] = useState('想定外のエラーが発生しました。');

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as AuthState;
      if (!parsed?.token || !parsed?.userId) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      setAuth(parsed);
      api
        .fetchTodos(parsed.token)
        .then((loaded) => setTodos(loaded))
        .catch((error) => handleFatalError(error));
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const showLogin = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setTodos([]);
    setScreen('default');
    setGlobalErrorMessage('想定外のエラーが発生しました。');
  };

  const handleFatalError = (error: unknown) => {
    if (error instanceof ApiError && error.kind === 'session_timeout') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(null);
      setTodos([]);
      setScreen('session-timeout');
      return;
    }

    const message = error instanceof Error ? error.message : '想定外のエラーが発生しました。';
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setTodos([]);
    setGlobalErrorMessage(message);
    setScreen('error');
  };

  const handleLogin = async (userId: string, password: string) => {
    try {
      const result = await api.login({ userId, password });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
      setAuth(result);
      const loadedTodos = await api.fetchTodos(result.token);
      setTodos(loadedTodos);
    } catch (error) {
      // ログイン失敗（ID/パスワード不正）はログイン画面でメッセージ表示する
      if (error instanceof ApiError && error.kind === 'auth') {
        throw error;
      }
      handleFatalError(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setTodos([]);
  };

  const handleAddTodo = async (todo: Omit<TodoItem, 'id'>) => {
    if (!auth) return;
    try {
      const created = await api.addTodo(auth.token, todo);
      setTodos((current) => [...current, created]);
    } catch (error) {
      handleFatalError(error);
    }
  };

  const handleUpdateTodo = async (todo: TodoItem) => {
    if (!auth) return;
    try {
      const updated = await api.updateTodo(auth.token, todo);
      setTodos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      handleFatalError(error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!auth) return;
    try {
      await api.deleteTodo(auth.token, id);
      setTodos((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      handleFatalError(error);
    }
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

      {screen === 'error' && <ErrorScreen message={globalErrorMessage} onBackToLogin={showLogin} />}
      {screen === 'session-timeout' && <SessionTimeoutScreen onBackToLogin={showLogin} />}
      {screen === 'default' &&
        (!auth ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <TodoDashboard
            todos={todos}
            onAddTodo={handleAddTodo}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        ))}
    </div>
  );
};

export default App;
