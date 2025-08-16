import { Title, Text } from '@/components/ui/typography';
import { ArrowDown } from 'lucide-react';

export default function Apply() {
  return (
    <div className="w-full max-w-full relative after:content-[''] after:block after:absolute after:right-0 after:top-[-90px] after:bg-[url('/assets/pen.png')] after:bg-cover after:bg-no-repeat after:w-[167px] after:h-[124px]">
      <div className="mb-9">
        <Text className="text-base font-normal leading-[140%] text-[#536166] mb-3">
          （一）重要時程
        </Text>
        <Text className="text-[#16B9B3] font-bold text-xl leading-[140%] mb-2">
          2024
        </Text>
        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">12/16</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">一</span>
              </div>
            </div>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            計畫開始申請
          </div>
        </div>
        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">12/29</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">六</span>
              </div>
            </div>
            <Text className="font-normal text-base leading-[140%] text-[#536166] text-center">15:00-16:30</Text>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            自主學習工作坊暨說明會（線上）
          </div>
        </div>
        <Text className="text-[#16B9B3] font-bold text-xl leading-[140%] mb-2">
          2025
        </Text>
        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">01/24</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">五</span>
              </div>
            </div>
            <Text className="font-normal text-base leading-[140%] text-[#536166] text-center">23:59</Text>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            申請截止
          </div>
        </div>
        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">01/27</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">一</span>
              </div>
            </div>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            入選與備取公告
          </div>
        </div>

        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">02/03</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">一</span>
              </div>
            </div>
            <Text className="font-normal text-base leading-[140%] text-[#536166] text-center">23:59</Text>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            繳費期限
          </div>
        </div>

        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">02/05</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">三</span>
              </div>
            </div>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            備取遞補公告
          </div>
        </div>

        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">02/09</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">日</span>
              </div>
            </div>
            <ArrowDown className="text-[#536166]" />
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">07/12</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">六</span>
              </div>
            </div>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            計畫期間
          </div>
        </div>

        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">02/09</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">日</span>
              </div>
            </div>
            <Text className="font-normal text-base leading-[140%] text-[#536166] text-center">14:00-15:00</Text>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            暖身活動（線上）
          </div>
        </div>

        <div className="mb-2 rounded-sm bg-white p-4">
          <Title
            as="h4"
            className="text-base font-bold text-[#536166] leading-[140%]"
          >
            線上課時間
          </Title>
          <div className="mt-2">
            <ul className="list-disc pl-6">
              <li className="text-[#536166] text-base font-normal leading-[140%] text-left">2025/2/15（六）、2025/2/22（六）、2025/3/1（六）、2025/6/7（六）14:00-15:30</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-row items-stretch justify-start rounded-sm gap-1 mb-2">
          <div className="bg-white rounded-sm w-[120px] flex-shrink-0 p-2 text-center">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-1 text-xl font-bold leading-[140%] text-[#536166] w-[3em] text-right">07/12</div>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 rounded-sm bg-[#FFA10B] text-center">
                <span className="text-white text-center font-bold text-base leading-[140%]">六</span>
              </div>
            </div>
            <Text className="font-normal text-base leading-[140%] text-[#536166] text-center">10:00-16:00</Text>
          </div>
          <div className="text-[#536166] text-base font-bold leading-[140%] bg-white rounded-sm w-full p-4 flex flex-col justify-center items-start">
            成果分享日
          </div>
        </div>

        <div className="rounded-sm bg-white p-4">
          <Title
            as="h4"
            className="text-base font-bold text-[#536166] leading-[140%]"
          >
            社群交流線上與實體時間
          </Title>
          <div className="mt-2">
            <ul className="list-disc pl-6">
              <li className="text-[#536166] text-base font-normal leading-[140%] text-left">線上：2/16（日）19:30-21:00、4/20（日）19:30-21:00、6/22（日）19:30-21:00</li>
              <li className="text-[#536166] text-base font-normal leading-[140%] text-left">實體：3/23（日）15:00-16:30 台北、5/25（日）15:00-16:30 台中</li>
              <li className="text-[#536166] text-base font-normal leading-[140%] text-left">地點與時間將依入選學員進行調整</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-9">
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          （二）申請方式
        </Text>
        <div className="mt-2">
          <ul className="list-disc pl-6">
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">進入島島阿學網站，點選學習馬拉松頁面「立即申請」</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">在申請截止日前皆可修改申請內容</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">入選名額：20 位</li>
          </ul>
        </div>
      </div>

      <div>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          （三）評選標準
        </Text>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          為確保學習計畫的品質和有效性，評選將依據以下標準進行：
        </Text>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          1、計畫完整性 （30%）
        </Text>
        <div className="mt-2">
          <ul className="list-disc pl-6">
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">計畫簡述：願景清晰明確，具體可行，例如實現願景的步驟合理、邏輯性強，且有階段性規劃。</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習動機：動機強烈且具說服力，能清楚連結個人經驗與學習主題。</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習內容：學習內容具體且聚焦，與學習主題密切相關。</li>
          </ul>
          <br />
        </div>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          2、目標與方法 （30%）
        </Text>
        <div className="mt-2">
          <ul className="list-disc pl-6">
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習目標 ：目標明確、可衡量、可達成、具相關性。</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習方法與策略：方法和策略多元且有效，能促進學習目標的達成。</li>
          </ul>
          <br />
        </div>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          3、資源與時程 （20%）
        </Text>
        <div className="mt-2">
          <ul className="list-disc pl-6">
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習資源：資源類型多元且可靠，包含線上線下資源、書籍、師資、社群等。</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習時程表：時程安排合理，學習進度規劃明確。</li>
          </ul>
          <br />
        </div>
        <Text className="text-base font-normal leading-[140%] text-[#536166]">
          4、評量與成果 （20%）
        </Text>
        <div className="mt-2">
          <ul className="list-disc pl-6">
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習評量：評量方式客觀且有效，能真實反映學習成果。</li>
            <li className="text-[#536166] text-base font-normal leading-[140%] text-left">學習成果呈現方式：成果呈現方式具體且多元，並與學習目標相符，能有效展現學習成果。</li>
          </ul>
          <br />
        </div>
        <Text>
          評選委員將依據上述標準，綜合考量申請者的學習計畫，進行評分和排序。
        </Text>
      </div>
    </div>
  );
}
