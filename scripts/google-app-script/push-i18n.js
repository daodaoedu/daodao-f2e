/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { getScriptUrl } = require('./get-script-url');

const getLocalesPath = () => {
  const pathArg = process.argv.find((arg) => arg.startsWith('--path='));
  if (pathArg) {
    return pathArg.split('=')[1];
  }

  return path.join(process.cwd(), 'shared/config/locales');
};

/**
 * 檢查是否有 --yes 或 -y 參數來跳過確認
 * @returns {boolean} 是否跳過確認
 */
const shouldSkipConfirmation = () => {
  return process.argv.includes('--yes') || process.argv.includes('-y');
};

/**
 * 顯示推送摘要並等待用戶確認
 * @param {Object} i18nData - i18n 數據
 * @param {string} scriptUrl - Google App Script URL
 * @returns {Promise<boolean>} 用戶是否確認推送
 */
const confirmPush = async (i18nData, scriptUrl) => {
  const locales = Object.keys(i18nData);
  const allSheetNames = new Set();

  // 收集所有工作表名稱和統計信息
  Object.values(i18nData).forEach((localeData) => {
    if (localeData && typeof localeData === 'object') {
      Object.keys(localeData).forEach((sheetName) => {
        allSheetNames.add(sheetName);
      });
    }
  });

  // 顯示推送摘要
  process.stdout.write('\n=== 推送摘要 ===\n');
  process.stdout.write(`目標 URL: ${scriptUrl}\n`);
  process.stdout.write(`語言數量: ${locales.length} (${locales.join(', ')})\n`);
  process.stdout.write(`工作表數量: ${allSheetNames.size}\n`);
  process.stdout.write(`工作表名稱: ${Array.from(allSheetNames).join(', ')}\n`);

  // 計算總 key 數量
  let totalKeys = 0;
  Array.from(allSheetNames).forEach((sheetName) => {
    const keys = new Set();
    locales.forEach((locale) => {
      if (i18nData[locale] && i18nData[locale][sheetName]) {
        Object.keys(i18nData[locale][sheetName]).forEach((key) =>
          keys.add(key)
        );
      }
    });
    totalKeys += keys.size;
  });

  process.stdout.write(`總翻譯條目: ${totalKeys}\n`);
  process.stdout.write(
    '\n⚠️  警告: 此操作將會覆蓋 Google Sheets 中的現有數據！\n\n'
  );

  // 創建 readline 介面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('確定要推送數據到 Google Sheets 嗎？ (y/N): ', (answer) => {
      rl.close();
      const confirmed =
        answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
      resolve(confirmed);
    });
  });
};

/**
 * 讀取本地 i18n JSON 文件
 * @param {string} localesPath - 語言文件目錄路徑
 * @returns {Object} 合併後的 i18n 數據
 */
const readLocalI18nFiles = (localesPath) => {
  if (!fs.existsSync(localesPath)) {
    throw new Error(`語言文件目錄不存在: ${localesPath}`);
  }

  const files = fs
    .readdirSync(localesPath)
    .filter((file) => file.endsWith('.json'));

  if (files.length === 0) {
    throw new Error(`在 ${localesPath} 中找不到 JSON 文件`);
  }

  const i18nData = {};

  files.forEach((file) => {
    const locale = path.basename(file, '.json');
    const filePath = path.join(localesPath, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      i18nData[locale] = JSON.parse(content);
      process.stdout.write(`已讀取 ${locale} 語言文件\n`);
    } catch (error) {
      throw new Error(`讀取文件 ${file} 失敗: ${error.message}`);
    }
  });

  return i18nData;
};

/**
 * 驗證 i18n 數據結構
 * @param {Object} i18nData - i18n 數據
 */
const validateI18nData = (i18nData) => {
  const locales = Object.keys(i18nData);

  if (locales.length === 0) {
    throw new Error('沒有找到任何語言數據');
  }

  // 檢查所有語言是否有相同的工作表結構
  const firstLocale = locales[0];
  const sheets = Object.keys(i18nData[firstLocale]);

  locales.forEach((locale) => {
    const currentSheets = Object.keys(i18nData[locale]);
    const missingSheets = sheets.filter(
      (sheet) => !currentSheets.includes(sheet)
    );
    const extraSheets = currentSheets.filter(
      (sheet) => !sheets.includes(sheet)
    );

    if (missingSheets.length > 0) {
      process.stderr.write(
        `警告: 語言 ${locale} 缺少工作表: ${missingSheets.join(', ')}\n`
      );
    }

    if (extraSheets.length > 0) {
      process.stderr.write(
        `警告: 語言 ${locale} 有額外工作表: ${extraSheets.join(', ')}\n`
      );
    }
  });

  process.stdout.write(
    `驗證完成: 找到 ${locales.length} 種語言，${sheets.length} 個工作表\n`
  );
};

/**
 * 推送數據到 Google App Script
 * @param {string} scriptUrl - Google App Script URL
 * @param {Object} i18nData - i18n 數據
 */
const pushToGoogleSheets = async (scriptUrl, i18nData) => {
  try {
    process.stdout.write('正在推送數據到 Google Sheets...\n');

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(i18nData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    process.stdout.write('數據推送成功!\n');

    if (result.summary) {
      process.stdout.write(`處理摘要:\n`);
      Object.entries(result.summary).forEach(([sheet, count]) => {
        process.stdout.write(`  - ${sheet}: ${count} 筆資料\n`);
      });
    }
  } catch (error) {
    throw new Error(`推送數據失敗: ${error.message}`);
  }
};

// 主程序
const main = async () => {
  try {
    const scriptUrl = getScriptUrl();
    const localesPath = getLocalesPath();
    const skipConfirmation = shouldSkipConfirmation();

    process.stdout.write(`從 ${localesPath} 讀取語言文件...\n`);
    const i18nData = readLocalI18nFiles(localesPath);

    validateI18nData(i18nData);

    // 如果沒有 --yes 或 -y 參數，顯示確認對話框
    if (!skipConfirmation) {
      const confirmed = await confirmPush(i18nData, scriptUrl);

      if (!confirmed) {
        process.stdout.write('操作已取消。\n');
        process.exit(0);
      }

      process.stdout.write('\n');
    } else {
      process.stdout.write('跳過確認步驟 (使用了 --yes 或 -y 參數)\n');
    }

    await pushToGoogleSheets(scriptUrl, i18nData);

    process.stdout.write('i18n 數據推送完成!\n');
  } catch (error) {
    process.stderr.write(`錯誤: ${error.message}\n`);
    process.exit(1);
  }
};

main();
