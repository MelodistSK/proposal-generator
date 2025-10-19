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
    const formData = req.body;

    const designSystemText = `
デザインシステム & 機能仕様

カラーパレット:
- プライマリグラデーション: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- セカンダリグラデーション: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
- アクセントカラー: #3b82f6, #10b981, #ef4444
- テキストカラー: #1e40af (見出し), #374151 (本文), #6b7280 (補足)

タイポグラフィ:
- 表紙タイトル: 48px, bold
- セクションタイトル: 32px, bold, #1e40af, border-bottom
- サブタイトル: 20px, bold
- 本文: 16px, line-height 1.8

レイアウト:
- コンテナ: max-width 1200px
- ページ: 白背景, padding 40px 60px, min-height 675px
- 9ページ固定構成

コンポーネントパターン:
1. 表紙 - グラデーション背景、白文字、中央配置
2. 目次 - 円形番号バッジ、点線、ページ番号
3. 課題リスト - 左に赤い太線、グレー背景
4. ソリューションカード - 2列グリッド、グラデーション
5. システム構成図 - 薄いグレー背景、レイヤー構造
6. 効果カード - 3列グリッド
7. タイムライン - 左に縦線、円形バッジ
8. 費用セクション - 2列グリッド

必須機能:
- 画像アップロード機能（各ページに配置）
- 編集可能なキャプション機能

PDF生成機能（このコードを完全に使用）:
async function generatePDF() {
  const button = document.getElementById('pdfButton');
  const overlay = document.getElementById('pdfLoadingOverlay');
  const progressText = document.getElementById('pdfProgress');
  
  button.disabled = true;
  overlay.classList.add('active');
  
  try {
    const editElements = document.querySelectorAll('.add-image-button, .image-upload-area, .remove-upload-area, .remove-image, .cta-step-checkbox, .pdf-button');
    editElements.forEach(el => el.style.display = 'none');
    
    const captionInputs = document.querySelectorAll('.image-caption input');
    const captionTexts = document.querySelectorAll('.image-caption-text');
    captionInputs.forEach(input => input.style.display = 'none');
    captionTexts.forEach(text => {
      if (text.textContent.trim()) {
        text.style.display = 'block';
      }
    });
    
    progressText.textContent = '全ページを1枚の画像に変換中...';
    
    const container = document.getElementById('proposalContainer');
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      height: container.scrollHeight,
      windowHeight: container.scrollHeight
    });
    
    progressText.textContent = 'PDFを生成中...';
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [imgWidth, imgHeight],
      compress: true
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const filename = dateStr + '.pdf';
    
    pdf.save(filename);
    
    progressText.textContent = '完了！';
  } catch (error) {
    console.error('PDF生成エラー:', error);
    alert('PDF生成中にエラーが発生しました。もう一度お試しください。');
  } finally {
    const editElements = document.querySelectorAll('.add-image-button, .image-upload-area, .remove-upload-area, .remove-image, .cta-step-checkbox, .pdf-button');
    editElements.forEach(el => el.style.display = '');
    
    const captionInputs = document.querySelectorAll('.image-caption input');
    const captionTexts = document.querySelectorAll('.image-caption-text');
    captionInputs.forEach(input => {
      if (!input.nextElementSibling || !input.nextElementSibling.textContent.trim()) {
        input.style.display = '';
      }
    });
    captionTexts.forEach(text => {
      if (text.textContent.trim()) {
        text.style.display = '';
      }
    });
    
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 500);
    
    button.disabled = false;
  }
}

CDN（必須）:
- html2canvas: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
- jsPDF: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

印刷設定:
- -webkit-print-color-adjust: exact
- print-color-adjust: exact
`;

    const promptText = `以下のデザインシステムと情報をもとに、完全な提案書HTMLを生成してください。

${designSystemText}

提案書情報:

会社情報:
- 会社名: ${formData.companyName}
- 担当者: ${formData.contactPerson}
- メール: ${formData.email}
- 電話: ${formData.phone}

提案内容:
- タイトル: ${formData.proposalTitle}
- サブタイトル: ${formData.proposalSubtitle}

課題: ${JSON.stringify(formData.issues, null, 2)}
ソリューション: ${JSON.stringify(formData.solutions, null, 2)}
システム構成: ${formData.systemArchitecture}
技術スタック: ${JSON.stringify(formData.techStack, null, 2)}
導入効果: ${JSON.stringify(formData.effects, null, 2)}
その他メリット: ${JSON.stringify(formData.benefits, null, 2)}
スケジュール: ${JSON.stringify(formData.timeline, null, 2)}
初期費用: ¥${formData.initialCost}
月額費用: ¥${formData.monthlyCost}
その他費用: ${JSON.stringify(formData.additionalCosts, null, 2)}
まとめポイント: ${JSON.stringify(formData.summaryPoints, null, 2)}

出力要件:
1. 完全なHTML（DOCTYPE宣言からhtmlタグ閉じまで）
2. デザインシステムで定義されたスタイルを再現
3. 画像アップロード機能とPDF生成機能を実装
4. 9ページ構成を厳守
5. 現在の日付を自動表示

実行可能なHTMLコードのみを出力してください。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: promptText
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    let htmlText = data.content[0].text;
    
    // HTMLの抽出
    htmlText = htmlText.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    return res.status(200).json({ html: htmlText });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
