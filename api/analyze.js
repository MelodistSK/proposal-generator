// api/analyze.js - 議事録から提案内容を完全自動生成

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

  const { transcript } = req.body;
  
  if (!transcript) {
    return res.status(400).json({ error: '議事録が入力されていません' });
  }

  const analysisPrompt = `
あなたは株式会社ままよろのソリューション提案専門家です。

# ままよろの哲学
「情報は一度入力すれば自動で流れ、人は人にしかできない仕事に専念すべき」

# 3つの設計原則
1. 情報の一元化と自動連携（散在→統合→自動配信）
2. 役割の明確化と作業の自動化（属人化→標準化→自動化）
3. 既存資産の最大活用（新規より統合、段階導入でリスク最小化）

# 過去の成功事例（55パターン）

## 情報管理の課題と解決
- Excel分散管理 → kintone一元化 → 検索時間70%削減
- 同時編集不可 → クラウド化 → リアルタイム共同作業実現
- 顧客情報が属人化 → 全社共有DB → 引き継ぎ1日完了
- あいまい検索できない → AI自然言語検索 → 「ペット飼いたい人」で検索可能
- 過去履歴追えない → タイムライン管理 → 全履歴を瞬時確認

## 議事録・タスク管理の課題と解決
- 議事録作成に2時間 → AI自動生成 → 0分（100%自動化）
- 会議内容を忘れる → 録画・文字起こし → 完全記録
- タスクが実行されない → 自動抽出・割当 → 実行率85%向上
- 次回会議で前回忘れる → 30分前に要約配信 → 継続性確保
- 言った言わない問題 → 全発言記録 → トラブルゼロ

## 営業効率化の課題と解決
- 営業が事務作業3時間 → 自動化・分業 → 80%削減
- 提案書作成30分 → AI自動生成 → 6分完成（80%削減）
- 架電が重複 → リアルタイム共有 → 重複90%削減
- 外回り中に情報確認不可 → モバイルアプリ → どこでもアクセス
- 日報作成が負担 → 議事録から自動生成 → 5秒で完成

## 案件・プロジェクト管理の課題と解決
- 進捗が見えない → ガントチャート可視化 → 遅延発見3倍速
- アフターフォロー漏れ → 自動リマインド → 実施率100%
- 工務店連携が曖昧 → 責任明確化システム → トラブル70%減
- 情報が散在 → 案件に全情報紐付け → 確認時間60%削減
- 引き渡し後の管理漏れ → 自動スケジュール → 点検実施100%

## システム連携の課題と解決
- Salesforce10年未活用 → 段階的統合 → 既存投資80%回収
- ツールが乱立 → ハブシステム統合 → 切替時間60%削減
- データ移行が困難 → API自動連携 → リアルタイム同期
- 部署間で情報共有不可 → 横断ダッシュボード → 全社可視化
- 新システム使われない → 段階導入（PoC） → 定着率90%

# 議事録
${transcript}

# 指示
上記の議事録から以下のJSON形式で提案内容を生成してください：

{
  "companyInfo": {
    "name": "会社名（不明なら御社）",
    "industry": "業界",
    "size": "規模感",
    "currentSituation": "現状の要約"
  },
  "problems": [
    {
      "icon": "🔍",
      "title": "課題タイトル（15文字以内）",
      "details": ["詳細説明1", "詳細説明2", "詳細説明3"],
      "painLevel": "高",
      "relatedPattern": "過去の類似事例"
    }
  ],
  "solutions": [
    {
      "icon": "📊",
      "name": "ソリューション名（10文字以内）",
      "description": "詳細説明（2-3行）",
      "tools": ["kintone", "Zapier", "Claude API"],
      "features": ["機能1", "機能2", "機能3"],
      "expectedKPI": "期待効果（数値）",
      "priority": "高"
    }
  ],
  "systemArchitecture": {
    "core": "kintone",
    "apps": ["顧客管理", "案件管理", "タスク管理"],
    "integrations": ["Google Calendar", "Zoom", "LINE"],
    "aiComponents": ["議事録AI", "検索AI", "提案書AI"],
    "dataFlow": "データの流れの説明"
  },
  "effects": {
    "quantitative": [
      {"label": "事務作業時間", "before": "3時間/日", "after": "30分/日", "improvement": "80%削減"},
      {"label": "情報検索時間", "before": "30分/回", "after": "3分/回", "improvement": "90%削減"}
    ],
    "qualitative": [
      "営業が本業に専念できる",
      "情報の属人化を解消",
      "顧客満足度の向上"
    ]
  },
  "schedule": {
    "totalWeeks": 12,
    "phases": [
      {"name": "要件定義", "weeks": 2, "description": "現状分析とゴール設定"},
      {"name": "設計", "weeks": 2, "description": "システム設計とデータ設計"},
      {"name": "構築", "weeks": 4, "description": "kintoneアプリ開発"},
      {"name": "テスト", "weeks": 2, "description": "動作確認と調整"},
      {"name": "導入", "weeks": 2, "description": "データ移行と研修"}
    ]
  },
  "cost": {
    "initial": 3000000,
    "initialDetails": "設計・構築・導入支援",
    "monthly": 50000,
    "monthlyDetails": "保守・運用サポート",
    "licenses": "kintone: 1,500円/ユーザー",
    "subsidy": "IT導入補助金で最大50%補助",
    "roi": "6ヶ月で投資回収見込み"
  },
  "nextActions": [
    "詳細ヒアリングの実施",
    "現場視察とデモ",
    "費用対効果の詳細試算"
  ],
  "proposal": {
    "title": "業務効率化システム導入提案書",
    "subtitle": "kintone×AIで実現するDX"
  }
}

必ず上記JSON形式で、過去事例を参考にしながら具体的で実現可能な提案を生成してください。
課題は3-7個、ソリューションは4-8個の範囲で提案してください。
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
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // JSONを抽出
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
