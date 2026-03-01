# APIリファレンス（TODOリスト管理フロントエンド向け）

このドキュメントは、本プロジェクト（Reactフロントエンド）が利用するバックエンドAPIの仕様を整理したものです。  
実装上のエンドポイント定義は `src/services/api.ts` を参照してください。

- ベースURL（デフォルト）: `http://localhost:3000/api`
- 環境変数で上書き: `VITE_API_BASE_URL`
- 認証方式: Bearer Token（`Authorization: Bearer <token>`）
- Content-Type: `application/json`
- 添付ファイルは JSON ボディ内の `attachments` 配列で送信（`multipart/form-data` は未使用）

---

## 共通仕様

### リクエストヘッダー
- `Content-Type: application/json`
- 認証が必要なAPIでは `Authorization: Bearer <token>`

### 添付ファイル仕様
- 添付は任意（添付なし可）
- 1TODO あたり最大 `3` ファイル
- 1ファイルあたり最大 `1MB`
- 各ファイルは `attachments` 配列の要素として、ファイル名・サイズ・MIME type・`dataUrl` を含めて送信

### エラーハンドリング方針（フロント側）
フロントエンドではAPIエラーを以下の3種類に分類して扱います。

1. `auth`（認証エラー）
   - 主に `401 / 403`
   - ログイン画面内でエラーメッセージ表示
2. `session_timeout`（セッションタイムアウト）
   - `440`、または `401` かつレスポンス本文に `session` が含まれる場合
   - セッションタイムアウト画面へ遷移
3. `unexpected`（想定外エラー）
   - 上記以外の HTTP エラー
   - ネットワークエラー（接続不可など）
   - 想定外エラー画面へ遷移

---

## 1) ログイン

### Endpoint
`POST /login`

### Request Body
```json
{
  "userId": "string",
  "password": "string"
}
```

### Success Response (`200` 想定)
```json
{
  "token": "string",
  "userId": "string"
}
```

### Error Response
- `401` / `403`: 認証失敗（`auth`）
- `5xx`: 想定外エラー（`unexpected`）

---

## 2) TODO一覧取得

### Endpoint
`GET /todos`

### Headers
- `Authorization: Bearer <token>`

### Success Response (`200`)
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "pending",
    "attachmentCount": 1
  }
]
```

- `GET /todos` では添付ファイル本体は返さず、添付有無の判定に必要な `attachmentCount` のみ返却

### `status` の値
- `pending`
- `in_progress`
- `done`

### Error Response
- `401` / `440`: セッション切れ（`session_timeout`）
- `403`: 認可エラー（`auth`）
- `5xx`: 想定外エラー（`unexpected`）

---

## 3) TODO追加

### Endpoint
`POST /todos`

### Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "title": "string",
  "description": "string",
  "status": "pending",
  "attachments": [
    {
      "id": "string",
      "name": "sample.pdf",
      "size": 12345,
      "type": "application/pdf",
      "dataUrl": "data:application/pdf;base64,..."
    }
  ]
}
```

### Success Response (`201` or `200`)
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "pending",
  "attachments": [
    {
      "id": "string",
      "name": "sample.pdf",
      "size": 12345,
      "type": "application/pdf",
      "dataUrl": "data:application/pdf;base64,..."
    }
  ]
}
```

### Error Response
- `401` / `440`: セッション切れ（`session_timeout`）
- `403`: 認可エラー（`auth`）
- `4xx`（バリデーションエラーなど）: 想定外エラー画面またはフォーム側表示への拡張余地あり
- `5xx`: 想定外エラー（`unexpected`）

---

## 4) TODO更新

### Endpoint
`PUT /todos/{id}`

### Headers
- `Authorization: Bearer <token>`

### Path Parameters
- `id` (string): 対象TODO ID

### Request Body
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "in_progress",
  "attachments": [
    {
      "id": "string",
      "name": "sample.pdf",
      "size": 12345,
      "type": "application/pdf",
      "dataUrl": "data:application/pdf;base64,..."
    }
  ]
}
```

### Success Response (`200`)
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "in_progress",
  "attachments": [
    {
      "id": "string",
      "name": "sample.pdf",
      "size": 12345,
      "type": "application/pdf",
      "dataUrl": "data:application/pdf;base64,..."
    }
  ]
}
```

### Error Response
- `401` / `440`: セッション切れ（`session_timeout`）
- `403`: 認可エラー（`auth`）
- `404`: 対象なし（`unexpected` として扱う）
- `5xx`: 想定外エラー（`unexpected`）

---

## 5) TODO削除

### Endpoint
`DELETE /todos/{id}`

### Headers
- `Authorization: Bearer <token>`

### Path Parameters
- `id` (string): 対象TODO ID

### Success Response (`204` or `200`)
- レスポンスボディなし、または空JSONを想定

### Error Response
- `401` / `440`: セッション切れ（`session_timeout`）
- `403`: 認可エラー（`auth`）
- `404`: 対象なし（`unexpected`）
- `5xx`: 想定外エラー（`unexpected`）

---

## モックAPI利用時の挙動
`VITE_USE_MOCK_API=true` の場合、HTTP通信ではなくフロント内の `MockApiClient` が使われます。

- ログイン成功条件
  - userId: `demo`
  - password: `password`
- TODO初期データが2件投入済み
- 追加・更新・削除はメモリ上で処理（再起動でリセット）
- 添付ファイルもメモリ上に保持

---

## 型定義（フロントエンド）

### LoginRequest
```ts
interface LoginRequest {
  userId: string;
  password: string;
}
```

### LoginResponse
```ts
interface LoginResponse {
  token: string;
  userId: string;
}
```

### TodoItem
```ts
interface TodoAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

type TodoStatus = 'pending' | 'in_progress' | 'done';

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  attachmentCount?: number;
  attachments?: TodoAttachment[];
}
```
