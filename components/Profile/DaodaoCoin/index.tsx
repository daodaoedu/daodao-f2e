import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/Auth';
import { useRouter } from 'next/router';

// 定義兌換項目類型
interface RedeemItem {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  imageSrc: string;
  category: string;
  availability: number;
}

// 定義交易記錄類型
interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  description: string;
  date: string;
}

const DaodaoCoin = () => {
  const { user } = useAuth();
  const router = useRouter();

  // 用戶島島幣狀態
  const [coinBalance, setCoinBalance] = useState<number>(350);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'redeem' | 'history'>('redeem');
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [redeemQuantity, setRedeemQuantity] = useState<number>(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 兌換項目數據
  const redeemItems: RedeemItem[] = [
    {
      id: 'course1',
      name: '進階學習課程',
      description: '獲得島島阿學平台上的進階學習課程一個月免費使用權',
      coinCost: 200,
      imageSrc: '/images/course.png',
      category: 'course',
      availability: 10
    },
    {
      id: 'book1',
      name: '電子書兌換券',
      description: '可兌換一本平台合作出版社的電子書',
      coinCost: 150,
      imageSrc: '/images/book.png',
      category: 'book',
      availability: 15
    },
    {
      id: 'event1',
      name: '線上講座門票',
      description: '獲得一張島島阿學合作夥伴舉辦的線上講座門票',
      coinCost: 100,
      imageSrc: '/images/event.png',
      category: 'event',
      availability: 5
    },
    {
      id: 'discount1',
      name: '學習用品折扣券',
      description: '可在指定商店購買學習用品享有8折優惠',
      coinCost: 50,
      imageSrc: '/images/discount.png',
      category: 'discount',
      availability: 20
    },
    {
      id: 'course2',
      name: '專業技能工作坊',
      description: '參加為期一天的專業技能培訓工作坊',
      coinCost: 300,
      imageSrc: '/images/workshop.png',
      category: 'course',
      availability: 3
    },
    {
      id: 'merch1',
      name: '島島阿學限定周邊',
      description: '獲得島島阿學限定設計的文具組合',
      coinCost: 120,
      imageSrc: '/images/merch.png',
      category: 'merch',
      availability: 8
    }
  ];

  // 模擬交易歷史
  useEffect(() => {
    // 在實際應用中，這裡會從API獲取交易歷史
    const mockTransactions: Transaction[] = [
      {
        id: 't001',
        type: 'earn',
        amount: 50,
        description: '完成課程評價',
        date: '2025-03-10'
      },
      {
        id: 't002',
        type: 'earn',
        amount: 100,
        description: '分享學習資源',
        date: '2025-03-05'
      },
      {
        id: 't003',
        type: 'redeem',
        amount: 150,
        description: '兌換電子書券',
        date: '2025-02-28'
      },
      {
        id: 't004',
        type: 'earn',
        amount: 30,
        description: '完成每日學習任務',
        date: '2025-02-25'
      },
      {
        id: 't005',
        type: 'redeem',
        amount: 100,
        description: '兌換線上講座門票',
        date: '2025-02-20'
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  // 篩選類別的兌換項目
  const filteredItems = activeCategory === 'all'
    ? redeemItems
    : redeemItems.filter((item) => item.category === activeCategory);

  // 處理兌換確認
  const handleRedeemConfirm = () => {
    if (!selectedItem) return;

    const totalCost = selectedItem.coinCost * redeemQuantity;

    // 檢查餘額是否足夠
    if (coinBalance < totalCost) {
      alert('島島幣餘額不足，無法兌換。');
      return;
    }

    // 模擬兌換過程
    setCoinBalance((prev) => prev - totalCost);

    // 新增交易記錄
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      type: 'redeem',
      amount: totalCost,
      description: `兌換 ${selectedItem.name} x${redeemQuantity}`,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    // 關閉確認視窗
    setShowConfirmModal(false);
    setSelectedItem(null);
    setRedeemQuantity(1);

    // 顯示成功訊息
    alert(`成功兌換 ${selectedItem.name} ${redeemQuantity}份！`);
  };

  // 處理兌換項目點擊
  const handleItemClick = (item: RedeemItem) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  return (
    <div className="w-full max-w-[672px] bg-white rounded-2xl px-5 py-4 md:px-10 md:py-9 flex flex-col justify-center items-center">
      <h2 className="text-[22px] text-[#536166]">
        島島幣
      </h2>

      {/* 島島幣餘額區塊 */}
      <div className="w-full max-w-[544px] mt-6 bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-[#16B9B3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm text-[#536166]">您的島島幣餘額</p>
            <p className="text-2xl font-bold text-[#1F4645]">{coinBalance}</p>
          </div>
        </div>
        <div>
          <button
            onClick={() => router.push('/profile/daodao-coin/explanation')}
            className="bg-[#1F4645] text-white rounded-full py-2 px-4 text-sm hover:bg-[#293a3d] transition-colors"
          >
            了解如何獲得島島幣
          </button>
        </div>
      </div>

      {/* 標籤頁切換 */}
      <div className="w-full max-w-[544px] mt-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('redeem')}
            className={cn(
              "py-2 px-1 font-medium text-base border-b-2 transition-colors",
              activeTab === 'redeem' ? "border-[#16B9B3] text-[#16B9B3]" : "border-transparent text-[#536166]"
            )}
          >
            兌換獎勵
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "py-2 px-1 font-medium text-base border-b-2 transition-colors",
              activeTab === 'history' ? "border-[#16B9B3] text-[#16B9B3]" : "border-transparent text-[#536166]"
            )}
          >
            交易記錄
          </button>
        </div>
      </div>

      {/* 兌換獎勵內容 */}
      {activeTab === 'redeem' && (
        <div className="w-full max-w-[544px] mt-6">
          {/* 類別過濾器 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'all' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              全部
            </button>
            <button
              onClick={() => setActiveCategory('course')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'course' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              課程
            </button>
            <button
              onClick={() => setActiveCategory('book')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'book' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              書籍
            </button>
            <button
              onClick={() => setActiveCategory('event')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'event' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              活動
            </button>
            <button
              onClick={() => setActiveCategory('discount')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'discount' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              折扣
            </button>
            <button
              onClick={() => setActiveCategory('merch')}
              className={cn(
                "px-4 py-1 text-sm rounded-full transition-colors",
                activeCategory === 'merch' ? "bg-[#1F4645] text-white" : "bg-gray-100 text-[#536166] hover:bg-gray-200"
              )}
            >
              周邊
            </button>
          </div>

          {/* 兌換項目列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path d="M18.6 1h-13.2c-.66 0-1.2.54-1.2 1.2v19.6c0 .66.54 1.2 1.2 1.2h13.2c.66 0 1.2-.54 1.2-1.2v-19.6c0-.66-.54-1.2-1.2-1.2zm-6.6 20c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6-4h-12v-12h12v12z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-[#293a3d]">{item.name}</h4>
                    <p className="text-xs text-[#92989A] mt-1">剩餘: {item.availability} 份</p>
                  </div>
                </div>
                <p className="text-sm text-[#536166] mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16B9B3" className="w-5 h-5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    <span className="ml-1 font-medium text-[#16B9B3]">{item.coinCost}</span>
                  </div>
                  <button className="px-3 py-1 bg-[#1F4645] text-white text-sm rounded-full hover:bg-[#293a3d] transition-colors">
                    兌換
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 交易記錄內容 */}
      {activeTab === 'history' && (
        <div className="w-full max-w-[544px] mt-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">說明</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">數量</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm font-medium text-right",
                      transaction.type === 'earn' ? "text-green-600" : "text-red-600"
                    )}
                    >
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 兌換確認視窗 */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-[#293a3d] mb-4">確認兌換</h3>
            <div className="mb-4">
              <p className="text-[#536166] mb-2">您即將兌換:</p>
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="font-medium text-[#293a3d]">{selectedItem.name}</p>
                <p className="text-sm text-[#536166] mt-1">{selectedItem.description}</p>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#536166]">數量</span>
                <div className="flex items-center">
                  <button
                    onClick={() => setRedeemQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    disabled={redeemQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="mx-3">{redeemQuantity}</span>
                  <button
                    onClick={() => setRedeemQuantity((prev) => Math.min(selectedItem.availability, prev + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    disabled={redeemQuantity >= selectedItem.availability}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg">
                <span className="text-[#536166]">總花費:</span>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16B9B3" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  <span className="ml-1 font-bold text-[#16B9B3]">{selectedItem.coinCost * redeemQuantity}</span>
                </div>
              </div>

              <div className="mt-3 text-sm text-[#536166]">
                您的餘額: <span className="font-medium">{coinBalance}</span> 島島幣
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRedeemConfirm}
                className="px-4 py-2 bg-[#1F4645] text-white rounded-lg hover:bg-[#293a3d] transition-colors"
                disabled={coinBalance < selectedItem.coinCost * redeemQuantity}
              >
                確認兌換
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DaodaoCoin;
