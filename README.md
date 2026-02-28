# TODOリスト管理フロントエンド

TypeScript + React (Vite) を使用した TODO リスト管理のサンプルフロントエンドです。ログイン画面と、TODO の追加・編集・削除が可能な管理画面を備えています。

## 必要要件
- Node.js 18 以降
- npm

## セットアップ
```bash
npm install
```

## 開発サーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### モック API の利用
バックエンドが無い状態で起動すると、デフォルトで `http://localhost:3000/api` へ接続しに行くため、
ログイン時に "Failed to fetch" と表示されます。バックエンドを起動するか、モック API を利用してくださ
い。
`VITE_USE_MOCK_API=true` を設定すると、以下のデモアカウントでログインできます。
- ユーザID: `demo`
- パスワード: `password`

```bash
VITE_USE_MOCK_API=true npm run dev
```

## 本番ビルド
```bash
npm run build
npm run preview
```

## 機能概要
- ログイン画面
  - ユーザID・パスワード入力欄とログインボタン
  - WebAPI への POST（モック利用時はローカルで検証）
  - 成功時に TODO リスト管理画面へ遷移、失敗時はエラーメッセージを表示
- TODO 管理画面
  - TODO の一覧表示、追加・編集・削除ボタン
  - 追加・編集はダイアログで入力し WebAPI へ POST/PUT
  - 削除前には確認ダイアログを表示し、承認後に WebAPI へ DELETE

例外処理と簡易的なバリデーションを組み込み、可読性を意識した構成になっています。
