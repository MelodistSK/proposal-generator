// api/analyze.js - 議事録解析エンドポイント

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, mockCode } = req.body;
  
  if (!transcript) {
    return res.status(400).json({ error: '議事録が入力されていません' });
  }

  // ままよろメソッドと事例データベース
  const mamayoroContext = `
# 株式会社ままよろ - ソリューション設計哲学

## 基本理念
「情報は一度入力すれば自動で流れ、人は人にしかできない仕事に専念すべき」

## 3つの設計原則
1. 情報の一元化と自動連携（散在→統合→自動配信）
2. 役割の明確化と作業の自動化（属人化→標準化→自動化）
3. 既存資産の最大活用（新規より統合、段階導入でリスク最小化）

## 成功事例パターン

### 情報管理系
- Excel分散 → kintone一元管理 → 検索時間70%削減
- あいまい検索不可 → AI自然言語検索 → 検索精度90%向上
- 属人化 → クラウド化・権限管理 → 引き継ぎ円滑化

### 議事録・タスク系
- 議事録作成2時間 → AI自動生成 → 100%自動化
- タスク抜け漏れ → 自動抽出・通知 → 実行率85%向上
- 言った言わない → 録画・文字起こし → トラブルゼロ

### 営業効率化系
- 事務作業3時間 → 自動化・分業 → 80%削減
- 提案書30分 → AI自動生成 → 6分で完成
- 架電重複 → リアルタイム共有 → 重複90%削減

### 案件管理系
- 進捗不明 → ガントチャート可視化 → 遅延発見3倍速
- フォロー漏れ → 自動リマインド → 実施率100%
- 情報分散 → 関連情報一元表示 → 確認時間60%削減

### システム統合系
- Salesforce未活用 → 段階的統合 → 既存投資80%回収
- ツール乱立 → ハブシステム統合 → 切替時間60%削減
- データ移行困難 → API連携 → 自動同期実現
`;

  const analysisPrompt = `
${mamayoroContext}

## 今回の議事録
${transcript}

${mockCode ? `## 提供されたモックコード\n${mockCode}` : ''}

上記の議事録とままよろの成功事例を基に、以下の形式で分析結果を出力してください。

## 出力形式（JSON）
{
  "companyName": "顧客企業名（不明なら'御社'）",
  "industry": "業界",
  "problems": [
    {
      "icon": "絵文字",
      "title": "課題タイトル（15文字以内）",
      "details": ["詳細1", "詳細2", "詳細3"],
      "category": "情報管理|議事録|営業|案件管理|システム統合",
      "painLevel": "高|中|低"
    }
  ],
  "solutions": [
    {
      "icon": "絵文字",
      "name": "ソリューション名（10文字以内）",
      "description": "説明（2-3行）",
      "tools": ["kintone", "Zapier", "Claude API等"],
      "features": ["機能1", "機能2", "機能3"],
      "expectedKPI": "期待効果（数値）"
    }
  ],
  "systemArchitecture": {
    "apps": ["必要なアプリ/システム"],
    "integrations": ["連携サービス"],
    "dataFlow": "データフローの説明"
  },
  "effects": {
    "quantitative": [
      {"metric": "指標名", "improvement": "改善率"}
    ],
    "qualitative": ["定性効果1", "定性効果2"]
  },
  "schedule": {
    "totalWeeks": 12,
    "phases": [
      {"name": "フェーズ名", "weeks": 2, "description": "内容"}
    ]
  },
  "cost": {
    "initial": 3000000,
    "monthly": 50000,
    "subsidy": "IT導入補助金（最大50%）",
    "roi": "6ヶ月で投資回収見込み"
  },
  "nextSteps": [
    "次のアクション1",
    "次のアクション2"
  ]
}

必ず上記のJSON形式で、ままよろメソッドに沿った提案を生成してください。
`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // JSONを抽出してパース
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return res.status(200).json(analysisResult);
    } else {
      throw new Error('JSON解析に失敗しました');
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: '解析に失敗しました', 
      details: error.message 
    });
  }
}
