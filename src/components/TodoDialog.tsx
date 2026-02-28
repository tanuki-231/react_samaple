import { FormEvent, useEffect, useState } from 'react';
import { TodoItem, TodoStatus } from '../types';

interface Props {
  title: string;
  open: boolean;
  initialValue?: TodoItem;
  onSubmit: (todo: Omit<TodoItem, 'id'> | TodoItem) => void;
  onClose: () => void;
}

const statusOptions: { value: TodoStatus; label: string }[] = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' }
];

const TodoDialog = ({ title, open, onSubmit, initialValue, onClose }: Props) => {
  const [localTitle, setLocalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('pending');

  useEffect(() => {
    if (initialValue) {
      setLocalTitle(initialValue.title);
      setDescription(initialValue.description ?? '');
      setStatus(initialValue.status);
    } else {
      setLocalTitle('');
      setDescription('');
      setStatus('pending');
    }
  }, [initialValue, open]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      title: localTitle,
      description: description || undefined,
      status
    };
    onSubmit(initialValue ? { ...payload, id: initialValue.id } : payload);
  };

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <header className="dialog-header">
          <h3>{title}</h3>
        </header>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-label">
            タイトル
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              required
            />
          </label>
          <label className="form-label">
            詳細
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="TODOの詳細を入力"
            />
          </label>
          <label className="form-label">
            ステータス
            <select value={status} onChange={(e) => setStatus(e.target.value as TodoStatus)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoDialog;
