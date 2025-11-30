import { FormEvent, useState } from 'react';

interface Props {
  onLogin: (userId: string, password: string) => Promise<void>;
}

const LoginForm = ({ onLogin }: Props) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(userId, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ログインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>ログイン</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-label">
          ユーザID
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="demo"
            required
          />
        </label>
        <label className="form-label">
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? '処理中...' : 'ログイン'}
        </button>
      </form>
      <p className="hint">デモ用のユーザID: demo / パスワード: password</p>
    </div>
  );
};

export default LoginForm;
