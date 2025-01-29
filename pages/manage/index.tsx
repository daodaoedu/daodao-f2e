import Link from 'next/link';
import { Children, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import { CiCircleChevRight, CiCircleChevLeft } from 'react-icons/ci';
import { GoArrowUpRight } from 'react-icons/go';
import { PiCalendarBlankBold } from 'react-icons/pi';
import ManageLayout from '@/layout/ManageLayout';
import useClickOutside from '@/hooks/useClickOutside';
import SEOConfig from '@/shared/components/SEO';
import Dropdown from '@/shared/components/Dropdown';
import Button from '@/shared/components/Button';
import Collapse from '@/shared/components/Collapse';
import ReviewCard from '@/components/Review/Card';
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

interface CalendarProps {
  date: Dayjs;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  onChange: (date: Dayjs) => void;
}

const Calendar = ({ date, maxDate, minDate, onChange }: CalendarProps) => {
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
      <div className="mb-6 pl-1 pr-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl shadow-lg shadow-basic-200/40">
        <Button
          className="px-3 py-2.5 flex items-center gap-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <PiCalendarBlankBold className="size-5 pointer-events-none" />
          <div className="heading-sm">
            {date?.format('YYYY/MM/DD')}（{date?.format('dd')}）任務
          </div>
        </Button>
        <div className="flex items-center justify-between sm:justify-start gap-0.5">
          <Button className="px-3 py-2 sm:px-1 body-lg" onClick={handleToday}>
            今日
          </Button>
          <div>
            <Button
              className="p-1"
              isDisabled={date.isBefore(minDate) || date.isSame(minDate, 'day')}
              onClick={() => onChange(date.subtract(1, 'day'))}
            >
              <CiCircleChevLeft className="size-8" />
            </Button>
            <Button
              className="p-1"
              isDisabled={date.isAfter(maxDate) || date.isSame(maxDate, 'day')}
              onClick={() => onChange(date.add(1, 'day'))}
            >
              <CiCircleChevRight className="size-8" />
            </Button>
          </div>
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
          minDate={minDate}
          maxDate={maxDate}
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
  defaultOpen?: boolean;
}

const Project = ({ href, title, children, defaultOpen }: ProjectProps) => {
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
      <Collapse defaultOpen={defaultOpen}>
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

const Manage = () => {
  const [date, setDate] = useState<Dayjs>(dayjs().startOf('day'));
  const pathname = usePathname();

  // const MIN_DATE = dayjs(new Date('2025-02-09'));
  // const MAX_DATE = dayjs(new Date('2025-07-12'));
  const MIN_DATE = dayjs().startOf('day').subtract(5, 'day');
  const MAX_DATE = dayjs().startOf('day').add(5, 'day');

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
      <Calendar
        date={date}
        onChange={setDate}
        maxDate={MAX_DATE}
        minDate={MIN_DATE}
      />
      <Project title="學習計畫名稱一" href="/manage#1" defaultOpen>
        <div>第一週</div>
        <div>第三週</div>
      </Project>
      <Project title="學習計畫名稱二" href="/manage#2">
        <div>第一週</div>
        <div>第三週</div>
      </Project>
      <ReviewCard detailLink="/manage/project/review/detail?id=1" />
    </LocalizationProvider>
  );
};

Manage.getLayout = ManageLayout;

export default Manage;
