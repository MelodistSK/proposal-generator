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

グリッドレイアウトの最適化ルール:
- 1-2個の項目: 1列グリッド（grid-template-columns: 1fr）
- 3-4個の項目: 2列グリッド（grid-template-columns: repeat(2, 1fr)）
- 5-6個の項目: 2列グリッド（grid-template-columns: repeat(2, 1fr)）
- 7個以上の項目: 3列グリッド（grid-template-columns: repeat(3, 1fr)）
- 効果カードは3個の場合のみ3列、それ以外は上記ルール適用

コンポーネントパターン:
1. 表紙 - グラデーション背景、白文字、中央配置
2. 目次 - 円形番号バッジ、点線、ページ番号（7項目固定）
3. 課題リスト - 左に赤い太線、グレー背景
4. ソリューションカード - グリッド配置（数に応じて列数調整）、グラデーション
5. システム構成図 - 薄いグレー背景、レイヤー構造
6. 効果カード - グリッド配置（数に応じて列数調整）
7. タイムライン - 左に縦線、円形バッジ
8. 費用セクション - 2列グリッド固定（初期費用・月額費用）

画像挿入の配置ルール（重要）:
**各ページの最後、ページフッターの直前に画像コンテナを配置すること**

画像コンテナの実装:
<div class="images-container" data-page="ページID">
  <button class="add-image-button" onclick="addUploadArea(this.parentElement)">
    ➕ 画像を追加
  </button>
</div>

各ページのdata-page属性:
- ページ1（表紙）: data-page="cover"
- ページ2（目次）: data-page="table-of-contents"
- ページ3（課題）: data-page="current-issues"
- ページ4（ソリューション）: data-page="solution-overview"
- ページ5（システム構成）: data-page="system-architecture"
- ページ6（導入効果）: data-page="expected-effects"
- ページ7（スケジュール）: data-page="implementation-schedule"
- ページ8（費用）: data-page="pricing"
- ページ9（まとめ）: data-page="summary-contact"

必須機能:
- 画像アップロード機能（各ページの最後に配置）
- 編集可能なキャプション機能

PDF生成機能（このコードを完全に使用）:
async function generatePDF() {
  const button = document.getElementById('pdfButton');
  const overlay = document.getElementById('pdfLoadingOverlay');
  const progressText = document.getElementById('pdfProgress');
  
  button.disabled = true;
  overlay.classList.add('active');
  
  // 削除した要素を保存するための配列
  const removedElements = [];
  
  try {
    // 1. 編集用UI要素を非表示
    const editElements = document.querySelectorAll('.add-image-button, .remove-upload-area, .remove-image, .cta-step-checkbox, .pdf-button');
    editElements.forEach(el => el.style.display = 'none');
    
    // 2. 空の画像アップロードエリアを完全に削除（DOMから削除）
    const emptyUploadAreas = document.querySelectorAll('.image-upload-area');
    emptyUploadAreas.forEach(area => {
      // 親要素とインデックスを保存
      const parent = area.parentElement;
      const nextSibling = area.nextSibling;
      removedElements.push({
        element: area,
        parent: parent,
        nextSibling: nextSibling
      });
      // DOMから削除
      area.remove();
    });
    
    // 3. 画像がない images-container 全体を一時削除
    const imageContainers = document.querySelectorAll('.images-container');
    imageContainers.forEach(container => {
      // コンテナ内に .uploaded-image があるかチェック
      const hasImages = container.querySelector('.uploaded-image');
      if (!hasImages) {
        const parent = container.parentElement;
        const nextSibling = container.nextSibling;
        removedElements.push({
          element: container,
          parent: parent,
          nextSibling: nextSibling
        });
        container.remove();
      }
    });
    
    // 4. キャプション入力を非表示、テキストを表示
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
    
    // 5. html2canvasでキャプチャ
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
    // 6. 削除した要素を元に戻す
    removedElements.forEach(item => {
      if (item.nextSibling) {
        item.parent.insertBefore(item.element, item.nextSibling);
      } else {
        item.parent.appendChild(item.element);
      }
    });
    
    // 7. 編集用UI要素を再表示
    const editElements = document.querySelectorAll('.add-image-button, .remove-upload-area, .remove-image, .cta-step-checkbox, .pdf-button');
    editElements.forEach(el => el.style.display = '');
    
    // 8. キャプション入力を再表示
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

顧客情報:
- 顧客名: ${formData.customerName}

会社情報（提案元）:
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

【重要】ページ構成と画像挿入位置:

1. ページ1（表紙）:
   - グラデーション背景
   - **最上部に顧客名を右寄せで表示（「${formData.customerName} 御中」形式、font-size: 20px, margin-bottom: 60px、position: absolute, top: 40px, right: 60px）**
   - 会社ロゴ（中央）
   - 提案タイトル（中央）
   - サブタイトル（中央）
   - 日付（中央下部）
   - **ページの最後に画像コンテナ配置（data-page="cover"）**
   - ページフッターなし

2. ページ2（目次）:
   - セクションタイトル「目次」
   - 7つの項目を円形番号バッジで表示（固定7項目）
   - **ページの最後に画像コンテナ配置（data-page="table-of-contents"）**
   - ページフッター（会社名、ページ番号2）

3. ページ3（現状の課題）:
   - セクションタイトル「現状の課題」
   - 導入文
   - **課題リスト（提供された課題の数だけ表示、赤い左ボーダー、グレー背景）**
   - まとめ文（ハイライト付き）
   - **ページの最後に画像コンテナ配置（data-page="current-issues"）**
   - ページフッター（会社名、ページ番号3）

4. ページ4（ソリューション概要）:
   - セクションタイトル「ソリューション概要」
   - サブタイトルと説明文
   - **ソリューションカード（提供されたソリューションの数に応じてグリッド配置、グラデーション背景）**
   - **グリッド列数は提供数に応じて最適化（1-2個→1列、3-6個→2列、7個以上→3列）**
   - **ページの最後に画像コンテナ配置（data-page="solution-overview"）**
   - ページフッター（会社名、ページ番号4）

5. ページ5（システム構成図）:
   - セクションタイトル「システム構成図」
   - システム図（提供された構成に基づいて適切にレイヤー表示）
   - サブタイトル「主な技術スタック」
   - **技術スタックリスト（提供された技術の数に応じてグリッド配置）**
   - **グリッド列数は提供数に応じて最適化（1-2個→1列、3個以上→2列）**
   - **ページの最後に画像コンテナ配置（data-page="system-architecture"）**
   - ページフッター（会社名、ページ番号5）

6. ページ6（期待される導入効果）:
   - セクションタイトル「期待される導入効果」
   - **効果カード（提供された効果の数に応じてグリッド配置、青グラデーション）**
   - **グリッド列数は提供数に応じて最適化（3個の場合のみ3列、それ以外は1-2個→1列、4-6個→2列、7個以上→3列）**
   - 中央揃えの改善メッセージ
   - サブタイトル「その他の効果」
   - **チェックマーク付きメリットリスト（提供されたメリットの数だけ表示）**
   - **ページの最後に画像コンテナ配置（data-page="expected-effects"）**
   - ページフッター（会社名、ページ番号6）

7. ページ7（導入スケジュール）:
   - セクションタイトル「導入スケジュール」
   - **タイムライン（提供されたスケジュールの数だけフェーズ表示、左に縦線と円形バッジ）**
   - 黄色背景のスケジュール概要ボックス
   - **ページの最後に画像コンテナ配置（data-page="implementation-schedule"）**
   - ページフッター（会社名、ページ番号7）

8. ページ8（導入費用）:
   - セクションタイトル「導入費用」
   - 2列グリッドの費用カード（初期費用、月額費用）※この2列は固定
   - サブタイトル「別途必要な費用」
   - **追加費用リスト（提供された追加費用の数だけ表示）**
   - 黄色背景の注意事項ボックス
   - **ページの最後に画像コンテナ配置（data-page="pricing"）**
   - ページフッター（会社名、ページ番号8）

9. ページ9（まとめ・お問い合わせ）:
   - セクションタイトル「まとめ」
   - まとめ文（ハイライト付き）
   - **まとめポイント（提供されたポイントの数だけ表示、アイコン付き）**
   - グラデーション背景の次のステップセクション（3ステップ、チェックボックス付き）※3ステップ固定
   - 白背景のお問い合わせセクション（2列グリッド）
   - **ページの最後に画像コンテナ配置（data-page="summary-contact"）**
   - ページフッター（会社名、ページ番号9）

【数の柔軟性に関する重要指示】:
- 課題、ソリューション、効果、技術スタック、スケジュール、追加費用、まとめポイントは、提供されたデータの数だけ表示すること
- グリッドレイアウトは、アイテム数に応じて自動的に最適な列数を選択すること
- データが1個でも10個でも、適切にレイアウトされるようCSSを設計すること
- ページの見た目のバランスを保つため、アイテムが少ない場合は余白を適切に取ること

出力要件:
1. 完全なHTML（DOCTYPE宣言からhtmlタグ閉じまで）
2. デザインシステムで定義されたスタイルを完全に再現
3. **各ページの最後、ページフッターの直前に必ず画像コンテナを配置**
4. 画像アップロード機能とPDF生成機能を実装
5. 9ページ構成を厳守
6. 現在の日付を自動表示（JavaScript使用）
7. すべてのCSSとJavaScriptをインライン実装
8. 提供された情報を適切に各ページに配置
9. **提供されたデータの数に応じて柔軟にレイアウトを調整**

実行可能なHTMLコードのみを出力してください。説明文は不要です。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
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
