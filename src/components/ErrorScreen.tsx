interface Props {
  message: string;
  onBackToLogin: () => void;
}

const ErrorScreen = ({ message, onBackToLogin }: Props) => {
  return (
    <div className="card status-screen">
      <h2>エラーが発生しました</h2>
      <p>
        フロントエンドまたはバックエンドで想定外のエラーが発生しました。時間をおいて再実行してください。
      </p>
      <div className="error">{message}</div>
      <button onClick={onBackToLogin}>ログイン画面へ戻る</button>
    </div>
  );
};

export default ErrorScreen;
