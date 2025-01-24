import Link from 'next/link';
import { Children, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import { AiOutlineEye, AiOutlineMore } from 'react-icons/ai';
import { CiCircleChevRight, CiCircleChevLeft } from 'react-icons/ci';
import { FaArrowRight } from 'react-icons/fa6';
import { GoArrowUpRight } from 'react-icons/go';
import { PiCalendarBlankBold } from 'react-icons/pi';
import ManageLayout from '@/layout/ManageLayout';
import useClickOutside from '@/hooks/useClickOutside';
import SEOConfig from '@/shared/components/SEO';
import Dropdown from '@/shared/components/Dropdown';
import Button from '@/shared/components/Button';
import Collapse from '@/shared/components/Collapse';
import { cn } from '@/utils/cn';
import 'dayjs/locale/zh-tw';

dayjs.locale('zh-tw');

const Header = () => {
  return (
    <div className="mb-6 p-2 flex items-center justify-between">
      <h2 className="heading-sm text-basic-500">星期一也認真的你真棒！</h2>
      <Dropdown>
        <Dropdown.Toggle variant="solid" className="mb-1" withIcon>
          新增
        </Dropdown.Toggle>
        <Dropdown.List className="top-full left-0 -mt-1 z-20">
          <Dropdown.Item className="rounded-lg text-nowrap hover:bg-primary-lightest">
            <div className="p-2 text-basic-300 cursor-not-allowed">
              新增啥？
            </div>
          </Dropdown.Item>
        </Dropdown.List>
      </Dropdown>
    </div>
  );
};

// const MIN_DATE = dayjs(new Date('2025-02-09'));
// const MAX_DATE = dayjs(new Date('2025-07-12'));
const MIN_DATE = dayjs().startOf('day').subtract(5, 'day');
const MAX_DATE = dayjs().startOf('day').add(5, 'day');

interface CalendarProps {
  date: Dayjs;
  onChange: (date: Dayjs) => void;
}

const Calendar = ({ date, onChange }: CalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { ref } = useClickOutside<HTMLDivElement>({ setState: setIsOpen });

  const handleToday = () => {
    onChange(dayjs().startOf('day'));
  };

  const handleChange = (value: Dayjs | null) => {
    if (!value) return;
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="mb-6 px-4 py-3.5 flex items-center justify-between bg-white rounded-xl shadow-lg shadow-basic-200/40">
        <Button
          className="p-0 flex items-center gap-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <PiCalendarBlankBold className="size-5 pointer-events-none" />
          <div className="heading-sm text-basic-500">
            {date?.format('YYYY/MM/DD')}（{date?.format('dd')}）任務
          </div>
        </Button>
        <div className="flex items-center gap-2.5">
          <Button className="p-0 body-lg text-basic-400" onClick={handleToday}>
            今日
          </Button>
          <Button
            className="p-0"
            isDisabled={date.isBefore(MIN_DATE) || date.isSame(MIN_DATE, 'day')}
            onClick={() => onChange(date.subtract(1, 'day'))}
          >
            <CiCircleChevLeft className="size-8 text-basic-400" />
          </Button>
          <Button
            className="p-0"
            isDisabled={date.isAfter(MAX_DATE) || date.isSame(MAX_DATE, 'day')}
            onClick={() => onChange(date.add(1, 'day'))}
          >
            <CiCircleChevRight className="size-8 text-basic-400" />
          </Button>
        </div>
      </div>
      <div
        className={cn(
          'absolute top-full mt-1 z-20',
          'bg-basic-white shadow-lg rounded-xl',
          'transition-[transform,opacity] origin-top',
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
        )}
      >
        <CalendarPicker
          date={date}
          onChange={handleChange}
          views={['day']}
          minDate={MIN_DATE}
          maxDate={MAX_DATE}
          classes={{
            root: '[&_.Mui-selected]:!text-basic-white',
          }}
        />
      </div>
    </div>
  );
};

interface ProjectProps {
  href: string;
  title: string;
  children: React.ReactNode;
}

const Project = ({ href, title, children }: ProjectProps) => {
  const childrenElements = useMemo(
    () =>
      Children.map(children, (child) => ({ child, id: crypto.randomUUID() })),
    [children]
  );

  return (
    <div
      className={cn(
        'relative mb-6 px-3 py-4 bg-white rounded-2xl',
        'after:content-[""] after:absolute after:top-0 after:left-3',
        'after:h-[5px] after:w-2/5 md:after:w-1/2',
        'after:bg-primary-base after:rounded-full after:z-10'
      )}
    >
      <Collapse>
        <Collapse.Toggle className="w-full px-3 py-2 justify-between" withIcon>
          <Link
            href={href}
            className="flex items-center gap-2 body-md text-basic-500"
          >
            {title}
            <GoArrowUpRight className="stroke-1" />
          </Link>
        </Collapse.Toggle>
        <Collapse.List className="*:my-2 *:aria-hidden:my-0">
          {Array.isArray(childrenElements) &&
            childrenElements.map(({ child, id }) => (
              <Collapse.Item key={id}>
                <div className="p-2.5 bg-basic-100 rounded-xl">{child}</div>
              </Collapse.Item>
            ))}
        </Collapse.List>
      </Collapse>
    </div>
  );
};

const Review = () => {
  return (
    <div className="p-10 bg-white rounded-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 body-sm bg-primary-base rounded-full text-white">
            覆盤二
          </div>
          <div className="body-md text-basic-500">學習計畫一</div>
          <div className="body-md text-primary-base">第五週</div>
        </div>
        <div className="flex items-center gap-2">
          <div>填寫日期 2024/12/11</div>
          <Button className="p-0">
            <AiOutlineEye className="size-5" />
          </Button>
          <Button className="p-0">
            <AiOutlineMore className="size-5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="body-lg text-basic-500">這段時間的整體心情....</p>
          <div className="p-2 bg-basic-100 rounded">😊 開心</div>
        </div>
        <div className="flex items-center gap-1 body-md text-basic-300">
          更多
          <FaArrowRight />
        </div>
      </div>
    </div>
  );
};

const Manage = () => {
  const [date, setDate] = useState<Dayjs>(dayjs().startOf('day'));
  const pathname = usePathname();

  const SEOData = useMemo(
    () => ({
      title: '我的小島｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${pathname}`,
    }),
    [pathname]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <SEOConfig data={SEOData} />
      <Header />
      <Calendar date={date} onChange={setDate} />
      <Project title="學習計畫名稱一" href="/manage#1">
        <div>第一週</div>
        <div>第三週</div>
      </Project>
      <Review />
    </LocalizationProvider>
  );
};

Manage.getLayout = ManageLayout;

export default Manage;
