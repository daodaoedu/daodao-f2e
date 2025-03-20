import { useRouter } from 'next/navigation';
import React from 'react';
import { GoArrowUpRight, GoCheckCircle, GoRocket, GoPeople, GoGraph, GoBook, GoHeart, GoFlame, GoStar } from 'react-icons/go';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

function Home() {
  const router = useRouter();

  const EXPLORE_ACTIONS = [
    {
      title: '學習計畫',
      description: '瀏覽大家的學習計畫、吸收多元學習經驗，或分享你的學習歷程，啟發他人',
      link: '/projects',
      buttonText: '探索學習計畫'
    },
    {
      title: '學習想法',
      description: '發現各種學習心得與想法，獲取寶貴的經驗分享與學習靈感',
      link: '/ideas',
      buttonText: '探索學習想法'
    }
  ];

  const EXCHANGE_ACTIONS = [
    {
      title: '揪團活動',
      description: '瀏覽或加入各種學習揪團，與志同道合的夥伴一起學習成長',
      link: '/group',
      buttonText: '探索揪團'
    },
    {
      title: '近期活動',
      description: '查看並報名參加最新的線上、線下學習活動與工作坊',
      link: '/activities',
      buttonText: '瀏覽活動'
    }
  ];

  const POPULAR_PLANS = [
    {
      title: "網頁開發入門 60 天挑戰",
      author: "張小明",
      avatar: "/new-logo.png",
      description: "從零基礎到前端工程師，包含 HTML、CSS 和 JavaScript 的完整學習路徑",
      likes: 245,
      color: "bg-primary-base"
    },
    {
      title: "JLPT N2 日文能力檢定準備",
      author: "王小花",
      avatar: "/new-logo.png",
      description: "三個月內高效備考日文 N2 檢定，包含文法、單字與聽力的完整準備",
      likes: 187,
      color: "bg-primary-dark"
    },
    {
      title: "數位攝影從入門到精通",
      author: "林大方",
      avatar: "/new-logo.png",
      description: "系統性學習攝影基礎、構圖技巧、光線運用與後製處理",
      likes: 156,
      color: "bg-primary-base"
    }
  ];

  const RECENT_EVENTS = [
    {
      title: "Python 資料分析工作坊",
      date: "2025/4/15",
      time: "19:00-21:00",
      type: "線上",
      description: "從基礎開始學習如何使用 Python 進行資料分析與視覺化",
      icon: <GoGraph size={24} />,
      color: "bg-primary-base"
    },
    {
      title: "斜槓創業讀書會",
      date: "2025/4/20",
      time: "14:00-16:00",
      type: "線下",
      description: "探討如何在數位時代打造個人品牌與多元收入來源",
      icon: <GoFlame size={24} />,
      color: "bg-primary-dark"
    },
    {
      title: "永續設計思考工作坊",
      date: "2025/4/26",
      time: "10:00-16:00",
      type: "線下",
      description: "學習如何將永續理念融入設計思考過程，創造更有社會影響力的作品",
      icon: <GoStar size={24} />,
      color: "bg-primary-base"
    }
  ];

  const TESTIMONIALS = [
    {
      quote: "島島阿學幫助我建立了學習的習慣與系統，從被動學習轉為主動探索。在這裡，我找到了志同道合的夥伴，一起成長進步！",
      name: "陳小明",
      title: "大學生",
      avatar: "/new-logo.png"
    },
    {
      quote: "平台上豐富的學習資源讓我不再感到迷茫。透過參與揪團，我認識了許多有相同興趣的朋友，讓學習變得更有動力。",
      name: "林小花",
      title: "平面設計師",
      avatar: "/new-logo.png"
    },
    {
      quote: "身為自學者，島島阿學提供的學習計畫工具讓我能更有系統地規劃學習路徑，社群的支持也讓我在遇到瓶頸時能堅持下去。",
      name: "王大明",
      title: "程式開發者",
      avatar: "/new-logo.png"
    }
  ];

  return (
    <div className="overflow-hidden bg-[#f3fcfc]">
      {/* 英雄區塊 - 簡化背景色彩 */}
      <section className="relative py-16 md:py-20 bg-[#e0f1f2] text-basic-400 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/hero-pattern.svg')] bg-cover" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">島島阿學 - 開啟你的自主學習旅程</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
            連結多元學習資源、創建個人化學習計畫、加入志同道合的學習社群，讓自主學習成為一種生活方式
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <button
              onClick={() => router.push('/projects')}
              className="px-6 py-3 bg-primary-base hover:bg-primary-dark transition-colors rounded-full text-white font-medium flex items-center gap-2"
            >
              探索學習計畫 <GoArrowUpRight className="text-xl" />
            </button>
            <button
              onClick={() => router.push('/join')}
              className="px-6 py-3 bg-white border border-primary-base rounded-full text-primary-base font-medium flex items-center gap-2 hover:bg-primary-palest transition-colors"
            >
              加入社群 <GoPeople className="text-xl" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto bg-white p-1 rounded-full flex shadow">
            <div className="flex-1 pl-5 flex items-center text-basic-400">
              <FiSearch className="mr-2" />
              <input
                type="text"
                placeholder="搜尋學習資源、計畫或揪團..."
                className="bg-transparent border-none outline-none w-full py-3 placeholder-basic-400/70 text-basic-400"
              />
            </div>
            <button className="bg-primary-base text-white px-5 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors">
              搜尋
            </button>
          </div>
        </div>
      </section>

      {/* 核心價值區塊 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
              透過島島阿學，重新定義你的學習
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary-base rounded-full" />
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              我們提供完整的自主學習生態系統，幫助你探索更多可能性、追求自我成長
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl shadow-md p-6 hover:-translate-y-1 duration-300 bg-white border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-primary-palest text-primary-base flex items-center justify-center mb-4">
                <GoBook className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">探索學習資源</h3>
              <p className="text-gray-600 mb-4">瀏覽豐富的學習資源庫，從各領域找到適合你的學習材料</p>
              <button
                onClick={() => router.push('/search')}
                className="text-primary-base flex items-center gap-1 font-medium hover:text-primary-dark"
              >
                探索資源 <FiArrowRight />
              </button>
            </div>

            <div className="rounded-xl shadow-md p-6 hover:-translate-y-1 duration-300 bg-white border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-primary-palest text-primary-base flex items-center justify-center mb-4">
                <GoRocket className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">建立學習計畫</h3>
              <p className="text-gray-600 mb-4">創建個人化學習路徑，設定目標、追蹤進度、記錄成長歷程</p>
              <button
                onClick={() => router.push('/projects')}
                className="text-primary-base flex items-center gap-1 font-medium hover:text-primary-dark"
              >
                查看計畫 <FiArrowRight />
              </button>
            </div>

            <div className="rounded-xl shadow-md p-6 hover:-translate-y-1 duration-300 bg-white border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-primary-palest text-primary-base flex items-center justify-center mb-4">
                <GoPeople className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">加入學習社群</h3>
              <p className="text-gray-600 mb-4">與志同道合的夥伴交流討論、組隊學習、獲得支持和激勵</p>
              <button
                onClick={() => router.push('/group')}
                className="text-primary-base flex items-center gap-1 font-medium hover:text-primary-dark"
              >
                探索揪團 <FiArrowRight />
              </button>
            </div>

            <div className="rounded-xl shadow-md p-6 hover:-translate-y-1 duration-300 bg-white border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-primary-palest text-primary-base flex items-center justify-center mb-4">
                <GoGraph className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">參與學習活動</h3>
              <p className="text-gray-600 mb-4">報名線上/實體工作坊、讀書會、工作坊，擴展你的學習視野</p>
              <button
                onClick={() => router.push('/activities')}
                className="text-primary-base flex items-center gap-1 font-medium hover:text-primary-dark"
              >
                查看活動 <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 熱門學習計畫 */}
      <section className="py-16 bg-[#f3fcfc]">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
              熱門學習計畫
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary-base rounded-full" />
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              探索社群中最受歡迎的學習計畫，獲取靈感與指導
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {POPULAR_PLANS.map((plan, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`h-2 w-full ${plan.color}`} />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{plan.title}</h3>

                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                      <img
                        src={plan.avatar}
                        alt={plan.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      由 <span className="font-semibold">{plan.author}</span> 建立
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {plan.description}
                  </p>

                  <div className="flex items-center text-gray-500 mb-4">
                    <GoHeart className="mr-1.5" />
                    <span className="text-sm">{plan.likes} 人喜歡</span>
                  </div>

                  <button
                    onClick={() => router.push('/projects')}
                    className="flex items-center text-primary-base font-medium hover:text-primary-dark transition-colors"
                  >
                    查看詳情 <FiArrowRight className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/projects')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary-base text-primary-base font-medium rounded-full hover:bg-primary-palest transition-colors"
            >
              查看更多學習計畫 <GoArrowUpRight />
            </button>
          </div>
        </div>
      </section>

      {/* 近期活動區塊 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
              近期熱門活動
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary-base rounded-full" />
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              參與線上、線下學習活動與工作坊，擴展學習視野、結交同好
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {RECENT_EVENTS.map((event, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-5">
                    <div className={`w-12 h-12 rounded-lg ${event.color} text-white flex items-center justify-center`}>
                      {event.icon}
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-gray-800">{event.title}</h3>

                  <div className="text-gray-500 mb-4">
                    <span className="inline-flex items-center">
                      📅 {event.date} · {event.time}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-5 line-clamp-3">
                    {event.description}
                  </p>

                  <button
                    onClick={() => router.push('/activities')}
                    className="flex items-center text-primary-base font-medium hover:text-primary-dark transition-colors"
                  >
                    查看詳情 <FiArrowRight className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/activities')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-primary-base text-primary-base font-medium rounded-full hover:bg-primary-palest transition-colors"
            >
              探索更多活動 <GoArrowUpRight />
            </button>
          </div>
        </div>
      </section>

      {/* 學習者見證 */}
      <section className="py-16 bg-[#f3fcfc]">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
              學習者的故事
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary-base rounded-full" />
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              聽聽其他學習者如何透過島島阿學成長與轉變
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md relative">
                <div className="absolute top-4 left-6 text-4xl text-primary-palest opacity-60">❝</div>
                <p className="text-gray-600 italic mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-200">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 數據統計區塊 */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary-base mb-2">10,000+</p>
              <p className="text-lg text-gray-600 font-medium">學習資源</p>
            </div>

            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary-base mb-2">5,000+</p>
              <p className="text-lg text-gray-600 font-medium">學習計畫</p>
            </div>

            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary-base mb-2">2,000+</p>
              <p className="text-lg text-gray-600 font-medium">學習揪團</p>
            </div>

            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary-base mb-2">50,000+</p>
              <p className="text-lg text-gray-600 font-medium">活躍用戶</p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用步驟區塊 - 解決右側圖片問題 */}
      <section className="py-14 bg-[#f3fcfc]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative inline-block">
                如何開始你的學習之旅
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary-base rounded-full" />
              </h2>
              <p className="text-gray-600 text-lg mb-6">透過簡單幾個步驟，在島島阿學平台打造專屬你的學習體驗</p>

              <ul className="space-y-5">
                <li className="flex">
                  <span className="mr-4 text-primary-base flex-shrink-0">
                    <GoCheckCircle size={24} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">瀏覽優質學習內容</h3>
                    <p className="text-gray-600">探索各領域的學習資源、學習計畫與想法分享</p>
                  </div>
                </li>

                <li className="flex">
                  <span className="mr-4 text-primary-base flex-shrink-0">
                    <GoCheckCircle size={24} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">建立個人學習計畫</h3>
                    <p className="text-gray-600">設定目標、追蹤進度，讓學習更有系統和成效</p>
                  </div>
                </li>

                <li className="flex">
                  <span className="mr-4 text-primary-base flex-shrink-0">
                    <GoCheckCircle size={24} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">加入學習社群和揪團</h3>
                    <p className="text-gray-600">與志同道合的夥伴一起學習，互相支持與激勵</p>
                  </div>
                </li>

                <li className="flex">
                  <span className="mr-4 text-primary-base flex-shrink-0">
                    <GoCheckCircle size={24} />
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">分享你的學習歷程</h3>
                    <p className="text-gray-600">記錄心得、分享成果，啟發更多人的學習熱情</p>
                  </div>
                </li>
              </ul>

              <button
                onClick={() => router.push('/register')}
                className="mt-8 px-6 py-3 bg-primary-base hover:bg-primary-dark rounded-full text-white font-medium flex items-center gap-2 transition-colors"
              >
                註冊帳號 <GoArrowUpRight />
              </button>
            </div>

            <div className="order-1 md:order-2 mb-8 md:mb-0 flex justify-center items-center">
              <img
                src="/new-logo.png"
                alt="島島阿學 Logo"
                className="w-full max-w-sm rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA區塊 */}
      <section className="py-16 bg-primary-base text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">準備好開始你的學習旅程了嗎？</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            加入島島阿學，與上萬名學習者一起成長，發掘你未知的潛能與可能性
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-7 py-3 bg-white text-primary-base rounded-full font-medium text-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            立即註冊免費帳號
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
