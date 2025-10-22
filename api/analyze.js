// api/analyze.js - Claude 3.5 Sonnet版（高速・高品質）

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

  // Sonnet 3.5用の最適化されたプロンプト
  const analysisPrompt = `
あなたは株式会社ままよろのソリューション提案専門家です。
議事録から課題を抽出し、過去の成功事例を基に最適な提案を生成してください。

# ままよろメソッド
「情報は一度入力すれば自動で流れ、人は人にしかできない仕事に専念すべき」

# 成功事例パターン
- Excel分散→kintone一元化→検索時間70%削減
- 議事録2時間→AI自動化→100%削減
- 事務作業3時間→自動化→80%削減
- Salesforce未活用→段階統合→投資80%回収
- タスク漏れ→自動通知→実行率85%向上

# 議事録
${transcript}

# 出力指示
以下のJSON形式で提案を生成してください。過去事例を参考に具体的な数値を含めること。

{
  "companyInfo": {
    "name": "会社名（不明なら御社）",
    "industry": "業界",
    "size": "規模",
    "currentSituation": "現状要約"
  },
  "problems": [
    {
      "icon": "🔍",
      "title": "課題名（15字以内）",
      "details": ["詳細1", "詳細2", "詳細3"],
      "painLevel": "高",
      "relatedPattern": "類似事例"
    }
  ],
  "solutions": [
    {
      "icon": "📊",
      "name": "解決策（10字以内）",
      "description": "説明（50-100字）",
      "tools": ["kintone", "Zapier"],
      "features": ["機能1", "機能2", "機能3"],
      "expectedKPI": "期待効果",
      "priority": "高"
    }
  ],
  "systemArchitecture": {
    "core": "kintone",
    "apps": ["アプリ名"],
    "integrations": ["連携サービス"],
    "aiComponents": ["AI機能"],
    "dataFlow": "データフロー説明"
  },
  "effects": {
    "quantitative": [
      {
        "label": "項目",
        "before": "現状",
        "after": "改善後",
        "improvement": "改善率"
      }
    ],
    "qualitative": ["効果1", "効果2", "効果3"]
  },
  "schedule": {
    "totalWeeks": 12,
    "phases": [
      {"name": "フェーズ", "weeks": 2, "description": "内容"}
    ]
  },
  "cost": {
    "initial": 3000000,
    "initialDetails": "詳細",
    "monthly": 50000,
    "monthlyDetails": "詳細",
    "licenses": "kintone 1,500円/人",
    "subsidy": "IT導入補助金50%",
    "roi": "6ヶ月で回収"
  },
  "nextActions": ["アクション1", "アクション2", "アクション3"],
  "proposal": {
    "title": "業務効率化システム導入提案書",
    "subtitle": "kintone×AIで実現するDX"
  }
}

課題3-7個、解決策4-8個で提案。必ず具体的な数値を含めること。`;

  try {
    // Claude 3.5 Sonnetを使用（高速かつ高品質）
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Sonnet 3.5最新版
        max_tokens: 3000,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', response.status, errorData);
      
      // APIキーエラーの場合
      if (response.status === 401) {
        return res.status(500).json({ 
          error: 'APIキーエラー',
          details: 'Vercelの環境変数にANTHROPIC_API_KEYが正しく設定されていません'
        });
      }
      
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid response:', data);
      throw new Error('Invalid API response');
    }
    
    const content = data.content[0].text;
    
    // JSONを抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        
        // データ検証と補完
        const validatedResult = validateAndCompleteData(result);
        return res.status(200).json(validatedResult);
        
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // パースエラー時はデフォルト提案
        return res.status(200).json(getDefaultProposal(transcript));
      }
    }
    
    // JSONが見つからない場合
    return res.status(200).json(getDefaultProposal(transcript));
    
  } catch (error) {
    console.error('Analysis Error:', error);
    
    // タイムアウトやその他のエラーでもデフォルト提案を返す
    return res.status(200).json(getDefaultProposal(transcript));
  }
}

// データの検証と補完
function validateAndCompleteData(data) {
  // 必須フィールドの補完
  if (!data.companyInfo) {
    data.companyInfo = {
      name: "御社",
      industry: "（業界）",
      size: "（規模）",
      currentSituation: "業務効率化が必要な状況"
    };
  }
  
  // 課題が少ない場合は追加
  if (!data.problems || data.problems.length < 3) {
    data.problems = data.problems || [];
    const defaultProblems = [
      {
        icon: "📊",
        title: "情報の分散管理",
        details: ["データが散在", "検索に時間", "共有困難"],
        painLevel: "高",
        relatedPattern: "Excel分散事例"
      },
      {
        icon: "⏰",
        title: "作業時間の長さ",
        details: ["手作業が多い", "効率化未実施", "残業発生"],
        painLevel: "高",
        relatedPattern: "事務作業3時間事例"
      },
      {
        icon: "📝",
        title: "属人化リスク",
        details: ["引き継ぎ困難", "情報が個人依存", "標準化なし"],
        painLevel: "中",
        relatedPattern: "属人化解消事例"
      }
    ];
    
    while (data.problems.length < 3) {
      data.problems.push(defaultProblems[data.problems.length]);
    }
  }
  
  // ソリューションが少ない場合は追加
  if (!data.solutions || data.solutions.length < 4) {
    data.solutions = data.solutions || [];
    const defaultSolutions = [
      {
        icon: "💼",
        name: "顧客管理",
        description: "kintoneで顧客情報を一元管理、検索時間を大幅削減",
        tools: ["kintone"],
        features: ["一元管理", "検索機能", "権限管理"],
        expectedKPI: "検索時間70%削減",
        priority: "高"
      },
      {
        icon: "🤖",
        name: "AI議事録",
        description: "会議の自動文字起こしと要約生成で議事録作成を完全自動化",
        tools: ["Zoom", "Claude API"],
        features: ["自動文字起こし", "要約生成", "タスク抽出"],
        expectedKPI: "議事録作成100%自動化",
        priority: "高"
      },
      {
        icon: "📋",
        name: "タスク管理",
        description: "タスクの自動生成と進捗管理で抜け漏れを防止",
        tools: ["kintone", "Slack"],
        features: ["自動生成", "進捗管理", "通知機能"],
        expectedKPI: "タスク実行率85%向上",
        priority: "中"
      },
      {
        icon: "📱",
        name: "モバイル対応",
        description: "スマートフォンからいつでもどこでも業務可能",
        tools: ["kintone"],
        features: ["モバイルアプリ", "リアルタイム同期", "プッシュ通知"],
        expectedKPI: "外出先対応100%",
        priority: "中"
      }
    ];
    
    while (data.solutions.length < 4) {
      data.solutions.push(defaultSolutions[data.solutions.length]);
    }
  }
  
  // その他の必須フィールドを確認・補完
  data.systemArchitecture = data.systemArchitecture || {
    core: "kintone",
    apps: ["顧客管理", "案件管理", "タスク管理", "議事録管理"],
    integrations: ["Google Calendar", "Zoom", "LINE", "Slack"],
    aiComponents: ["議事録AI", "検索AI", "提案書AI"],
    dataFlow: "各種データをkintoneに集約し、必要に応じて外部連携"
  };
  
  data.effects = data.effects || {
    quantitative: [
      {
        label: "事務作業時間",
        before: "3時間/日",
        after: "30分/日",
        improvement: "80%削減"
      },
      {
        label: "情報検索時間",
        before: "30分/回",
        after: "3分/回",
        improvement: "90%削減"
      }
    ],
    qualitative: [
      "情報の一元化による属人化解消",
      "リアルタイム情報共有の実現",
      "顧客満足度の向上"
    ]
  };
  
  data.schedule = data.schedule || {
    totalWeeks: 12,
    phases: [
      {name: "要件定義", weeks: 2, description: "現状分析とゴール設定"},
      {name: "設計", weeks: 2, description: "システム設計"},
      {name: "構築", weeks: 4, description: "開発・実装"},
      {name: "テスト", weeks: 2, description: "動作確認"},
      {name: "導入", weeks: 2, description: "本番移行・研修"}
    ]
  };
  
  data.cost = data.cost || {
    initial: 3000000,
    initialDetails: "設計・構築・導入支援",
    monthly: 50000,
    monthlyDetails: "保守・運用サポート",
    licenses: "kintone: 1,500円/ユーザー/月",
    subsidy: "IT導入補助金で最大50%補助",
    roi: "6ヶ月で投資回収見込み"
  };
  
  data.nextActions = data.nextActions || [
    "詳細ヒアリングの実施",
    "現場視察・デモ実施",
    "お見積りの作成"
  ];
  
  data.proposal = data.proposal || {
    title: "業務効率化システム導入提案書",
    subtitle: "kintone×AIで実現するDX"
  };
  
  return data;
}

// デフォルト提案（フォールバック）
function getDefaultProposal(transcript) {
  // 議事録から会社名を推測
  const companyMatch = transcript.match(/(?:株式会社|会社)[\s]*([^\s、。,]+)/);
  const companyName = companyMatch ? companyMatch[1] : "御社";
  
  return {
    companyInfo: {
      name: companyName,
      industry: "（業界）",
      size: "（規模）",
      currentSituation: "業務効率化とデジタル化が急務な状況"
    },
    problems: [
      {
        icon: "📊",
        title: "情報の分散管理",
        details: ["Excelでの個別管理", "同時編集ができない", "最新版が不明"],
        painLevel: "高",
        relatedPattern: "Excel分散管理の事例"
      },
      {
        icon: "⏰",
        title: "事務作業の負荷",
        details: ["手作業が多い", "繰り返し作業", "残業の常態化"],
        painLevel: "高",
        relatedPattern: "事務作業3時間の事例"
      },
      {
        icon: "🔍",
        title: "情報検索の困難",
        details: ["過去データが見つからない", "履歴が追えない", "属人化"],
        painLevel: "中",
        relatedPattern: "検索時間30分の事例"
      },
      {
        icon: "📝",
        title: "議事録作成負荷",
        details: ["作成に時間がかかる", "共有が遅い", "タスク漏れ"],
        painLevel: "高",
        relatedPattern: "議事録2時間の事例"
      }
    ],
    solutions: [
      {
        icon: "💼",
        name: "顧客管理システム",
        description: "kintoneで顧客情報を一元管理し、全社で情報共有",
        tools: ["kintone"],
        features: ["クラウド管理", "同時編集", "履歴管理"],
        expectedKPI: "検索時間70%削減",
        priority: "高"
      },
      {
        icon: "🤖",
        name: "AI議事録",
        description: "Zoom録画を自動で文字起こし・要約し、タスクも自動抽出",
        tools: ["Zoom", "Claude API"],
        features: ["自動文字起こし", "要約生成", "タスク抽出"],
        expectedKPI: "議事録作成100%自動化",
        priority: "高"
      },
      {
        icon: "📋",
        name: "タスク管理",
        description: "タスクの見える化と自動リマインドで確実な実行",
        tools: ["kintone", "Slack"],
        features: ["カンバンボード", "自動通知", "進捗管理"],
        expectedKPI: "タスク実行率85%向上",
        priority: "中"
      },
      {
        icon: "🔄",
        name: "ワークフロー",
        description: "申請・承認フローを電子化し、処理時間を短縮",
        tools: ["kintone"],
        features: ["電子承認", "自動通知", "履歴管理"],
        expectedKPI: "承認時間60%削減",
        priority: "中"
      },
      {
        icon: "📊",
        name: "ダッシュボード",
        description: "リアルタイムで経営指標を可視化",
        tools: ["kintone"],
        features: ["リアルタイム更新", "グラフ表示", "KPI管理"],
        expectedKPI: "レポート作成90%削減",
        priority: "低"
      }
    ],
    systemArchitecture: {
      core: "kintone",
      apps: ["顧客管理", "案件管理", "タスク管理", "議事録管理", "申請管理"],
      integrations: ["Google Calendar", "Zoom", "LINE", "Slack", "メール"],
      aiComponents: ["議事録AI", "検索AI", "分析AI"],
      dataFlow: "全データをkintoneに集約、必要に応じて各ツールと自動連携"
    },
    effects: {
      quantitative: [
        {
          label: "事務作業時間",
          before: "3時間/日",
          after: "30分/日",
          improvement: "80%削減"
        },
        {
          label: "情報検索時間",
          before: "30分/回",
          after: "3分/回",
          improvement: "90%削減"
        },
        {
          label: "議事録作成",
          before: "2時間/回",
          after: "0分",
          improvement: "100%自動化"
        }
      ],
      qualitative: [
        "情報の一元化で属人化を解消",
        "リアルタイムな情報共有を実現",
        "顧客対応スピードの向上",
        "データに基づく意思決定",
        "働き方改革の推進"
      ]
    },
    schedule: {
      totalWeeks: 12,
      phases: [
        {name: "要件定義", weeks: 2, description: "現状分析とゴール設定"},
        {name: "設計", weeks: 2, description: "システム・データ設計"},
        {name: "構築", weeks: 4, description: "アプリ開発・連携構築"},
        {name: "テスト", weeks: 2, description: "動作確認・調整"},
        {name: "導入", weeks: 2, description: "データ移行・研修"}
      ]
    },
    cost: {
      initial: 3000000,
      initialDetails: "要件定義・設計・構築・導入支援",
      monthly: 50000,
      monthlyDetails: "保守サポート・機能追加対応",
      licenses: "kintone: 1,500円/ユーザー/月",
      subsidy: "IT導入補助金で最大50%補助（最大450万円）",
      roi: "6ヶ月で投資回収見込み"
    },
    nextActions: [
      "詳細ヒアリングの実施（現場課題の深掘り）",
      "デモンストレーション実施",
      "概算見積りとROI試算の提示"
    ],
    proposal: {
      title: "業務効率化システム導入提案書",
      subtitle: "kintone×AIで実現する次世代DX"
    }
  };
}
