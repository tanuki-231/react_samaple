import { TodoItem } from '../types';

interface Props {
  todos: TodoItem[];
  disabled?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusLabel: Record<TodoItem['status'], string> = {
  pending: '未着手',
  in_progress: '進行中',
  done: '完了'
};

const TodoList = ({ todos, disabled = false, onEdit, onDelete }: Props) => (
  <table className="table">
    <thead>
      <tr>
        <th>タイトル</th>
        <th>詳細</th>
        <th>ステータス</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      {todos.length === 0 ? (
        <tr>
          <td colSpan={4} style={{ textAlign: 'center' }}>
            TODOがありません
          </td>
        </tr>
      ) : (
        todos.map((todo) => (
          <tr key={todo.id}>
            <td>{todo.title}</td>
            <td>{todo.description ?? '-'}</td>
            <td>{statusLabel[todo.status]}</td>
            <td className="actions">
              <button disabled={disabled} onClick={() => onEdit(todo.id)}>
                編集
              </button>
              <button className="danger" disabled={disabled} onClick={() => onDelete(todo.id)}>
                削除
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default TodoList;
