# 提案書自動生成システム - Vercel デプロイ手順

## 📁 フォルダ構成

```
proposal-generator/
├── package.json
├── vercel.json
├── README.md
├── api/
│   ├── analyze.js
│   └── generate.js
└── public/
    └── index.html
```

## 🚀 デプロイ手順

### 1. プロジェクトフォルダを作成

```bash
mkdir proposal-generator
cd proposal-generator
```

### 2. 各ファイルを配置

- `package.json` をルートに配置
- `vercel.json` をルートに配置
- `api/` フォルダを作成し、`analyze.js` と `generate.js` を配置
- `public/` フォルダを作成し、`index.html` を配置

### 3. Vercel にデプロイ

#### 方法A: Vercel CLI（推奨）

```bash
# Vercel CLIをインストール（初回のみ）
npm i -g vercel

# デプロイ
vercel

# ログイン → プロジェクト名入力 → デプロイ完了
```

#### 方法B: GitHub 経由

1. GitHubに新しいリポジトリを作成
2. プロジェクトをプッシュ
3. [vercel.com](https://vercel.com) にアクセス
4. 「Import Project」→ GitHubリポジトリを選択
5. 「Deploy」をクリック

### 4. 環境変数の設定（重要！）

デプロイ後、Vercelダッシュボードで環境変数を設定：

1. プロジェクトを選択
2. 「Settings」→「Environment Variables」
3. 以下を追加：

```
ANTHROPIC_API_KEY = あなたのClaude APIキー
```

### 5. 再デプロイ

環境変数を設定したら、再デプロイ：

```bash
vercel --prod
```

または、Vercelダッシュボードから「Redeploy」

## ✅ 完成！

デプロイが完了すると、URLが発行されます：

```
https://your-project.vercel.app
```

このURLにアクセスすれば、提案書自動生成システムが使えます！

## 🔑 Claude API キーの取得方法

1. [console.anthropic.com](https://console.anthropic.com/) にアクセス
2. アカウント作成/ログイン
3. 「API Keys」→「Create Key」
4. 生成されたキーをコピー
5. Vercelの環境変数に設定

## 💡 トラブルシューティング

### エラー: "ANTHROPIC_API_KEY is not defined"
→ 環境変数が設定されていません。上記の手順4を実行してください。

### エラー: "Failed to fetch"
→ APIエンドポイントが正しく動作していません。Vercelのログを確認してください。

### ローカルでテストしたい場合

```bash
# .env.local ファイルを作成
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local

# ローカルサーバー起動
vercel dev
```

## 📝 使い方

1. 議事録を入力
2. モックコード（JSファイル）をアップロード
3. AI解析 → 内容確認 → 提案書生成
4. HTMLダウンロード

完成！