import { useMemo, useState } from 'react';
import { TodoItem } from '../types';
import TodoDialog from './TodoDialog';
import ConfirmDialog from './ConfirmDialog';
import TodoList from './TodoList';

interface Props {
  todos: TodoItem[];
  onAddTodo: (todo: Omit<TodoItem, 'id'>) => Promise<void>;
  onUpdateTodo: (todo: TodoItem) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
}

const TodoDashboard = ({ todos, onAddTodo, onUpdateTodo, onDeleteTodo }: Props) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editingTodo = useMemo(() => todos.find((todo) => todo.id === openEditId), [openEditId, todos]);

  const handleAdd = async (todo: Omit<TodoItem, 'id'>) => {
    try {
      setLoading(true);
      await onAddTodo(todo);
      setOpenAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'TODOの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (todo: TodoItem) => {
    try {
      setLoading(true);
      await onUpdateTodo(todo);
      setOpenEditId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'TODOの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await onDeleteTodo(id);
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'TODOの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>TODO一覧</h2>
        <button onClick={() => setOpenAdd(true)}>追加</button>
      </div>
      {error && <div className="error">{error}</div>}
      <TodoList
        todos={todos}
        disabled={loading}
        onEdit={(id) => setOpenEditId(id)}
        onDelete={(id) => setConfirmDeleteId(id)}
      />

      <TodoDialog
        title="TODOを追加"
        open={openAdd}
        onSubmit={(todo) => handleAdd(todo as Omit<TodoItem, 'id'>)}
        onClose={() => setOpenAdd(false)}
      />

      <TodoDialog
        title="TODOを編集"
        open={Boolean(editingTodo)}
        initialValue={editingTodo ?? undefined}
        onSubmit={(todo) => handleEdit(todo as TodoItem)}
        onClose={() => setOpenEditId(null)}
      />

      <ConfirmDialog
        message="このTODOを削除しますか？"
        open={Boolean(confirmDeleteId)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default TodoDashboard;
