/* =========================================================
   簡報內容資料
   - 改負責人：修改 chapters 裡的 owner（該單元所有頁面一起更新）
     單頁要換人時，可在該頁另外加 owner: "姓名"
   - 改頁面：修改 slides 陣列，type 可用：
     cover / chapter / stats / statement / compare / timeline / qa / closing / end
   - ch：所屬單元（對應 chapters 的索引，從 0 開始）
   ========================================================= */

window.DECK = {
  title: "RE:LOCATE",
  subtitle: "從關稅危機到越南新局",

  chapters: [
    { no: "01", en: "BACKGROUND",    zh: "背景與目的",     owner: "車治德／蘇沁榆" },
    { no: "02", en: "SCOPE",         zh: "專案範疇",       owner: "車治德／蘇沁榆" },
    { no: "03", en: "SCHEDULE",      zh: "時程規劃",       owner: "陳胤瑾" },
    { no: "04", en: "COST",          zh: "成本規劃",       owner: "蔡寶瑩" },
    { no: "05", en: "STAKEHOLDERS",  zh: "利害關係人",     owner: "莊文宜" },
    { no: "06", en: "RESOURCES",     zh: "資源管理計畫書", owner: "張哲瑋" },
    { no: "07", en: "RISK",          zh: "風險管理計畫書", owner: "張鈞雅" },
    { no: "08", en: "QUALITY",       zh: "品質管理計畫書", owner: "詹淳皓" },
    { no: "09", en: "COMMUNICATION", zh: "溝通管理計畫書", owner: "廖書蔓" },
    { no: "10", en: "PROCUREMENT",   zh: "採購管理計畫書", owner: "梁家豪" }
  ],

  slides: [
    /* 01 */ { type: "cover" },

    /* 02 */ { type: "chapter",   ch: 0, lead: "美國關稅政策衝擊下，評估將生產基地遷往越南的背景與專案目的。" },
    /* 03 */ { type: "stats",     ch: 0, en: "PURPOSE",         title: "關稅衝擊與專案目的", ghost: "TARIFF" },

    /* 04 */ { type: "statement", ch: 1, en: "PROJECT SCOPE",   title: "專案範疇與交付項目", ghost: "SCOPE" },

    /* 05 */ { type: "chapter",   ch: 2, lead: "從評估、選址、建廠到量產的里程碑與時程安排。" },
    /* 06 */ { type: "timeline",  ch: 2, en: "MILESTONES",      title: "專案里程碑與時程",   ghost: "PLAN" },

    /* 07 */ { type: "chapter",   ch: 3, lead: "估算遷廠所需的建置、營運與人事成本，並編列預算。" },
    /* 08 */ { type: "stats",     ch: 3, en: "BUDGET",          title: "成本估算與預算",     ghost: "COST" },

    /* 09 */ { type: "chapter",   ch: 4, lead: "辨識專案內外部利害關係人，分析其影響力與期望。" },
    /* 10 */ { type: "compare",   ch: 4, en: "STAKEHOLDER MAP", title: "利害關係人分析",     ghost: "PEOPLE" },

    /* 11 */ { type: "chapter",   ch: 5, lead: "規劃人力、設備與物料等資源的取得與配置。" },
    /* 12 */ { type: "stats",     ch: 5, en: "ALLOCATION",      title: "人力與設備配置",     ghost: "RESOURCE" },

    /* 13 */ { type: "chapter",   ch: 6, lead: "辨識遷廠過程中的主要風險，評估影響並提出因應對策。" },
    /* 14 */ { type: "qa",        ch: 6, en: "RISK RESPONSE",   title: "風險辨識與因應",     ghost: "RISK" },

    /* 15 */ { type: "chapter",   ch: 7, lead: "訂定產品與流程的品質標準，確保遷廠後品質一致。" },
    /* 16 */ { type: "compare",   ch: 7, en: "QC STANDARDS",    title: "品質標準與管控",     ghost: "QUALITY" },

    /* 17 */ { type: "chapter",   ch: 8, lead: "規劃台灣、越南與客戶之間的溝通管道、頻率與權責。" },
    /* 18 */ { type: "statement", ch: 8, en: "CHANNELS",        title: "溝通管道與頻率",     ghost: "TALK" },

    /* 19 */ { type: "chapter",   ch: 9, lead: "建立在地供應商評選與採購流程，穩定供應鏈。" },
    /* 20 */ { type: "compare",   ch: 9, en: "SOURCING",        title: "供應商與採購策略",   ghost: "VIETNAM" }
  ]
};
