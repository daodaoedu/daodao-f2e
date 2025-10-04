'use client';

import { useMemo, useState, ReactNode, CSSProperties, MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Image } from '@/shared/ui/image';
import ResponsiveModal, {
  ResponsiveModalSize,
} from '@/shared/ui/responsive-modal';
import { cn } from '@/utils/cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/shared/ui/carousel';

interface SocialLink {
  text: string;
  url: string;
}

interface SocialLinks {
  facebook?: SocialLink;
  medium?: SocialLink;
  linkedin?: SocialLink;
  threads?: SocialLink;
  researchGate?: SocialLink;
  [key: string]: SocialLink | undefined;
}

interface Mentor {
  title: string;
  name: string;
  image: string;
  tags: string[];
  social: SocialLinks;
  experiences: string[];
  introduction: string;
}

const mentors: Mentor[] = [
  {
    title: '引導師',
    name: '林怡廷',
    image: '/assets/mentors/card-partner-0.jpg',
    tags: [
      '島島阿學共同發起人',
      '臺灣實驗教育勞動合作社共同發起人',
      'g0v零時小學校專案經理',
    ],
    social: {
      facebook: {
        text: 'tiff.lin.1',
        url: 'https://www.facebook.com/tiff.lin.1',
      },
      medium: {
        text: 'ohtiffanylin',
        url: 'https://medium.com/@ohtiffanylin',
      },
    },
    experiences: [
      '2022 - Now g0v 零時政府揪松團／零時小學校專案經理',
      '2021 - Now 臺灣實驗教育勞動合作社／共同發起人、理事',
      '2020 - Now 島島阿學學習社群／共同發起人',
      '2022 - 2023 振鐸學會／專案秘書',
      '2020 - 2021 臺灣實驗教育推動中心第三屆實驗教育工作者培育計畫／學員',
      '2020 - 2022 美國實驗教育大學 Goddard College 社會創新與永續研究所 畢業',
      '2019 -  2020 青年國際實驗高等教育聯盟／公關',
      '2015 - 2019 宜蘭人文國中小 & 展賦行動學苑／教師',
    ],
    introduction:
      '#善於傾聽以及提供各種可能性 \n#熱愛釐清需求與分享資源 \n#在美國GoddardCollege用自主學習完成碩士\n\n擔任多年公關、實驗教育教師後，深感對民主教育之興趣，因而就讀美國民主教育大學 Goddard College 社會創新與永續研究所，並以創立島島阿學學習社群為題，以行動研究民主教育，並以自我導向學習完成學業。在擔任實驗教育工作者、g0v 零時小學校專案經理的經驗中，曾引導百位以上學生發展自主學習計畫與數位專案。同時也持續發起各項教育行動，如島島阿學、臺灣實驗教育勞動合作社、鯨落教育聯盟等。',
  },
  {
    title: '引導師',
    name: '許明宏',
    image: '/assets/mentors/card-partner-1.jpg',
    tags: [
      '島島阿學共同發起人',
      '軟體工程師',
      '臺灣實驗教育勞動合作社共同發起人',
      'Side Project Taiwan軟體專案社群共同發起人',
    ],
    social: {},
    experiences: [],
    introduction:
      '# 多年豐富自主學習經驗，並累積成為職涯專業能力\n# 擁有公部門、非營利組織、商業公司視野思維\n# 致力於透過設計與科技解決學習問題\n\n擁有豐富的自主學習經驗，從公部門轉領域至教育組織，擔任教育工作者，並因島島阿學網站的開發需求，自學程式設計，而後轉職為軟體工程師。在此過程中，發起了多個創新組織，包括島島阿學、臺灣實驗教育勞動合作社以及軟體專案社群。擅長自主學習、資源連結、使用者研究與軟體開發。\n於島島阿學主要負責團隊經營、使用者需求研究、產品規劃與軟體開發，致力於透過設計與科技解決學習者的實際問題，並打造一個能促進自主學習的生態系統。',
  },
  {
    title: '引導師',
    name: '謝佩君',
    image: '/assets/mentors/card-partner-2.jpg',
    tags: ['TalentLabs - Learning facilitator'],
    social: {
      linkedin: {
        text: 'Peggy, Pei-Chun Hsieh',
        url: 'https://www.linkedin.com/in/peggy-pei-chun-hsieh/',
      },
      threads: {
        text: 'unfoldingwithpeg',
        url: 'https://www.threads.net/@unfoldingwithpeg',
      },
    },
    experiences: [],
    introduction:
      '# 引導和學習體驗設計的實踐者\n# 熱愛使用各種數位工具\n# 不知不覺進入教育學習領域工作\n\n在教育和學習產業擁有超過 10 年以上經驗，曾擔任教育顧問和成功大學國際處專案經理。熱衷於分享和推廣各種引導和學習體驗設計資源和概念。從非傳統教學者的角度出發，致力於創造對學習者有意義的學習體驗。喜歡了解和學習相關的知識和技能，包括心理學、行為科學和腦科學。\n擅長線上工作坊設計與引導，並著重在個人學習與發展，並善於使用各種數位工具應用，提升線上互動及學習效益。\n\n在島島阿學主要負責產品規劃及專案管理，希望藉由應用學習理論、行為科學等概念，幫助學習者提升自我導向學理能力，讓學習不再是被動接受，而是主動探索和建構知識的過程。',
  },
  {
    title: '引導師',
    name: '沈潔伃',
    image: '/assets/mentors/card-partner-3.jpg',
    tags: [
      '魚水教育催化劑創辦人',
      '實驗教育審議委員',
      '芬蘭HundrED Ambassador, Academy Member & Advisory Board',
    ],
    social: {
      facebook: {
        text: 'joannshen0',
        url: 'https://www.facebook.com/joannshen0/',
      },
      medium: {
        text: 'tobeedu',
        url: 'https://tobeedu.medium.com/',
      },
    },
    experiences: [
      '芬蘭 HundrED／ Ambassador, Academy Member & Advisory Board',
      '國際 Sociocracy For All／華語區領導者',
      '鯨落教育聯盟／共同發起人',
      '自主學習公共化推動連線／共同召集人',
      '青年國際實驗高等教育聯盟／共同發起人',
      '中華民國振鐸學會／倡議＆研究員',
      '台灣另類暨實驗教育學會／研究員',
      '均一平台教育基金會／倡議＆研究員',
      '人文生態與教育研究室／研究員',
      '國立台灣大學 未來大學計畫／專案助理',
      '多縣市學校與非學校型態實驗教育審議委員',
      '臺灣實驗教育推動中心／自學手冊撰寫人',
      '孩籽實驗教育協會／理事',
      '第一屆雜學校／策展執行',
      '人文國中小＆人文行動高中／助理教師',
      '東華大學 多元文化教育碩士班畢業',
      '陽明交通大學 百川學士學位學程 首屆學生',
      '人文展賦行動學苑（自學團體）畢業',
    ],
    introduction:
      '# 擅於發掘學習資源與結合多元可能性\n# 沒有大學學歷但碩士畢業的實驗教育畢業生\n# 國際教育創新與學習生態系統研究者\n\n求學旅途中，我曾被標籤為拒學生，踏入實驗教育後探索自主學習的可能性，透過特殊選才進入大學不分系後，因學習不能自我決定（self-determination）而肄業，隨後以同等學力取得教育碩士學位。這些經歷讓我專注於建構民主、共榮的學習生態系統，並期待教育成為促進社會公平與變革的力量。\n\n過去十多年，我累積了豐富的社會創新實務經驗，足跡遍及國際非營利組織、社會企業、高等教育與實驗教育領域，並創辦了「魚水教育催化劑」，希望透過教育研究與內容策展推動創新與變革，創造全納的教育生態系統。',
  },
  {
    title: '引導師',
    name: '閉恩濡',
    image: '/assets/mentors/card-partner-4.jpg',
    tags: ['實驗教育工作者', '人文社會學科的信徒', '反求諸己的議題倡議者'],
    social: {},
    experiences: [
      'IDEC2024教育世界博覽會／活動組長',
      '光合人文教育工作室／行政人員',
      '振鐸學會/均優學習論壇/教育再公共化聯盟／網站編輯',
      '《地方創生的人們》／社群編輯',
      '教育部大專青年女性培力營／工作團隊',
      '中華牧人關懷協會／暑期輔導員',
      '《職人Shoukuzine》／專案編輯',
      '教育廣播電台節目《教育行動家》／共同主持人',
      '人文行動高中／助理教師',
      '紀錄片《學習的理由》／募資推廣組',
    ],
    introduction:
      '# 擅於發現與定義問題\n# 盡情探索且讓理論結合情境的學習風格\n#上大學前gap year三年從此不再當全職學生\n\n「教育」，在我的成長經歷中，扮演了多變而影響深遠的角色。11歲以前，我是班級裡品學兼優的模範，除了成績維持頂標，體育及音樂比賽也得爭著拿獎牌。直到五年級時因遭受社團同學的排擠， 我開始懼怕上學，而這也成為我與實驗教育相遇的契機。\n\n為了克服我對同儕和團體的排斥，父母將我轉學到實驗學校，重視天賦發展與無界學習的校風，讓我找到自己對「多元文化」與「教育」的興趣。高中畢業後先後於非營利組媒體平台就職，並於2019年入學陽明交通大學百川學士學程(不分系)，主修人文社會專業。至今透過專題、營隊與研究報告，實踐自己對「社會運動」，「在地文化」與「教育不平等」的關注。 ',
  },
  {
    title: '引導師',
    name: '楊逸帆',
    image: '/assets/mentors/card-partner-5.jpg',
    tags: [
      '《學習的理由》紀錄片導演',
      '青醒人共生文化智庫研究員',
      '國際實驗高教知行聯盟共同發起人',
      '日本綜合人間學會理事',
    ],
    social: {
      researchGate: {
        text: 'Adler-Yang',
        url: 'https://www.researchgate.net/profile/Adler-Yang',
      },
    },
    experiences: [
      '國際批判實在論學會／理事',
      '日本綜合人間學會／理事',
      '國家發展委員會台灣國際教育高峰會／策展人',
      '雜學校／教務主任',
      '國際實驗高教知行聯盟／共同發起人',
      '康乃爾大學Cabrera Lab認證「系統思考、製圖與領導」／訓練師',
      'Minerva大學首位台灣學生',
      '青醒人共生文化智庫／創辦人、研究員',
      '《學習的理由》紀錄片／導演',
    ],
    introduction:
      '#系統思考\n#以自我實現承擔社會需要\n#LearningByCaring\n\n「將青春期捐給教育與青少年的世界公民」是楊逸帆的自我認識。十四歲起，他便致力實踐他理解的教育本質：共構理想社會搖籃，使人人以自我實現承擔社會需要。\n\n其處女作《學習的理由》費時七年，涵蓋十五年素材，藉五位台灣體制外學生的真實故事，探究升學與分流體制對青少年的影響，並映射追求成就與認同所隱藏的迷失危機。該作已獲國內外十餘項影展認同，在台灣、香港多次被引用探討，金馬評審與金鐘導演亦分別譽之為「2016十大台灣最重要電影」「近年探討考試教育的最佳作品」，2016年起於台灣與香港各地戲院上映。\n\n青醒人共生文化智庫（原名：Awakening 青醒）是《學習的理由》催生的實驗之一。自2012年成立，成員曾橫跨兩岸三地，藉線上雜誌、特約報導、廣播電台等媒介探究台、港、中、馬、日等亞洲諸國教育與青年議題，亦數次跨洋採訪國際專家、進行田野調查，為台灣唯一當面專訪《讓天賦自由》已故作者Ken Robinson的採訪者。青醒人的媒體實驗，是以「參與式公民研究與實驗」作為根基。此外，青醒人亦以「我的教育我設計」「自我改變地圖」等工作坊，培養教育第一線的自我引導與系統探究能力，並藉累計上千人參與的一手資料庫，研發適用個體與群體的工具、策略與論述。經歷多年研究與實驗所提出並營造之改變理論、計畫與學習文化，催化並豐富了不少兩岸三地青少年的自主學習經驗與開創學習資源、社會行動之能力，其中不乏後來免試錄取競爭激烈之大學，甚至創立教育與永續事業、總統教育獎、北京教育創新大獎獲獎者（如本計畫中的兩位mentor）。楊逸帆亦以青醒人之行動研究成果於2015年入圍彼得・提爾青年改變家計畫（Thiel Fellowship: 20 under 20）複選，獲邀至矽谷參與彼得・提爾基金會年度高峰會。\n\n此外，他亦曾以資源媒合、專業諮詢、評審、統籌、理事等角色參與其他教育組織，如台灣DFC、不太乖教育節、雜學校、香港教育大同、美國國際另類教育資源組織（AERO）、日本綜合人間學會、國際批判實在論學會（IACR）等。曾任國立成功大學教育學程、香港教育燃薪師資培訓計畫講師，於首爾ANYSE論壇、美國AERO論壇、尼泊爾國際民主教育年會（IDEC）等場合演說，於TEDxTaipei演講更獲2014年度十大精選。\n\n雖以教育為起點，楊逸帆的使命是探尋養生而共生世界的可能。\n\n作為社會系統變革者，致力於減輕社會對體制教育的依賴，讓人人成為有系統觀與自我覺察引導能力、不再那麼依賴體制的「自我改變家」。同時，身為社會系統研究者，持續探究世界危機之系統關聯與關鍵因子，文章散見於中英日文專欄、期刊、專書。',
  },
  {
    title: '助教小天使',
    name: '蘇冠彰',
    image: '/assets/mentors/card-partner-6.jpg',
    tags: [
      '島島阿學核心團隊',
      '島島阿學行銷與網站改版開發夥伴',
      '中原大學應用華語系與心理學系大四生',
    ],
    social: {
      medium: {
        text: 'kangarooblog',
        url: 'https://kangarooblog.medium.com/',
      },
    },
    experiences: [
      '2021~Now 島島阿學／核心團隊',
      '2024 直覺職掘國中生涯探索營隊／助教',
      '2024 One-Forty 社團法人台灣四十分之一移工教育文化協會／課程培力組助教',
      '2024 IDEC 臺灣教育世界博覽會／活動組組員',
      '2023 人生書家－高中生生涯探索／共同創辦人',
      '2023 EdYouth社團法人臺灣一滴優教育協會／影響力發展組',
    ],
    introduction:
      '#資源橋梁的陪伴者\n#自主學習研究各種數位工具\n#教育與助人工作不斷的走跳者\n\n「以『人』為信仰核心，使『人』成為一個真正的人。」\n嗨！大家我是袋鼠，MBTI是綠老頭又是非常罕見的INFJ提倡者！\n熱愛袋鼠、倉鼠、貓咪，以及是個咖啡成癮者（工作需要咖啡才能動腦XD）\n也喜歡各種社會運動以及議題討論\n\n國高中，討厭教育制度帶給我的厭惡感（沒錯，討厭到寫了三篇讀書心得，有兩篇還是特優😂），開始反思教育的本質與意義。\n到了大學，跨出學校與文理組的邊界後，不斷的自主學習各種技能與領域，並看見教育與生涯的多樣性與選擇性，開始行動以助人角度為主的社會設計與社會創新的旅程。而未來的我將會持續在「助人工作」與「教育創新」繼續創造理想社會，並能人、關懷與陪伴的角度，走入各種教育與社會議題現場。\n如果對於NPO社創或是心理學相關問題有興趣的都可以來討論唷！',
  },
];

interface MentorCardProps {
  mentor: Mentor | undefined;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const MentorCard = ({
  mentor,
  children,
  className,
  style,
  onClick,
}: MentorCardProps) => (
  <button
    key={mentor?.name}
    type="button"
    className={cn(
      'group relative aspect-[285/307] w-[285px] shrink-0 overflow-hidden rounded-lg',
      className
    )}
    style={style}
    onClick={onClick}
  >
    <div className="absolute inset-0 overflow-hidden">
      <div className="size-full scale-110 transition-transform duration-300 group-hover:scale-125">
        <Image
          src={mentor?.image ?? ''}
          alt={mentor?.name ?? ''}
          fill
          className="object-cover"
        />
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-base/80" />
    {children}
  </button>
);

interface TagProps {
  text: string;
  className?: string;
}

const Tag = ({ text, className }: TagProps) => (
  <div
    title={text}
    className={cn(
      'body-sm truncate rounded-[4px] bg-primary-lightest px-2 py-0.5 text-basic-400',
      className
    )}
  >
    {text}
  </div>
);

export const Mentors = () => {
  const [activeMentorName, setActiveMentorName] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeMentor = useMemo<Mentor | undefined>(
    () => mentors.find((mentor) => mentor.name === activeMentorName),
    [activeMentorName]
  );

  const handleOpenModal = (name: string): void => {
    setActiveMentorName(name);
    setIsOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="mb-9">
        <Carousel className="mx-6 lg:ml-60" opts={{ align: 'start' }}>
          <div className="flex items-center justify-between lg:mr-60">
            <h2 className="heading-md text-basic-500" id="marathon-mentor">
              引導師介紹
            </h2>
            <div className="flex gap-2">
              <CarouselPrevious className="static mx-1 translate-y-0" />
              <CarouselNext className="static mx-1 translate-y-0" />
            </div>
          </div>
          <div className="mt-9">
            <CarouselContent>
              {mentors.map((mentor) => (
                <CarouselItem key={mentor.name} className="basis-auto">
                  <MentorCard
                    mentor={mentor}
                    className="group cursor-pointer"
                    onClick={() => handleOpenModal(mentor.name)}
                    style={{}}
                  >
                    <div className="absolute inset-x-0 bottom-0 pt-4">
                      <div className="flex gap-2 px-3">
                        {mentor.tags.slice(0, 1).map((tag, index) => (
                          <Tag
                            key={tag}
                            text={tag}
                            className={index === 0 ? 'shrink-0' : ''}
                          />
                        ))}
                      </div>
                      <div className="heading-md mt-2 px-3 pb-3 text-start text-white">
                        {mentor.title} | {mentor.name}
                      </div>
                      <div className="flex items-center justify-end gap-1 bg-white px-3 py-2 text-gray-400 group-hover:text-primary-base">
                        more
                        <ArrowRight className="text-base" />
                      </div>
                    </div>
                  </MentorCard>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>

      <ResponsiveModal
        open={isOpen}
        onClose={handleCloseModal}
        hasCloseButton
        size={ResponsiveModalSize.Medium}
      >
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <picture>
            <MentorCard
              mentor={activeMentor}
              className="pointer-events-none w-full cursor-default md:w-[200px]"
              style={{}}
              onClick={() => {}}
            />
          </picture>
          <div className="flex-1">
            <div className="heading-md mb-3 text-basic-500">
              {activeMentor?.title} | {activeMentor?.name}
            </div>
            <div className="mb-3 flex flex-col items-start gap-2">
              {activeMentor?.tags.map((tag) => (
                <Tag key={tag} text={tag} className="text-wrap" />
              ))}
            </div>
            <div className="flex flex-col items-start gap-2.5">
              {Object.entries(activeMentor?.social || {}).map(
                ([key, socialLink]) =>
                  socialLink && (
                    <a
                      key={key}
                      className="body-sm flex items-center gap-1 text-primary-base"
                      href={socialLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {socialLink.text}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
        <section className="mb-4">
          {activeMentor && activeMentor.experiences.length > 0 && (
            <>
              <h3 className="body-md mb-2 font-bold text-basic-400">經歷</h3>
              <ul>
                {activeMentor.experiences.map((experience) => (
                  <li key={experience} className="body-sm text-basic-400">
                    {experience}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section>
          <h3 className="body-md mb-2 font-bold text-basic-400">自我介紹</h3>
          <p className="body-sm whitespace-pre-wrap text-basic-400">
            {activeMentor?.introduction || ''}
          </p>
        </section>
      </ResponsiveModal>
    </>
  );
};
