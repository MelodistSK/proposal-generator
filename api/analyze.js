export default async function handler(req, res) {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, mockCode } = req.body;

    const prompt = `以下の議事録とモックコードから、提案書に必要な情報を抽出してください。

# 議事録・文字起こし
${transcript}

# モックコード・解説
${mockCode}

以下のJSON形式で出力してください。JSONのみを出力し、他のテキストは含めないでください：

{
  "proposalTitle": "提案のタイトル",
  "proposalSubtitle": "サブタイトル（技術やコンセプト）",
  "issues": [
    {
      "icon": "🔍",
      "title": "課題のタイトル",
      "description": "詳細な説明（箇条書き3-4項目）"
    }
  ],
  "solutions": [
    {
      "icon": "📊",
      "title": "ソリューション名",
      "description": "説明"
    }
  ],
  "systemArchitecture": "システム構成の説明",
  "techStack": [
    {
      "name": "技術名",
      "description": "説明"
    }
  ],
  "effects": [
    {
      "label": "効果ラベル",
      "description": "効果の説明"
    }
  ],
  "benefits": [
    "その他のメリット1",
    "その他のメリット2"
  ],
  "timeline": [
    {
      "phase": "フェーズ名",
      "duration": "期間",
      "tasks": "タスク内容"
    }
  ],
  "initialCost": "3,000,000",
  "monthlyCost": "50,000",
  "additionalCosts": [
    {
      "name": "費用項目",
      "amount": "金額",
      "description": "説明"
    }
  ],
  "summaryPoints": [
    {
      "icon": "🎯",
      "title": "ポイントタイトル",
      "description": "説明"
    }
  ]
}

必ず有効なJSONのみを出力してください。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    let jsonText = data.content[0].text;
    
    // JSONの抽出
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const extracted = JSON.parse(jsonText);
    
    return res.status(200).json(extracted);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
