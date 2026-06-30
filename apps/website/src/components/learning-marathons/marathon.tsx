import { useTranslations } from "@daodao/i18n";
import { ApplicationInfo } from "./application-info";
import { ApplyButton } from "./apply-button";
import { Banner } from "./banner";
import { Equipment } from "./equipment";
import { FAQ } from "./f-a-q";
import { Mentors } from "./mentors";
import { Participant } from "./participant";
import { Pricing } from "./pricing";
import { Sidebar } from "./sidebar";
import { Spotlight } from "./spotlight";
import { List, Section } from "./styled";

export const Marathon = () => {
  const t = useTranslations("learning_marathon");
  return (
    <>
      <Banner />
      <Sidebar />
      <Section title={t("marathon_section_intro_title")} id="marathon-intro" className="bg-white">
        <p className="mb-5 mt-2.5">
          學習這趟漫長的馬拉松，我可不可以用我的方式跑向屬於我的終點？
          <br />
          發展興趣、改變生活習慣、上理想的大學、生涯規劃、發起社會行動，每一個生活大小事都是一場學習馬拉松。然而，每一次的奮力前行總會遇到「不知道怎麼計畫」、「好難自律」、「沒有伴」、「資源與人脈有限」、「無限自我質疑」等難題...
        </p>
        <p>島島盃學習馬拉松將提供你四大裝備：</p>
        <List className="mb-5">
          <li>「專業陪跑員」陪你自我釐清與規劃路徑</li>
          <li>「百人社群」讓你找到合適夥伴與各界人脈</li>
          <li>「AI個人化數位工具」引導你學習方向與資源並自律學習</li>
          <li>「專業課程」帶你掌握自主學習要領</li>
        </List>
        <p className="mb-5">
          如果你有些想做的計畫，正在等待個契機開始，現在就是時候。
          <br />
          五個月的馬拉松後，你將會在計畫過程中「豐富知識經驗、在學習中形塑自我、為生活與社會帶來實際行動」，完賽不僅全額退費還有機會獲得獎助金。
        </p>
        <p>
          島島盃 2025
          春季學習馬拉松，將以學習者的自我需求出發設計學習計畫，開啟一趟自我導向學習馬拉松，往哪跑？怎麼跑？跑多快？終點在哪由你決定，島島阿學陪你一起跑。
          <br />
          邀請你一起「為自己重新打造喜歡的學習生活」，把自主學習變成一種生活方式，並在彼此陪伴下，成就自我與他人。
        </p>
      </Section>

      <Section
        title={t("marathon_section_who_title")}
        id="marathon-who"
        className="bg-primary-lightest"
      >
        <List className="my-9">
          <li>16歲以上學習者皆可申請，優先以高中及大學生為主</li>
          <li>有意願為自己打造專屬學習旅程的學習者</li>
          <li>若16歲以下有高度申請動機，且經法定代理人同意者，歡迎寄信給主辦單位。</li>
        </List>
        <p className="mb-2.5">如果你符合下列一項，那你也許就是適合的參加的人：</p>
        <div className="mb-2.5">
          <Participant />
        </div>
        <p>
          特別提醒：
          <br />
          活動重視社群互動與共學，若無法在計劃期間投入時間參與並和其他夥伴、引導師互動，請斟酌申請。
        </p>
      </Section>

      <Section title={t("marathon_section_how_title")} id="marathon-how" className="bg-white">
        <h3 className="heading-sm my-9 leading-[1.2] text-basic-500">
          {t("marathon_section_how_equipment_subtitle")}
        </h3>
        <Equipment />
        <h3 className="heading-sm my-9 leading-[1.2] text-basic-500">
          {t("marathon_section_how_spotlight_subtitle")}
        </h3>
        <Spotlight />
      </Section>

      <Section className="bg-basic-100 px-0" withContainer={false}>
        <Mentors />
      </Section>

      <Section
        title={t("marathon_section_benefit_title")}
        id="marathon-benefit"
        className="bg-primary-lightest"
      >
        <p className="mb-5 mt-9">
          只要申請，不論有無入選，就可以優先使用島島阿學AI個人化學習工具，包含自主學習模板、學習日誌、學習進度追蹤、AI推薦與引導等功能！
        </p>
        <p>
          而入選後，你還可以與專屬引導師與學習夥伴跑完一趟自我導向學習的馬拉松，完成遲遲未開始的計畫，並在過程中...
        </p>
        <List className="list-decimal">
          <li>習得AI世代不可或缺的「自主學習力、協作力、跨領域學習力」</li>
          <li>更深入認識自己，將學習與自身需求連結，找到學習的內在動機</li>
          <li>豐富學習資源與人脈，讓學習不再孤單，並增加學習可能性</li>
          <li>完成一份具體的學習計畫與成果，兼顧各自需求與外界認可</li>
          <li>成為助人者，完成整趟學習馬拉松者將獲得自主學習引導師優先培訓機會</li>
        </List>
      </Section>

      <Section title={t("marathon_section_reward_title")} id="marathon-reward" className="bg-white">
        <p className="mb-8 mt-3">
          在學習馬拉松尾聲，針對入選的 20
          位學員，島島阿學將舉辦成果分享日，並邀請引導師及入選者作為評審，更提供總獎金 NT$ 25,000元
          支持優秀計畫持續發展！
        </p>
        <h3 className="body-md mb-3 font-medium text-black">獎勵</h3>
        <List className="mb-5">
          <li>
            為鼓勵學員的努力與支持持續發展，成果發表將提供13個獎勵名額，獲獎學員皆可獲得獎金、獎狀，以及島島阿學專訪與媒體曝光。計劃設有多層級獎項，涵蓋「學習達人獎」、「潛力無限獎」及「人氣獎」，具體分配如下：
          </li>
          <List>
            <li>[1 名] 學習達人獎：5,000 元＋獎狀＋專訪</li>
            <li>[10 名] 潛力無限獎：2,000 元＋獎狀＋專訪</li>
            <li>[2 名] 人氣獎：1,000 元＋獎狀＋專訪</li>
            <li>不論獲獎與否，所有學員皆會有參賽證明。</li>
            <li>獎項數量與金額將視最終入選人數調整。</li>
          </List>
          <li>
            評選方式：
            <List>
              <li>學習達人獎、潛力無限獎：由評審團依據評選標準評選。</li>
              <li>
                人氣獎：學員可自行選擇於 2025/7/1-7/11
                期間，將自己的成果分享到任意社群媒體，並附上官方活動資訊，主辦單位將根據 2025/7/11
                17:00 所有社群媒體累積的按讚決定得獎者。（詳細辦法將於入選後公告）
              </li>
            </List>
          </li>
          <li>
            評選標準：
            <List>
              <li>
                學習歷程紀錄與反思完成度（60%）：可以清楚學習每一個過程的狀態（如遇的困難、解決方法、心態等）、反思以及下一步行動的改變。
              </li>
              <li>學習成果完成度（40%）：學習成果達到預期的學習目標的程度。</li>
            </List>
          </li>
        </List>

        <h3 className="body-md mb-3 font-medium text-black">分享路上的風景</h3>
        <List>
          <li>每位參與者在計劃結束時需在島島阿學網站公開學習計劃。</li>
          <li>每位參與者在計劃結束時須分享至少三個於計劃期間使用的學習資源，並分享使用心得。</li>
          <li>每位參與者需完成學習馬拉松回饋問卷。</li>
        </List>
      </Section>

      <Section
        title={t("marathon_section_apply_title")}
        id="marathon-apply"
        className="bg-[#EEF9F9]"
      >
        <div className="mt-9">
          <ApplicationInfo />
        </div>
      </Section>

      <Section title={t("marathon_section_price_title")} id="marathon-price" className="bg-white">
        <div className="mt-9">
          <Pricing />
        </div>
      </Section>

      <Section title={t("marathon_section_faq_title")} id="marathon-faq" className="bg-white">
        <div className="mt-9">
          <FAQ />
        </div>
      </Section>

      <Section
        title={t("marathon_section_organizer_title")}
        id="marathon-organizer"
        className="bg-white"
      >
        <p className="my-2.5">
          島島阿學團隊由一群大學生、教育工作者、工程師和設計師等來自不同背景的夥伴組成。
          <br />
          島島阿學的使命是透過促進自我導向學習來實現終身學習的能力。我們致力於創造一個值得信賴的自主學習生態圈，讓學習者可以交流真實的學習經驗，透過自我探索、協作和成長，學習者可以充分發揮自己的潛力，並在瞬息萬變的世界中持續發展。
          <br />
          <br />
          島島阿學： https://www.daoedu.tw/
          <br />
          聯絡方式： contact@daoedu.tw
        </p>
        <h2 className="heading-md mb-2.5 text-basic-500">{t("marathon_partners_title")}</h2>
        <p className="mb-2.5">
          魚水教育催化劑
          <br />
          青醒人共生文化智庫
          <br />
          財團法人開放文化基金會
        </p>
        <p className="mb-5">以上計畫細則主辦單位保留最終修改權利。</p>
        <p>
          群島共創有限公司
          <br />
          統一編號：00134721
        </p>
      </Section>

      <Section className="px-6 py-8 text-center md:py-[50px]">
        <ApplyButton className="mx-auto inline-block rounded-full bg-primary-base px-10 text-base font-normal leading-none text-white hover:bg-primary-base hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)]">
          {t("marathon_apply_button")}
        </ApplyButton>
      </Section>
    </>
  );
};
