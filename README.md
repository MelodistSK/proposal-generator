# 提案書自動生成システム v2.0 - ままよろソリューション

## 📋 概要

議事録から自動で高品質な提案書を生成するシステムです。
株式会社ままよろの過去事例とAIを活用し、最適なソリューションを提案します。

## 🚀 特徴

- **ままよろメソッド**: 情報の一元化・自動連携・既存資産活用
- **事例ベース提案**: 55以上の成功事例から最適解を導出
- **AI解析**: Claude APIによる高度な課題抽出と提案生成
- **完全自動化**: 議事録入力から提案書HTMLまで自動生成

## 📦 セットアップ

### 1. Claude API キーの取得
1. [console.anthropic.com](https://console.anthropic.com/) にアクセス
2. API Keyを生成

### 2. Vercelへのデプロイ
```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel

# 環境変数設定後、本番デプロイ
vercel --prod
```

### 3. 環境変数の設定
Vercelダッシュボードで以下を設定：
- `ANTHROPIC_API_KEY`: Claude APIキー

## 🎯 使い方

1. **議事録入力**: ヒアリング内容を入力
2. **モック追加**: 必要に応じてJSファイルをアップロード
3. **AI解析**: 課題と解決策を自動抽出
4. **提案書生成**: HTMLファイルとしてダウンロード

## 📊 対応する課題パターン

- 情報分散・検索困難
- 議事録作成・共有
- 営業事務負荷
- タスク管理・フォロー漏れ
- システム連携・統合

## 🔧 技術スタック

- **Frontend**: HTML/CSS/JavaScript
- **Backend**: Vercel Functions (Node.js)
- **AI**: Claude API (Anthropic)
- **Hosting**: Vercel

## 📝 ライセンス

株式会社ままよろ - All Rights Reserved
