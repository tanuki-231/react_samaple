interface Props {
  message: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ message, open, onConfirm, onCancel }: Props) => {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="alertdialog" aria-modal="true">
      <div className="dialog">
        <div className="dialog-header">
          <h3>確認</h3>
        </div>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button className="danger" onClick={onConfirm}>
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
