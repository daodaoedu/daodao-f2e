/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { getScriptUrl } = require('./get-script-url');

const fetchGoogleSheet = async () => {
  const scriptUrl = getScriptUrl();
  try {
    const response = await fetch(scriptUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    process.stderr.write(`獲取翻譯數據失敗: ${error.message}\n`);
    process.exit(1);
    return null;
  }
};

const main = async () => {
  try {
    process.stdout.write('正在從 Google App Script 獲取翻譯數據...\n');

    const json = await fetchGoogleSheet();

    const locales = Object.keys(json);
    const outputDir = path.join(process.cwd(), 'shared/config/locales');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    locales.forEach((locale) => {
      const outputPath = path.join(outputDir, `${locale}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(json[locale], null, 2));
      process.stdout.write(`已更新 ${locale} 翻譯文件\n`);
    });

    process.stdout.write('翻譯數據更新完成!\n');
  } catch (error) {
    process.stderr.write(`錯誤: ${error.message}\n`);
    process.exit(1);
  }
};

main();
