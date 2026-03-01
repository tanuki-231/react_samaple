import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TodoAttachment, TodoItem, TodoStatus } from '../types';

interface Props {
  title: string;
  open: boolean;
  initialValue?: TodoItem;
  onSubmit: (todo: Omit<TodoItem, 'id'> | TodoItem) => void;
  onClose: () => void;
}

const statusOptions: { value: TodoStatus; label: string }[] = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '対応中' },
  { value: 'done', label: '完了' }
];

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 1024 * 1024;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`${file.name} を読み込めませんでした`));
    reader.readAsDataURL(file);
  });

const TodoDialog = ({ title, open, onSubmit, initialValue, onClose }: Props) => {
  const [localTitle, setLocalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [attachments, setAttachments] = useState<TodoAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue) {
      setLocalTitle(initialValue.title);
      setDescription(initialValue.description ?? '');
      setStatus(initialValue.status);
      setAttachments(initialValue.attachments ?? []);
    } else {
      setLocalTitle('');
      setDescription('');
      setStatus('pending');
      setAttachments([]);
    }
    setAttachmentError(null);
  }, [initialValue, open]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    if (attachments.length + selectedFiles.length > MAX_ATTACHMENTS) {
      setAttachmentError(`添付できるファイルは最大${MAX_ATTACHMENTS}件です`);
      e.target.value = '';
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      setAttachmentError(`${oversizedFile.name} は1MBを超えています`);
      e.target.value = '';
      return;
    }

    try {
      const nextAttachments = await Promise.all(
        selectedFiles.map(async (file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: await readFileAsDataUrl(file)
        }))
      );

      setAttachments((current) => [...current, ...nextAttachments]);
      setAttachmentError(null);
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : 'ファイルを読み込めませんでした');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
    setAttachmentError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      title: localTitle,
      description: description || undefined,
      status,
      attachments
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
          <label className="form-label">
            添付ファイル
            <input type="file" multiple onChange={handleFileChange} />
            <span className="hint">1ファイル1MBまで、最大3ファイル</span>
          </label>
          {attachmentError && <div className="error">{attachmentError}</div>}
          <div className="attachment-list">
            {attachments.length === 0 ? (
              <div className="attachment-empty">添付ファイルはありません</div>
            ) : (
              attachments.map((attachment) => (
                <div key={attachment.id} className="attachment-item">
                  <div>
                    <div>{attachment.name}</div>
                    <div className="attachment-meta">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
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
