/**
 * Google Sheets 轉 JSON - 多工作表版
 * 將 Google Sheets 中的多個工作表轉換為 JSON 格式
 */

// 設定您的 Google Sheets ID
const SPREADSHEET_ID = '*** YOUR SPREADSHEET ID ***';
const LOCALES = ['zh-TW', 'en'];

/**
 * 處理單一工作表的資料
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表物件
 * @param {Object} result - 結果物件
 */
function processSheet(sheet, result) {
  const sheetName = sheet.getName();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values?.[0] ?? [];

  if (headers[0] !== 'key') {
    console.warn(`工作表 "${sheetName}" 的欄位名稱不正確，跳過處理`);
    return;
  }

  const dataRows = values
    .slice(1)
    .filter(([key]) => key && key.toString().trim() !== '');

  // 為每個語言環境建立資料
  LOCALES.forEach((locale) => {
    // 找到對應語言的欄位索引
    const localeIndex = headers.indexOf(locale);

    if (localeIndex === -1) {
      console.warn(`在工作表 "${sheetName}" 中找不到語言 "${locale}" 的欄位`);
      return;
    }
    // 初始化結果結構
    if (!result[locale]) {
      result[locale] = {};
    }
    if (!result[locale][sheetName]) {
      result[locale][sheetName] = {};
    }
    dataRows.forEach((row) => {
      const [key] = row;
      result[locale][sheetName][key] = row[localeIndex].toString().trim();
    });
  });
}

/**
 * 將所有工作表轉換為 JSON
 * @returns {Object} JSON 格式的資料，以語言為第一層 key，工作表名稱為第二層 key
 * @throws {Error} 當無法存取試算表或處理資料時拋出錯誤
 */
function sheetsToJSON() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();

    if (sheets.length === 0) {
      throw new Error('試算表中沒有工作表');
    }

    const result = {};

    sheets.forEach((sheet) => {
      try {
        processSheet(sheet, result);
      } catch (sheetError) {
        console.error(
          `處理工作表 "${sheet.getName()}" 時發生錯誤:`,
          sheetError
        );
      }
    });

    return result;
  } catch (error) {
    console.error('轉換 Google Sheets 資料時發生錯誤:', error);
    throw new Error(`無法轉換 Google Sheets 資料: ${error.message}`);
  }
}

/**
 * Web App 端點 - 提供 HTTP API 存取
 *
 * @param {GoogleAppsScript.Events.DoGet} e - HTTP GET 請求事件對象
 * @returns {GoogleAppsScript.Content.TextOutput} JSON 格式的回應
 */
function doGet(e) {
  try {
    console.log('開始處理 Google Sheets 轉 JSON 請求');
    const data = sheetsToJSON();
    return ContentService.createTextOutput(
      JSON.stringify(data, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Google Sheets 轉 JSON 請求處理失敗:', error);

    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorData = {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return ContentService.createTextOutput(
      JSON.stringify(errorData, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
