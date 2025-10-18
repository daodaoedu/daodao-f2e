/**
 * Google Sheets i18n 雙向同步
 * GET: 將 Google Sheets 轉換為 JSON 格式
 * POST: 接收 JSON 數據並寫入 Google Sheets
 */

// 設定您的 Google Sheets ID
const SPREADSHEET_ID = '*** YOUR SPREADSHEET ID ***';
const LOCALES = ['zh-TW', 'en'];

// ==================== GET 請求相關函數 ====================

/**
 * 處理單一工作表的資料 (GET)
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 工作表物件
 * @param {Object} result - 結果物件
 */
function processSheetToJSON(sheet, result) {
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
        processSheetToJSON(sheet, result);
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

// ==================== POST 請求相關函數 ====================

/**
 * 將 JSON 數據轉換為工作表行數據 (POST)
 * @param {Object} i18nData - i18n JSON 數據
 * @param {string} sheetName - 工作表名稱
 * @returns {Array<Array>} 工作表行數據 [header, ...rows]
 */
function convertJSONToSheetData(i18nData, sheetName) {
  // 建立標題行
  const headers = ['key', ...LOCALES];
  
  // 收集所有 keys
  const allKeys = new Set();
  LOCALES.forEach(locale => {
    if (i18nData[locale] && i18nData[locale][sheetName]) {
      Object.keys(i18nData[locale][sheetName]).forEach(key => {
        allKeys.add(key);
      });
    }
  });
  
  // 轉換為行數據
  const rows = [headers];
  
  Array.from(allKeys).sort().forEach(key => {
    const row = [key];
    
    LOCALES.forEach(locale => {
      const value = i18nData[locale]?.[sheetName]?.[key] || '';
      row.push(value);
    });
    
    rows.push(row);
  });
  
  return rows;
}

/**
 * 更新或創建工作表 (POST)
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - 試算表物件
 * @param {string} sheetName - 工作表名稱
 * @param {Array<Array>} data - 要寫入的數據
 * @returns {number} 寫入的行數
 */
function updateOrCreateSheet(spreadsheet, sheetName, data) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // 如果工作表不存在，創建新的
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`創建新工作表: ${sheetName}`);
  } else {
    // 清空現有數據
    sheet.clear();
    console.log(`清空現有工作表: ${sheetName}`);
  }
  
  // 寫入數據
  if (data.length > 0) {
    const range = sheet.getRange(1, 1, data.length, data[0].length);
    range.setValues(data);
    
    // 設定標題行格式
    const headerRange = sheet.getRange(1, 1, 1, data[0].length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    
    // 自動調整欄寬
    sheet.autoResizeColumns(1, data[0].length);
  }
  
  return data.length - 1; // 減去標題行
}

/**
 * 驗證接收到的 JSON 數據 (POST)
 * @param {Object} i18nData - i18n JSON 數據
 * @throws {Error} 當數據格式不正確時拋出錯誤
 */
function validateJSONData(i18nData) {
  if (!i18nData || typeof i18nData !== 'object') {
    throw new Error('無效的 JSON 數據格式');
  }
  
  const receivedLocales = Object.keys(i18nData);
  if (receivedLocales.length === 0) {
    throw new Error('沒有找到任何語言數據');
  }
  
  // 檢查是否包含預期的語言
  const missingLocales = LOCALES.filter(locale => !receivedLocales.includes(locale));
  if (missingLocales.length > 0) {
    console.warn(`警告: 缺少以下語言數據: ${missingLocales.join(', ')}`);
  }
  
  // 檢查數據結構
  receivedLocales.forEach(locale => {
    if (!i18nData[locale] || typeof i18nData[locale] !== 'object') {
      throw new Error(`語言 ${locale} 的數據格式不正確`);
    }
  });
  
  console.log(`驗證通過: 接收到 ${receivedLocales.length} 種語言的數據`);
}

/**
 * 將 JSON 數據寫入 Google Sheets (POST)
 * @param {Object} i18nData - i18n JSON 數據
 * @returns {Object} 處理結果摘要
 * @throws {Error} 當無法存取試算表或寫入數據時拋出錯誤
 */
function jsonToSheets(i18nData) {
  try {
    validateJSONData(i18nData);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 收集所有工作表名稱
    const allSheetNames = new Set();
    Object.values(i18nData).forEach(localeData => {
      if (localeData && typeof localeData === 'object') {
        Object.keys(localeData).forEach(sheetName => {
          allSheetNames.add(sheetName);
        });
      }
    });
    
    if (allSheetNames.size === 0) {
      throw new Error('沒有找到任何工作表數據');
    }
    
    const summary = {};
    
    // 處理每個工作表
    Array.from(allSheetNames).forEach(sheetName => {
      try {
        const sheetData = convertJSONToSheetData(i18nData, sheetName);
        const rowCount = updateOrCreateSheet(spreadsheet, sheetName, sheetData);
        summary[sheetName] = rowCount;
        console.log(`工作表 "${sheetName}" 處理完成: ${rowCount} 筆資料`);
      } catch (sheetError) {
        console.error(`處理工作表 "${sheetName}" 時發生錯誤:`, sheetError);
        summary[sheetName] = `錯誤: ${sheetError.message}`;
      }
    });
    
    return {
      success: true,
      message: '數據寫入完成',
      summary: summary,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('將 JSON 寫入 Google Sheets 時發生錯誤:', error);
    throw new Error(`無法將 JSON 寫入 Google Sheets: ${error.message}`);
  }
}

// ==================== Web App 端點 ====================

/**
 * Web App 端點 - 處理 GET 請求 (Sheets 轉 JSON)
 * 
 * @param {GoogleAppsScript.Events.DoGet} e - HTTP GET 請求事件對象
 * @returns {GoogleAppsScript.Content.TextOutput} JSON 格式的回應
 */
function doGet(e) {
  try {
    console.log('開始處理 Google Sheets 轉 JSON 請求 (GET)');
    const data = sheetsToJSON();
    
    return ContentService.createTextOutput(
      JSON.stringify(data, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Google Sheets 轉 JSON 請求處理失敗:', error);

    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorData = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    return ContentService.createTextOutput(
      JSON.stringify(errorData, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web App 端點 - 處理 POST 請求 (JSON 轉 Sheets)
 * 
 * @param {GoogleAppsScript.Events.DoPost} e - HTTP POST 請求事件對象
 * @returns {GoogleAppsScript.Content.TextOutput} JSON 格式的回應
 */
function doPost(e) {
  try {
    console.log('開始處理 JSON 轉 Google Sheets 請求 (POST)');
    
    // 解析請求數據
    let requestData;
    try {
      const postData = e.postData?.contents;
      if (!postData) {
        throw new Error('沒有接收到 POST 數據');
      }
      
      requestData = JSON.parse(postData);
    } catch (parseError) {
      throw new Error(`解析 JSON 數據失敗: ${parseError.message}`);
    }
    
    // 處理數據
    const result = jsonToSheets(requestData);
    
    return ContentService.createTextOutput(
      JSON.stringify(result, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('JSON 轉 Google Sheets 請求處理失敗:', error);
    
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorData = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
    
    return ContentService.createTextOutput(
      JSON.stringify(errorData, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
