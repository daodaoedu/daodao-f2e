// 支付處理服務，模擬與後端 API 互動
import { PaymentData } from './PaymentForm';

// 支付結果類型
export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  timestamp?: string;
}

// 訂閱支付紀錄類型
export interface PaymentRecord {
  id: string;
  date: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  transactionId: string;
}

// 模擬支付處理
export const processPayment = (
  planId: string,
  planName: string,
  amount: number,
  paymentData: PaymentData
): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    // 模擬網絡延遲
    setTimeout(() => {
      // 模擬驗證邏輯：假設只有特定卡號後四碼為刻意失敗的測試案例
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      const isValidCard = luhnCheck(cardNumber); // Implement or use a library for Luhn check

      if (!isValidCard) {
        resolve({
          success: false,
          message: '支付失敗：信用卡號碼無效',
        });
      } else if (cardLastFour === '0000') {
      } else {
        // 生成假的交易 ID
        const transactionId = `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        resolve({
          success: true,
          message: '支付成功',
          transactionId,
          timestamp: new Date().toISOString(),
        });
      }
    }, 1500); // 模擬 1.5 秒延遲
  });
};

// 獲取支付歷史記錄
export const getPaymentHistory = (): Promise<PaymentRecord[]> => {
  // 這裡應該從 API 獲取真實數據，現在返回模擬數據
  return Promise.resolve([]);
};

// 添加新的支付記錄
export const addPaymentRecord = (
  planId: string,
  planName: string,
  amount: number,
  success: boolean,
  transactionId: string
): PaymentRecord => {
  const record: PaymentRecord = {
    id: Math.random().toString(36).substring(2, 10),
    date: new Date().toISOString().split('T')[0],
    planId,
    planName,
    amount,
    status: success ? 'success' : 'failed',
    transactionId,
  };

  // 在真實應用中，這裡應該與 API 交互保存記錄

  return record;
};
