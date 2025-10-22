// api/generate.js - 編集可能な提案書HTML生成

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;
  
  if (!data) {
    return res.status(400).json({ error: 'データがありません' });
  }

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 編集可能な提案書HTML生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.companyInfo.name}様向け提案書</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .proposal-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page {
      background: white;
      width: 100%;
      min-height: 297mm;
      padding: 60px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      position: relative;
      page-break-after: always;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .page {
        box-shadow: none;
        border-radius: 0;
        margin-bottom: 0;
      }
      .no-print {
        display: none !important;
      }
      [contenteditable] {
        border: none !important;
        background: none !important;
      }
    }
    
    /* 編集可能要素のスタイル */
    [contenteditable="true"] {
      outline: 2px dashed transparent;
      padding: 2px 5px;
      border-radius: 4px;
      transition: all 0.3s;
      cursor: text;
    }
    
    [contenteditable="true"]:hover {
      outline: 2px dashed #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
    
    [contenteditable="true"]:focus {
      outline: 2px solid #667eea;
      background: rgba(102, 126, 234, 0.1);
    }
    
    /* PDF生成ボタン */
    .pdf-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 50px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
      z-index: 1000;
      transition: all 0.3s;
    }
    
    .pdf-button:hover {
      background: #764ba2;
      transform: translateY(-2px);
      box-shadow: 0 7px 20px rgba(102, 126, 234, 0.4);
    }
    
    /* 表紙 */
    .cover-page {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .cover-page::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      top: -250px;
      right: -250px;
    }
    
    .company-logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 80px;
      letter-spacing: 2px;
      z-index: 1;
    }
    
    .proposal-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 30px;
      z-index: 1;
    }
    
    .proposal-subtitle {
      font-size: 20px;
      margin-bottom: 100px;
      opacity: 0.9;
      z-index: 1;
    }
    
    .proposal-date {
      position: absolute;
      bottom: 60px;
      font-size: 18px;
      z-index: 1;
    }
    
    /* 目次 */
    .toc-title {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 40px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
    }
    
    .toc-item {
      font-size: 18px;
      padding: 15px 0;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
    }
    
    .toc-number {
      color: #667eea;
      font-weight: bold;
    }
    
    /* 課題セクション */
    .section-title {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 40px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
    }
    
    .problems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .problem-card {
      background: linear-gradient(135deg, #ff6b6b15, #ff6b6b05);
      border-left: 5px solid #ff6b6b;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
    
    .problem-icon {
      font-size: 36px;
      margin-bottom: 10px;
    }
    
    .problem-title {
      font-size: 18px;
      font-weight: bold;
      color: #ff6b6b;
      margin-bottom: 15px;
    }
    
    .problem-details {
      list-style-position: inside;
      color: #666;
      line-height: 1.8;
    }
    
    /* ソリューションセクション */
    .solutions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }
    
    .solution-card {
      background: linear-gradient(135deg, #667eea10, #764ba210);
      border: 2px solid #667eea;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      transition: all 0.3s;
    }
    
    .solution-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    }
    
    .solution-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    .solution-name {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10px;
    }
    
    .solution-description {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    .solution-tools {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .tool-tag {
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
    }
    
    /* システム構成図 */
    .architecture-diagram {
      background: #f8f9fa;
      padding: 40px;
      border-radius: 10px;
      margin: 30px 0;
      text-align: center;
    }
    
    .architecture-title {
      font-size: 24px;
      color: #667eea;
      margin-bottom: 30px;
    }
    
    /* 画像アップロードエリア */
    .image-upload-area {
      border: 3px dashed #667eea;
      padding: 40px;
      text-align: center;
      margin: 30px 0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      background: rgba(102, 126, 234, 0.05);
    }
    
    .image-upload-area:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    .uploaded-image {
      max-width: 100%;
      margin: 20px auto;
      display: block;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    /* 導入効果 */
    .effects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    
    .effect-card {
      background: linear-gradient(135deg, #48c77415, #48c77405);
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      border: 2px solid #48c774;
    }
    
    .effect-value {
      font-size: 36px;
      font-weight: bold;
      color: #48c774;
      margin-bottom: 10px;
    }
    
    .effect-label {
      color: #666;
      font-size: 14px;
    }
    
    /* スケジュール */
    .schedule-timeline {
      position: relative;
      padding: 20px 0;
    }
    
    .timeline-item {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
    }
    
    .timeline-marker {
      width: 40px;
      height: 40px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 30px;
    }
    
    .timeline-content {
      flex: 1;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
    }
    
    .timeline-title {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    /* 費用 */
    .cost-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 40px 0;
    }
    
    .cost-card {
      background: linear-gradient(135deg, #667eea10, #764ba210);
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      border: 2px solid #667eea;
    }
    
    .cost-label {
      font-size: 18px;
      color: #667eea;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .cost-value {
      font-size: 36px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .cost-note {
      font-size: 14px;
      color: #666;
    }
    
    /* お問い合わせ */
    .contact-section {
      background: linear-gradient(135deg, #667eea10, #764ba210);
      padding: 40px;
      border-radius: 15px;
      margin-top: 40px;
    }
    
    .contact-title {
      font-size: 24px;
      color: #667eea;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .contact-item {
      text-align: center;
    }
    
    .contact-label {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    .page-footer {
      position: absolute;
      bottom: 30px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <button class="pdf-button no-print" onclick="generatePDF()">📥 PDF保存</button>
  
  <div class="proposal-container" id="proposal">
    
    <!-- ページ1: 表紙 -->
    <div class="page cover-page">
      <div class="company-logo" contenteditable="true">株式会社ままよろ</div>
      <div class="proposal-title" contenteditable="true">${data.proposal.title}</div>
      <div class="proposal-subtitle" contenteditable="true">${data.proposal.subtitle}</div>
      <div class="proposal-company" style="font-size: 36px; margin-bottom: 40px;" contenteditable="true">${data.companyInfo.name}様</div>
      <div class="proposal-date">${today}</div>
    </div>
    
    <!-- ページ2: 目次 -->
    <div class="page">
      <h2 class="toc-title">目次</h2>
      <div class="toc-item">
        <span>現状の課題</span>
        <span class="toc-number">03</span>
      </div>
      <div class="toc-item">
        <span>ソリューション概要</span>
        <span class="toc-number">04</span>
      </div>
      <div class="toc-item">
        <span>システム構成図</span>
        <span class="toc-number">05</span>
      </div>
      <div class="toc-item">
        <span>期待される導入効果</span>
        <span class="toc-number">06</span>
      </div>
      <div class="toc-item">
        <span>導入スケジュール</span>
        <span class="toc-number">07</span>
      </div>
      <div class="toc-item">
        <span>導入費用</span>
        <span class="toc-number">08</span>
      </div>
      <div class="toc-item">
        <span>お問い合わせ</span>
        <span class="toc-number">09</span>
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>2</span>
      </div>
    </div>
    
    <!-- ページ3: 現状の課題 -->
    <div class="page">
      <h2 class="section-title">現状の課題</h2>
      <div class="problems-grid">
        ${data.problems.map(problem => `
          <div class="problem-card">
            <div class="problem-icon">${problem.icon}</div>
            <div class="problem-title" contenteditable="true">${problem.title}</div>
            <ul class="problem-details">
              ${problem.details.map(detail => `
                <li contenteditable="true">${detail}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <div class="image-upload-area no-print" onclick="this.querySelector('input').click()">
        <div style="font-size: 48px; margin-bottom: 10px;">📸</div>
        <div>画像を追加（クリックまたはドラッグ&ドロップ）</div>
        <input type="file" accept="image/*" style="display: none;" onchange="handleImageUpload(event, this.parentElement)">
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>3</span>
      </div>
    </div>
    
    <!-- ページ4: ソリューション概要 -->
    <div class="page">
      <h2 class="section-title">ソリューション概要</h2>
      <div class="solutions-grid">
        ${data.solutions.map(solution => `
          <div class="solution-card">
            <div class="solution-icon">${solution.icon}</div>
            <div class="solution-name" contenteditable="true">${solution.name}</div>
            <div class="solution-description" contenteditable="true">${solution.description}</div>
            <div class="solution-tools">
              ${solution.tools.map(tool => `
                <span class="tool-tag">${tool}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>4</span>
      </div>
    </div>
    
    <!-- ページ5: システム構成図 -->
    <div class="page">
      <h2 class="section-title">システム構成図</h2>
      <div class="architecture-diagram">
        <div class="architecture-title">kintoneを中心とした統合システム</div>
        <div contenteditable="true" style="margin: 20px 0;">
          <p><strong>コアシステム:</strong> ${data.systemArchitecture.core}</p>
          <p><strong>構築アプリ:</strong> ${data.systemArchitecture.apps.join('、')}</p>
          <p><strong>外部連携:</strong> ${data.systemArchitecture.integrations.join('、')}</p>
          <p><strong>AI機能:</strong> ${data.systemArchitecture.aiComponents.join('、')}</p>
        </div>
      </div>
      <div class="image-upload-area no-print" onclick="this.querySelector('input').click()">
        <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
        <div>システム構成図を追加</div>
        <input type="file" accept="image/*" style="display: none;" onchange="handleImageUpload(event, this.parentElement)">
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>5</span>
      </div>
    </div>
    
    <!-- ページ6: 期待される導入効果 -->
    <div class="page">
      <h2 class="section-title">期待される導入効果</h2>
      <div class="effects-grid">
        ${data.effects.quantitative.map(effect => `
          <div class="effect-card">
            <div class="effect-value" contenteditable="true">${effect.improvement}</div>
            <div class="effect-label" contenteditable="true">${effect.label}</div>
            <div style="color: #999; font-size: 12px; margin-top: 10px;">
              ${effect.before} → ${effect.after}
            </div>
          </div>
        `).join('')}
      </div>
      <h3 style="color: #667eea; margin: 40px 0 20px;">定性効果</h3>
      <ul style="line-height: 2; font-size: 18px; color: #333;">
        ${data.effects.qualitative.map(effect => `
          <li contenteditable="true">✅ ${effect}</li>
        `).join('')}
      </ul>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>6</span>
      </div>
    </div>
    
    <!-- ページ7: 導入スケジュール -->
    <div class="page">
      <h2 class="section-title">導入スケジュール</h2>
      <p style="margin-bottom: 30px; color: #666;">
        全体期間: <span contenteditable="true" style="font-weight: bold; color: #667eea;">${data.schedule.totalWeeks}週間</span>
      </p>
      <div class="schedule-timeline">
        ${data.schedule.phases.map((phase, index) => `
          <div class="timeline-item">
            <div class="timeline-marker">${index + 1}</div>
            <div class="timeline-content">
              <div class="timeline-title" contenteditable="true">${phase.name}（${phase.weeks}週間）</div>
              <div contenteditable="true" style="color: #666;">${phase.description}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>7</span>
      </div>
    </div>
    
    <!-- ページ8: 導入費用 -->
    <div class="page">
      <h2 class="section-title">導入費用</h2>
      <div class="cost-cards">
        <div class="cost-card">
          <div class="cost-label">初期費用</div>
          <div class="cost-value" contenteditable="true">¥${data.cost.initial.toLocaleString()}</div>
          <div class="cost-note" contenteditable="true">${data.cost.initialDetails}</div>
          <div class="cost-note" style="margin-top: 10px; color: #48c774; font-weight: bold;">
            ${data.cost.subsidy}
          </div>
        </div>
        <div class="cost-card">
          <div class="cost-label">月額費用</div>
          <div class="cost-value" contenteditable="true">¥${data.cost.monthly.toLocaleString()}〜</div>
          <div class="cost-note" contenteditable="true">${data.cost.monthlyDetails}</div>
          <div class="cost-note" style="margin-top: 10px;">
            ※構築後3ヶ月間無料
          </div>
        </div>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 30px;">
        <h3 style="color: #667eea; margin-bottom: 15px;">ROI（投資対効果）</h3>
        <p contenteditable="true" style="font-size: 18px; color: #333;">${data.cost.roi}</p>
      </div>
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>8</span>
      </div>
    </div>
    
    <!-- ページ9: お問い合わせ -->
    <div class="page">
      <h2 class="section-title">次のステップ</h2>
      <div style="margin-bottom: 40px;">
        ${data.nextActions.map((action, index) => `
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 40px; height: 40px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-weight: bold;">
              ${index + 1}
            </div>
            <div contenteditable="true" style="font-size: 18px;">${action}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="contact-section">
        <div class="contact-title">お問い合わせ・ご相談窓口</div>
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-label">会社名</div>
            <div contenteditable="true">株式会社ままよろ</div>
          </div>
          <div class="contact-item">
            <div class="contact-label">担当</div>
            <div contenteditable="true">営業部</div>
          </div>
          <div class="contact-item">
            <div class="contact-label">メール</div>
            <div contenteditable="true">contact@mamayoro.com</div>
          </div>
          <div class="contact-item">
            <div class="contact-label">電話</div>
            <div contenteditable="true">000-0000-0000</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; color: #666;">
        ご不明な点がございましたら、お気軽にお問い合わせください
      </div>
      
      <div class="page-footer">
        <span contenteditable="true">株式会社ままよろ</span>
        <span>9</span>
      </div>
    </div>
    
  </div>
  
  <script>
    // 画像アップロード処理
    function handleImageUpload(event, container) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'uploaded-image';
          container.style.display = 'none';
          container.parentElement.insertBefore(img, container.nextSibling);
        };
        reader.readAsDataURL(file);
      }
    }
    
    // PDF生成処理
    async function generatePDF() {
      const button = document.querySelector('.pdf-button');
      button.textContent = '⏳ PDF生成中...';
      button.disabled = true;
      
      // 編集枠を一時的に非表示
      const editables = document.querySelectorAll('[contenteditable]');
      editables.forEach(el => {
        el.style.outline = 'none';
        el.style.background = 'none';
      });
      
      // no-print要素を非表示
      const noPrintElements = document.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.style.display = 'none');
      
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pages = document.querySelectorAll('.page');
        
        for (let i = 0; i < pages.length; i++) {
          const canvas = await html2canvas(pages[i], {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          if (i > 0) pdf.addPage();
          
          // A4サイズに合わせて画像を配置
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        }
        
        // ファイル名を生成
        const today = new Date();
        const filename = \`proposal_\${today.getFullYear()}\${String(today.getMonth()+1).padStart(2,'0')}\${String(today.getDate()).padStart(2,'0')}.pdf\`;
        
        pdf.save(filename);
        
      } finally {
        // UI要素を復元
        button.textContent = '📥 PDF保存';
        button.disabled = false;
        noPrintElements.forEach(el => el.style.display = '');
      }
    }
  </script>
</body>
</html>`;

  res.status(200).json({ html });
}
