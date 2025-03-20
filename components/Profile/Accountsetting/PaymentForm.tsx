import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentData: PaymentData) => void;
  onCancel: () => void;
}

export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSubmit, onCancel }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    // 處理信用卡號格式化 (每4位添加空格)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      formattedValue = formattedValue.substring(0, 19); // 限制最大長度為 19 (16位數字 + 3個空格)
    }

    // 處理到期日格式化 (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2, 4)}`;
      }
      formattedValue = formattedValue.substring(0, 5); // 限制最大長度為 5 (MM/YY)
    }

    // 處理 CVV (限制為數字且最多 3-4 位)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // 清除對應的錯誤
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 驗證信用卡號 (必須是 16 位數字，加上空格後為 19 字符)
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = '請輸入有效的信用卡號';
    }

    // 驗證持卡人姓名
    if (!paymentData.cardHolder.trim()) {
      newErrors.cardHolder = '請輸入持卡人姓名';
    }

    // 驗證到期日
    if (!paymentData.expiryDate || paymentData.expiryDate.length !== 5) {
      newErrors.expiryDate = '請輸入有效的到期日 (MM/YY)';
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // 取后兩位
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = '請輸入有效的月份 (01-12)';
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = '信用卡已過期';
      }
    }

    // 驗證 CVV (必須是 3-4 位數字)
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = '請輸入有效的 CVV/CVC 安全碼';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(paymentData);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-[#293a3d] mb-4">信用卡付款</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <label htmlFor="cardNumber" className="block text-sm font-medium text-[#536166]">
              信用卡號
            </label>
            <div className="flex space-x-2">
              <span className="text-[#536166] text-sm">支援的卡種</span>
              <span>💳</span>
            </div>
          </div>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={paymentData.cardNumber}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2 border rounded-md",
              errors.cardNumber ? "border-red-500" : "border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-[#16B9B3] focus:border-transparent"
            )}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="cardHolder" className="block text-sm font-medium text-[#536166] mb-1">
            持卡人姓名
          </label>
          <input
            type="text"
            id="cardHolder"
            name="cardHolder"
            placeholder="請與卡片上名字完全相符"
            value={paymentData.cardHolder}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2 border rounded-md",
              errors.cardHolder ? "border-red-500" : "border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-[#16B9B3] focus:border-transparent"
            )}
          />
          {errors.cardHolder && (
            <p className="mt-1 text-sm text-red-500">{errors.cardHolder}</p>
          )}
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="w-1/2">
            <label htmlFor="expiryDate" className="block text-sm font-medium text-[#536166] mb-1">
              到期日
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              value={paymentData.expiryDate}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                errors.expiryDate ? "border-red-500" : "border-gray-300",
                "focus:outline-none focus:ring-2 focus:ring-[#16B9B3] focus:border-transparent"
              )}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
            )}
          </div>

          <div className="w-1/2">
            <label htmlFor="cvv" className="block text-sm font-medium text-[#536166] mb-1">
              安全碼 (CVV/CVC)
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              value={paymentData.cvv}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-md",
                errors.cvv ? "border-red-500" : "border-gray-300",
                "focus:outline-none focus:ring-2 focus:ring-[#16B9B3] focus:border-transparent"
              )}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-4">
            <span className="text-[#536166]">訂閱金額</span>
            <span className="font-medium">NT$ {amount}</span>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-[#536166] rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#1F4645] text-white rounded-lg text-sm hover:bg-[#16383C] transition-colors"
            >
              確認付款
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
