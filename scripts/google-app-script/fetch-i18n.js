/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line consistent-return
const getScriptUrl = () => {
  const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
  if (urlArg) {
    return urlArg.split('=')[1];
  }

  if (process.env.NEXT_I18N_URL) {
    return process.env.NEXT_I18N_URL;
  }

  process.stderr.write('錯誤: 請提供 Google App Script URL\n');
  process.stderr.write('用法: npm run i18n:fetch -- --url=YOUR_SCRIPT_URL\n');
  process.stderr.write('或設置環境變數 NEXT_I18N_URL\n');
  process.exit(1);
};

const scriptUrl = getScriptUrl();
process.stdout.write('正在從 Google App Script 獲取翻譯數據...\n');

fetch(scriptUrl, { method: 'POST' })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((json) => {
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
  })
  .catch((error) => {
    process.stderr.write(`獲取翻譯數據失敗: ${error.message}\n`);
    process.exit(1);
  });
