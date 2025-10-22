// api/analyze.js - Vercel Pro版（高品質・詳細分析）

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

  // フル機能版プロンプト（詳細分析）
  const analysisPrompt = `
あなたは株式会社ままよろのソリューション提案専門家です。

# ままよろの哲学
「情報は一度入力すれば自動で流れ、人は人にしかできない仕事に専念すべき」

# 3つの設計原則
1. 情報の一元化と自動連携（散在→統合→自動配信）
2. 役割の明確化と作業の自動化（属人化→標準化→自動化）
3. 既存資産の最大活用（新規より統合、段階導入でリスク最小化）

# 過去の成功事例パターン（55事例から抜粋）

## 情報管理系
- Excel分散 → kintone一元化 → 検索時間70%削減
- 同時編集不可 → クラウド化 → リアルタイム協働
- 属人化 → 共有DB → 引き継ぎ1日完了
- あいまい検索不可 → AI自然言語検索 → 精度90%向上

## 議事録・タスク系  
- 議事録2時間作成 → AI自動生成 → 100%自動化
- タスク漏れ → 自動抽出・通知 → 実行率85%向上
- 言った言わない → 録画・文字起こし → トラブルゼロ

## 営業効率化系
- 事務作業3時間 → 自動化・分業 → 80%削減
- 提案書30分 → AI生成 → 6分完成
- 架電重複 → リアルタイム共有 → 重複90%削減
- 日報作成30分 → 議事録から自動生成 → 5秒完成

## 案件管理系
- 進捗不明 → ガントチャート → 遅延発見3倍速
- フォロー漏れ → 自動リマインド → 実施率100%
- 情報分散 → 一元管理 → 確認時間60%削減

## システム統合系
- Salesforce未活用10年 → 段階統合 → 投資80%回収
- ツール乱立 → ハブ統合 → 切替時間60%削減

# 議事録（全文）
${transcript}

# 分析指示
上記の議事録を詳細に分析し、以下のJSON形式で提案内容を生成してください。
過去の成功事例を参考に、具体的で実現可能な提案を作成すること。

## 出力形式（必ずこのJSON形式で）
{
  "companyInfo": {
    "name": "会社名（不明なら御社）",
    "industry": "業界",
    "size": "規模感（従業員数等）",
    "currentSituation": "現状の要約（100字程度）"
  },
  "problems": [
    {
      "icon": "🔍",
      "title": "課題タイトル（15文字以内）",
      "details": ["詳細説明1", "詳細説明2", "詳細説明3"],
      "painLevel": "高|中|低",
      "relatedPattern": "類似する過去事例"
    }
  ],
  "solutions": [
    {
      "icon": "📊",
      "name": "ソリューション名（10文字以内）",
      "description": "詳細説明（50-100文字）",
      "tools": ["kintone", "Zapier", "Claude API等"],
      "features": ["機能1", "機能2", "機能3"],
      "expectedKPI": "期待効果（数値）",
      "priority": "高|中|低"
    }
  ],
  "systemArchitecture": {
    "core": "kintone",
    "apps": ["必要なアプリ一覧"],
    "integrations": ["連携サービス"],
    "aiComponents": ["AI機能"],
    "dataFlow": "データフローの説明"
  },
  "effects": {
    "quantitative": [
      {
        "label": "改善項目",
        "before": "現状",
        "after": "改善後",
        "improvement": "改善率"
      }
    ],
    "qualitative": ["定性効果1", "定性効果2", "定性効果3"]
  },
  "schedule": {
    "totalWeeks": 12,
    "phases": [
      {
        "name": "フェーズ名",
        "weeks": 2,
        "description": "内容"
      }
    ]
  },
  "cost": {
    "initial": 3000000,
    "initialDetails": "内訳説明",
    "monthly": 50000,
    "monthlyDetails": "内訳説明",
    "licenses": "必要ライセンス",
    "subsidy": "活用可能な補助金",
    "roi": "投資回収期間"
  },
  "nextActions": [
    "次のアクション1",
    "次のアクション2",
    "次のアクション3"
  ],
  "proposal": {
    "title": "提案書タイトル",
    "subtitle": "サブタイトル"
  }
}

# 重要な指示
- 課題は3-7個の範囲で抽出
- ソリューションは4-8個の範囲で提案  
- 必ず過去の成功事例パターンを参考にする
- 数値は具体的に（％、時間、金額等）
- ままよろメソッドに沿った提案にする
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
        model: 'claude-3-opus-20240229', // 最高品質モデル
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid API response structure');
    }
    
    const content = data.content[0].text;
    
    // JSONを抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return res.status(200).json(analysisResult);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } else {
      throw new Error('No JSON found in response');
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: '解析に失敗しました', 
      details: error.message,
      suggestion: 'APIキーが正しく設定されているか確認してください'
    });
  }
}
