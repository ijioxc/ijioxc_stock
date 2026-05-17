const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, color: "1A3C5E" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, color: "2E6DA4" })]
  });
}

function p(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function tableRow(label, value, shade) {
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 3000, type: WidthType.DXA },
        shading: { fill: shade || "EBF3FB", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })]
      }),
      new TableCell({
        borders, width: { size: 6360, type: WidthType.DXA },
        shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })]
      })
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "美股台股監控平台 需求規格文件　第 ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
            new TextRun({ text: " 頁", size: 18, color: "888888" })
          ]
        })]
      })
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 120 },
        children: [new TextRun({ text: "美股 × 台股監控交易平台", bold: true, size: 48, color: "1A3C5E" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "網站開發需求規格文件", size: 28, color: "2E6DA4" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [new TextRun({ text: "版本 v1.0　｜　2026年5月", size: 20, color: "888888" })]
      }),

      // 1. 專案概述
      h1("1. 專案概述"),
      p("本平台目標是提供一個即時監控美股前50大與台股前50大企業的交易分析工具，以布林通道（Bollinger Bands）作為核心指標，搭配15分K線圖，協助使用者掌握即時支撐壓力區間及交易訊號。"),

      // 2. 核心功能需求
      h1("2. 核心功能需求"),

      h2("2.1 K線圖與布林通道"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableRow("K線週期", "15分K（15-minute candlestick）"),
          tableRow("核心指標", "布林通道（Bollinger Bands）", "F0F7FF"),
          tableRow("支撐壓力", "布林下軌 = 支撐線；布林上軌 = 壓力線，直接繪製於圖上"),
          tableRow("布林參數", "可調整：MA週期（預設20）、標準差倍數（預設±2）", "F0F7FF"),
          tableRow("標線方式", "直接在K線圖上繪製支撐線與壓力線（圖形呈現）"),
        ]
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h2("2.2 股票資料涵蓋範圍"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableRow("美股", "前50大企業（依市值排序）"),
          tableRow("台股", "前50大企業（依市值排序）", "F0F7FF"),
          tableRow("分類方式", "依供應鏈關係分頁，例：Apple 頁面含鴻海、大立光、台積電等台灣供應商"),
        ]
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h2("2.3 瀏覽介面設計"),
      bullet("第一層（總覽）：儀表板同時顯示多支股票小圖，每行3～4支"),
      bullet("第二層（詳細）：點擊小圖後進入單支股票大圖頁面，顯示完整布林通道與K線"),
      bullet("供應鏈頁面：美股主企業 + 相關台股供應商，整合於同一頁面瀏覽"),

      new Paragraph({ spacing: { after: 80 }, children: [] }),

      h2("2.4 即時資料更新"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableRow("更新頻率", "盤中每分鐘自動更新（美股開盤時間，台灣時間 22:30～05:00）"),
          tableRow("資料來源", "需串接即時報價API（建議：Polygon.io / Alpha Vantage / Yahoo Finance）", "F0F7FF"),
        ]
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h2("2.5 即時交易訊號"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableRow("訊號邏輯", "股價觸碰布林下軌 → 買入訊號；觸碰布林上軌 → 賣出訊號"),
          tableRow("視覺標示", "總覽頁以顏色標示：綠色 = 買入區間、紅色 = 賣出區間", "F0F7FF"),
          tableRow("推播通知", "觸發條件時發送瀏覽器推播通知（Web Push Notification）"),
          tableRow("通知條件", "可設定監控的股票清單，僅對已選股票發送通知", "F0F7FF"),
        ]
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      // 3. 使用者與帳號
      h1("3. 使用者系統"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          tableRow("v1.0 階段", "無需登入，直接使用（少數人共用，無帳號區隔）"),
          tableRow("後期規劃", "預留登入機制擴充空間，未來可升級為會員系統（JWT / OAuth）", "F0F7FF"),
        ]
      }),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      // 4. 技術建議
      h1("4. 技術建議（供開發參考）"),

      h2("4.1 前端"),
      bullet("框架：React.js 或 Vue.js"),
      bullet("圖表套件：TradingView Lightweight Charts 或 ApexCharts（支援K線+布林通道）"),
      bullet("即時更新：WebSocket 或 setInterval polling（每60秒）"),
      bullet("推播：Web Push API + Service Worker"),

      new Paragraph({ spacing: { after: 80 }, children: [] }),

      h2("4.2 後端"),
      bullet("語言：Node.js / Python（FastAPI）"),
      bullet("資料API：Polygon.io（推薦，支援15分K即時資料）"),
      bullet("快取：Redis（減少API呼叫次數，降低費用）"),
      bullet("布林通道計算：後端計算後推送至前端，或前端本地計算"),

      new Paragraph({ spacing: { after: 80 }, children: [] }),

      h2("4.3 部署"),
      bullet("前端：Vercel / Netlify"),
      bullet("後端：Railway / Render / AWS EC2"),
      bullet("資料庫：PostgreSQL（儲存歷史K線）或純API實時拉取"),

      new Paragraph({ spacing: { after: 160 }, children: [] }),

      // 5. 開發優先順序
      h1("5. 開發優先順序（建議）"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 2400, 5760],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "1A3C5E", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "階段", bold: true, size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "1A3C5E", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "功能", bold: true, size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "1A3C5E", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "說明", bold: true, size: 20, color: "FFFFFF" })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "EBF3FB", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 1", bold: true, size: 20, color: "1A3C5E" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "K線圖 + 布林通道", size: 20 })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "單支股票15分K，含布林上下軌繪製", size: 20 })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "EBF3FB", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 2", bold: true, size: 20, color: "1A3C5E" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "總覽儀表板", size: 20 })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "美股50支小圖總覽，點擊進入詳細頁", size: 20 })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "EBF3FB", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 3", bold: true, size: 20, color: "1A3C5E" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "台股 + 供應鏈整合", size: 20 })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "加入台股50支，依供應鏈分頁顯示", size: 20 })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "EBF3FB", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 4", bold: true, size: 20, color: "1A3C5E" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "訊號通知", size: 20 })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "顏色標示 + 瀏覽器推播通知", size: 20 })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: "EBF3FB", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 5", bold: true, size: 20, color: "1A3C5E" })] })] }),
            new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "帳號系統（後期）", size: 20 })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "登入機制、個人化設定、通知偏好儲存", size: 20 })] })] }),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { after: 200 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "文件編製日期：2026年5月4日", size: 18, color: "AAAAAA" })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/美股台股監控平台_需求文件.docx', buffer);
  console.log('Done');
});
