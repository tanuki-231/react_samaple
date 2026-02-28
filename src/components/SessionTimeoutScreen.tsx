interface Props {
  onBackToLogin: () => void;
}

const SessionTimeoutScreen = ({ onBackToLogin }: Props) => {
  return (
    <div className="card status-screen">
      <h2>セッションタイムアウト</h2>
      <p>一定時間操作がなかったため、ログイン状態が無効になりました。再度ログインしてください。</p>
      <button onClick={onBackToLogin}>ログイン画面へ戻る</button>
    </div>
  );
};

export default SessionTimeoutScreen;
