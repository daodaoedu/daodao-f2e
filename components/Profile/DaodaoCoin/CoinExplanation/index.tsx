import React from 'react';
import { useRouter } from 'next/router';

const CoinExplanation = () => {
  const router = useRouter();

  // 獲取島島幣的方式
  const earnMethods = [
    {
      title: '完成課程評價',
      desc: '為您參與過的課程或學習資源提供有價值的評價和反饋，每次評價可獲得 10-30 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      )
    },
    {
      title: '分享學習資源',
      desc: '在平台上分享有價值的學習資源或教材，每個被審核通過的資源可獲得 50-100 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
      )
    },
    {
      title: '完成每日學習任務',
      desc: '每天登入平台並完成學習相關的小任務，如閱讀文章、觀看教學視頻等，每日可獲得 5-20 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    },
    {
      title: '參與社群討論',
      desc: '在學習社群中積極參與討論並提供有價值的見解，根據參與度和貢獻可獲得 10-40 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      )
    },
    {
      title: '成功邀請朋友加入',
      desc: '邀請新用戶加入島島阿學平台，每成功邀請一位新用戶可獲得 100 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      )
    },
    {
      title: '參與問卷調查',
      desc: '完成平台發布的學習體驗相關問卷調查，每次完成可獲得 20-50 島島幣',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      )
    }
  ];

  // 島島幣使用規則
  const coinRules = [
    '島島幣無法轉讓給其他用戶',
    '島島幣有效期為自獲得之日起一年時間',
    '兌換成功後的獎勵不支持退還島島幣',
    '平台保留調整島島幣獲取方式和兌換項目的權利',
    '如發現惡意刷取島島幣的行為，平台有權取消相關獎勵並凍結賬戶'
  ];

  return (
    <div className="w-full max-w-[672px] bg-white rounded-2xl px-5 py-4 md:px-10 md:py-9">
      {/* 標題區 */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-2xl font-medium text-[#1F4645]">島島幣說明</h2>
      </div>

      {/* 島島幣簡介 */}
      <div className="mb-8">
        <div className="bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg p-5 mb-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[#16B9B3] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-medium text-[#1F4645]">什麼是島島幣？</h3>
          </div>
          <p className="text-[#536166]">
            島島幣是島島阿學平台的虛擬獎勵積分，用戶可以通過參與平台活動、分享資源和完成任務等方式獲取。
            島島幣可以在平台內兌換各種學習資源、課程折扣、活動門票等獎勵。
          </p>
        </div>
      </div>

      {/* 如何獲取島島幣 */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-[#1F4645] mb-4">如何獲取島島幣</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnMethods.map((method, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3]">
                  {method.icon}
                </div>
                <h4 className="ml-3 font-medium text-[#293a3d]">{method.title}</h4>
              </div>
              <p className="text-sm text-[#536166]">{method.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 兌換獎勵類別 */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-[#1F4645] mb-4">可兌換獎勵類別</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">課程</h4>
            <p className="text-sm text-[#536166]">進階學習課程、專業技能工作坊</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">書籍</h4>
            <p className="text-sm text-[#536166]">電子書兌換券、實體書折扣</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">活動</h4>
            <p className="text-sm text-[#536166]">線上講座門票、學習社群活動</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">折扣</h4>
            <p className="text-sm text-[#536166]">學習用品折扣券、合作商店優惠</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">周邊</h4>
            <p className="text-sm text-[#536166]">島島阿學限定文具、紀念品</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 mx-auto bg-[#E6F7F7] rounded-full flex items-center justify-center text-[#16B9B3] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <h4 className="font-medium text-[#293a3d] mb-1">特權</h4>
            <p className="text-sm text-[#536166]">會員專屬功能、身份標識</p>
          </div>
        </div>
      </div>

      {/* 島島幣使用規則 */}
      <div className="mb-6">
        <h3 className="text-xl font-medium text-[#1F4645] mb-4">島島幣使用規則</h3>
        <div className="bg-[#F9FFFE] border border-[#DEF5F5] rounded-lg p-5">
          <ul className="space-y-3">
            {coinRules.map((rule, index) => (
              <li key={index} className="flex">
                <span className="mr-2 text-[#16B9B3]">•</span>
                <span className="text-[#536166]">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 返回兌換頁面按鈕 */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-[#1F4645] text-white rounded-full hover:bg-[#293a3d] transition-colors"
        >
          返回兌換頁面
        </button>
      </div>
    </div>
  );
};

export default CoinExplanation;
