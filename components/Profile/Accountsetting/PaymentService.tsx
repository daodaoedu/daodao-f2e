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

// Luhn 算法驗證信用卡號碼
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEvenIndex = false;

  // 從右向左遍歷每一位數字
  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    const digit = parseInt(cardNumber.charAt(i), 10);

    if (isEvenIndex) {
      const doubledDigit = digit * 2;
      sum += doubledDigit > 9 ? doubledDigit - 9 : doubledDigit;
    } else {
      sum += digit;
    }

    isEvenIndex = !isEvenIndex;
  }

  return sum % 10 === 0;
};
// 支付處理
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
      const cardLastFour = cardNumber.slice(-4);
      const isValidCard = luhnCheck(cardNumber);

      if (!isValidCard) {
        resolve({
          success: false,
          message: '支付失敗：信用卡號碼無效',
        });
      } else if (cardLastFour === '0000') {
        // 特定測試案例：卡號後四碼為 0000 時模擬支付失敗
        resolve({
          success: false,
          message: '支付失敗：測試卡號',
        });
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
  return Promise.resolve([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      planId: 'pro_plan',
      planName: '專業版',
      amount: 99.99,
      status: 'success',
      transactionId: 'TXN123456'
    }
  ]);
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

export default {
  processPayment,
  getPaymentHistory,
  addPaymentRecord
};
