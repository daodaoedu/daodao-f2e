import { useRouter } from 'next/router';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import { useState, useEffect } from 'react';
import PaymentForm, { PaymentData } from './PaymentForm';
import { processPayment, PaymentResult, PaymentRecord, addPaymentRecord } from './PaymentService';

// 定義訂閱計劃類型
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

// 訂閱狀態類型
interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan;
  startDate?: string;
  endDate?: string;
  autoRenew: boolean;
}

const AccountSetting = () => {
  const router = useRouter();
  const authDispatch = useAuthDispatch();
  const { user } = useAuth();

  // 訂閱計劃數據
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: '基本會員',
      price: 0,
      period: '永久',
      features: ['基本學習資源', '社群參與']
    },
    {
      id: 'premium',
      name: '進階會員',
      price: 150,
      period: '月',
      features: ['進階學習資源', '社群參與', '專屬活動']
    },
    {
      id: 'pro',
      name: '專業會員',
      price: 350,
      period: '月',
      features: ['全部學習資源', '社群參與', '專屬活動', '個人化學習計劃']
    }
  ];

  // 用戶目前的訂閱狀態
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    autoRenew: false
  });

  const [showPlans, setShowPlans] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

    // 電子郵件驗證相關狀態
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [isVerificationSent, setIsVerificationSent] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [showVerificationInput, setShowVerificationInput] = useState<boolean>(false);
    const [verificationCode, setVerificationCode] = useState<string>('');

    // 檢查用戶郵箱是否存在
    const userEmail = user?.email || '尚未設定電子郵箱';

    // 載入時模擬檢查郵箱驗證狀態
    useEffect(() => {
      // 模擬從 API 獲取郵箱驗證狀態
      // 實際應用中應從用戶資料中獲取
      const checkEmailVerification = async () => {
        // 模擬 API 調用延遲
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 示例狀態，實際應用應從後端獲取
        if (user && user.email) {
          setIsEmailVerified(false); // 設為 false 以顯示驗證功能
        }
      };

      checkEmailVerification();
    }, [user]);

    // 模擬發送驗證碼函數
    const sendVerificationEmail = async () => {
      setIsVerifying(true);
      setVerificationError(null);

      try {
        // 這裡應該是實際發送驗證郵件的 API 調用
        // 模擬非同步操作
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsVerificationSent(true);
        setShowVerificationInput(true);
      } catch (error) {
        console.error('發送驗證郵件失敗:', error);
        setVerificationError('發送驗證郵件失敗，請稍後再試');
      } finally {
        setIsVerifying(false);
      }
    };

    // 模擬驗證碼驗證函數
    const verifyEmailCode = async () => {
      if (!verificationCode.trim()) {
        setVerificationError('請輸入驗證碼');
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        // 這裡應該是實際驗證碼的 API 調用
        // 模擬非同步操作
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 簡單驗證碼檢查 (實際應用中應由後端驗證)
        if (verificationCode === '123456') {
          setIsEmailVerified(true);
          setShowVerificationInput(false);
          setIsVerificationSent(false);
        } else {
          setVerificationError('驗證碼錯誤，請重新輸入');
        }
      } catch (error) {
        console.error('驗證郵件失敗:', error);
        setVerificationError('驗證處理失敗，請稍後再試');
      } finally {
        setIsVerifying(false);
      }
    };
  // 重新發送驗證碼
  const resendVerificationEmail = async () => {
    setVerificationCode('');
    await sendVerificationEmail();
  };

  // 完成訂閱流程
  const completeSubscription = (plan: SubscriptionPlan, transactionId?: string) => {
    // 計算結束日期（一個月後）
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // 更新訂閱狀態
    setSubscription({
      isActive: true,
      plan,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      autoRenew: true
    });

    // 如果有交易ID，添加支付記錄
    if (transactionId && plan.price > 0) {
      const newRecord = addPaymentRecord(
        plan.id,
        plan.name,
        plan.price,
        true,
        transactionId
      );
      setPaymentRecords((prev) => [newRecord, ...prev]);
    }

    // 關閉相關表單
    setShowPlans(false);
    setShowPaymentForm(false);
    setPaymentResult(null);
  };

  // 處理訂閱計劃選擇
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);

    // 如果是免費計劃，直接訂閱
    if (plan.price === 0) {
      completeSubscription(plan);
    } else {
      // 付費計劃，顯示支付表單
      setShowPaymentForm(true);
    }
  };

  // 處理支付提交
  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    if (!selectedPlan) return;

    setIsProcessingPayment(true);

    try {
      // 處理支付
      const result = await processPayment(
        selectedPlan.id,
        selectedPlan.name,
        selectedPlan.price,
        paymentData
      );

      setPaymentResult(result);

      // 如果支付成功，完成訂閱
      if (result.success && result.transactionId) {
        completeSubscription(selectedPlan, result.transactionId);
      }
    } catch (error) {
      console.error('支付處理錯誤:', error);
      setPaymentResult({
        success: false,
        message: '支付處理過程中發生錯誤，請稍後再試'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 取消支付
  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    setPaymentResult(null);
  };

  // 處理自動續訂開關
  const toggleAutoRenew = () => {
    setSubscription((prev) => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }));
  };

  // 處理取消訂閱
  const handleCancelSubscription = () => {
    const showConfirmDialog = () => {
      // 使用自定義對話框或其他確認方式
      // 暂時返回 true 作為預設行為
      return true; // TODO: 替換為自定義對話框
    };

    if (showConfirmDialog()) {
      setSubscription((prev) => ({
        ...prev,
        autoRenew: false
      }));
    }
  };

  // 登出處理
  const logout = () => {
    authDispatch.logout();
    router.push('/');
  };

  return (
    <div className="w-full max-w-[672px] bg-white rounded-2xl px-5 py-4 md:px-10 md:py-9 flex flex-col justify-center items-center">
      <h2 className="text-[22px] text-[#536166] mb-6 font-medium">
        帳號設定
      </h2>

      <div className="flex flex-col items-start w-full max-w-[544px]">
        {/* 電子信箱區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-[#293a3d]">電子信箱</h3>
          <div
            className={cn(
              "w-full my-2 rounded-lg",
              "border border-[#DBDBDB] bg-[#F3F3F3]",
              "p-3 md:p-4 text-[#92989A]",
              "break-all flex justify-between items-center"
            )}
          >
            <span className="mr-2">{userEmail}</span>
            {user?.email && (
              <span
                className={cn(
                  "text-xs py-1 px-2 rounded-full",
                  isEmailVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}
              >
                {isEmailVerified ? "已驗證" : "未驗證"}
              </span>
            )}
          </div>

          {/* 電子郵件驗證區塊 */}
          {user?.email && !isEmailVerified && (
            <div className="w-full mb-8">
              {!isVerificationSent ? (
                <button
                  type="button"
                  onClick={sendVerificationEmail}
                  disabled={isVerifying}
                  className={cn(
                    "mt-2 px-4 py-2 text-sm rounded-lg transition-colors",
                    isVerifying
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#1F4645] text-white hover:bg-[#16383C]"
                  )}
                >
                  {isVerifying ? "發送中..." : "發送驗證郵件"}
                </button>
              ) : null}

              {showVerificationInput && (
                <div className="mt-3 p-4 border border-[#DEF5F5] bg-[#F9FFFE] rounded-lg">
                  <p className="text-sm text-[#536166] mb-3">
                    驗證碼已發送至您的電子郵箱，請查收並輸入以下驗證碼：
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="請輸入 6 位驗證碼"
                      className="flex-1 px-3 py-2 border border-[#DBDBDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16B9B3] focus:border-transparent"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={verifyEmailCode}
                        disabled={isVerifying}
                        className={cn(
                          "px-4 py-2 text-sm rounded-lg transition-colors",
                          isVerifying
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-[#1F4645] text-white hover:bg-[#16383C]"
                        )}
                      >
                        {isVerifying ? "驗證中..." : "驗證"}
                      </button>
                      <button
                        type="button"
                        onClick={resendVerificationEmail}
                        disabled={isVerifying}
                        className="px-4 py-2 text-sm border border-[#1F4645] text-[#1F4645] rounded-lg hover:bg-[#f5f5f5] transition-colors"
                      >
                        重新發送
                      </button>
                    </div>
                  </div>
                  {verificationError && (
                    <p className="mt-2 text-sm text-red-500">{verificationError}</p>
                  )}
                  <p className="mt-3 text-xs text-[#92989A]">
                    如未收到驗證碼，請檢查垃圾郵件或點擊「重新發送」。
                  </p>
                </div>
              )}
            </div>
          )}
          {user?.email && isEmailVerified && (
            <div className="w-full mb-8 mt-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
                <div className="flex items-center text-green-700">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">您的電子郵箱已完成驗證</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gray-300 my-6" />

        {/* 訂閱方案區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-[#293a3d]">訂閱方案</h3>

          {subscription.isActive && subscription.plan ? (
            <div className="mt-4 w-full">
              <div className="bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <span className="font-medium text-[#1f4645]">{subscription.plan.name}</span>
                  <span className="text-[#16B9B3] font-medium mt-1 sm:mt-0">
                    {subscription.plan.price > 0 ? `NT$ ${subscription.plan.price}${subscription.plan.period}` : '免費'}
                  </span>
                </div>

                <div className="text-sm text-[#536166] mb-3">
                  有效期限: {subscription.startDate} ~ {subscription.endDate}
                </div>

                <div className="flex items-center mb-2">
                  <label htmlFor="checkbox" className="flex items-center">
                    <input
                      type="checkbox"
                      id="checkbox"
                      checked={subscription.autoRenew}
                      onChange={toggleAutoRenew}
                      className="w-4 h-4 text-[#1F4645] bg-white border-[#1F4645] rounded focus:ring-[#1F4645]"
                    />
                    <span className="ml-2 text-sm text-[#293a3d]">自動續訂</span>
                  </label>
                </div>

                <div className="text-xs text-[#92989A]">
                  自動續訂將在您的訂閱到期前自動扣款，您可以隨時取消。
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlans(true)}
                  className="px-4 py-2 border border-[#1F4645] text-[#1F4645] rounded-lg text-sm hover:bg-[#f5f5f5] transition-colors"
                >
                  變更方案
                </button>

                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 border border-[#E57373] text-[#E57373] rounded-lg text-sm hover:bg-[#FFF5F5] transition-colors"
                >
                  取消訂閱
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 w-full">
              <div className="bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg p-4 mb-4">
                <p className="text-[#536166]">您目前尚未訂閱任何方案，訂閱以獲取更多功能。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowPlans(true)}
                className="px-4 py-2 bg-[#1F4645] text-white rounded-lg text-sm hover:bg-[#16383C] transition-colors"
              >
                查看訂閱方案
              </button>
            </div>
          )}

          {/* 訂閱方案選擇 */}
          {showPlans && !showPaymentForm && (
            <div className="mt-6 w-full">
              <h4 className="font-sans font-medium text-base text-[#293a3d] mb-4">選擇訂閱方案</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                  "border rounded-lg p-4 transition-all cursor-pointer",
                  "hover:shadow-md",
                  subscription.plan?.id === plan.id
                  ? "border-[#16B9B3] bg-[#F9FFFE]"
                  : "border-gray-200"
                  )}
                    onClick={() => handleSelectPlan(plan)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectPlan(plan)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="font-medium mb-2">{plan.name}</div>
                    <div className="text-[#16B9B3] font-medium mb-4">
                      {plan.price > 0 ? `NT$ ${plan.price} / ${plan.period}` : '免費'}
                    </div>

                    <ul className="text-sm text-[#536166] space-y-1">

                      {plan.features.map((feature) => (
                        <li key={plan.id} className="flex items-center">
                          <span className="text-[#16B9B3] mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPlans(false)}
                className="mt-4 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          )}

          {/* 支付表單 */}
          {showPaymentForm && selectedPlan && (
            <div className="mt-6 w-full">
              <h4 className="font-sans font-medium text-base text-[#293a3d] mb-4">
                訂閱 {selectedPlan.name}
              </h4>

              {isProcessingPayment ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16B9B3]" />
                  <p className="mt-4 text-[#536166]">處理中，請稍候...</p>
                </div>
              ) : paymentResult && !paymentResult.success ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">支付失敗</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{paymentResult.message}</p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setPaymentResult(null)}
                          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        >
                          重試
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <PaymentForm
                  amount={selectedPlan.price}
                  onSubmit={handlePaymentSubmit}
                  onCancel={handleCancelPayment}
                />
              )}
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gray-300 my-6" />

        {/* 支付歷史區塊 */}
        <div className="flex flex-col w-full mb-6">
          <h3 className="font-sans font-medium text-base text-[#293a3d] mb-4">支付歷史</h3>

          {paymentRecords.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">方案</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.planName}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {record.amount}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          record.status === 'success'
                            ? "bg-green-100 text-green-800"
                            : record.status === 'pending'
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        )}
                        >
                          {record.status === 'success' ? '成功' : record.status === 'pending' ? '處理中' : '失敗'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : subscription.isActive && subscription.plan && subscription.plan.price > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">方案</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.startDate}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.plan.name}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {subscription.plan.price}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        成功
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-[#92989A] bg-gray-50 rounded-lg border border-gray-200">
              尚無支付紀錄
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gray-300 my-6" />

        {/* 登出帳號區塊 */}
        <div className="flex flex-col w-full">
          <h3 className="font-sans font-medium text-base text-[#293a3d] mb-6">
            登出帳號
          </h3>
          <button
            type="button"
            onClick={logout}
            className={cn(
              "w-full rounded-full py-2 bg-white text-[#1f4645]",
              "shadow-[0px_4px_10px_0px_rgba(196,194,193,0.4)]",
              "hover:bg-gray-50 transition-colors"
            )}
          >
            登出
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
