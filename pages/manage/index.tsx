import toast from 'react-hot-toast';
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

import config from '@/constants/config';
import getManageLayout from '@/layout/ManageLayout';
import useClickOutside from '@/hooks/useClickOutside';
import { useProjectReviewList, useProjectList } from '@/hooks/api/project';
import SEOConfig from '@/shared/components/SEO';
import AccessDenied from '@/shared/components/AccessDenied';
import Button from '@/shared/components/Button';
import Collapse from '@/shared/components/Collapse';
import Dropdown from '@/shared/components/Dropdown';
import ReviewCard from '@/components/Review/Card';
import MilestoneItem from '@/components/Milestones/MilestoneItem';
import { RoleEnum, useAuth } from '@/contexts/Auth';
import { MilestonesProvider } from '@/contexts/Milestones';
import { ProjectProvider } from '@/contexts/Project';
import { cn } from '@/utils/cn';
import 'dayjs/locale/zh-tw';

dayjs.locale('zh-tw');

const HEADER_TITLES = [
  '今天的每一小步，都在建立你的學習動能！',
  '每個挑戰都讓自己更強大！',
  '你一定可以的 - 看看你已經走了多遠！',
  '今日的努力，就是明日的能力！',
  '用自己的步調學習，才能學得更持久',
  '今天想精進哪一件小事呢？',
  '保持好奇心，就能有新發現！',
  '每次練習都在重塑你的腦力！',
  '選擇自己的學習路徑，是你的超能力！',
  '慶祝進步，而不只是完美！',
  '準備好開始今天的學習冒險了嗎？',
  '你的學習旅程是獨一無二的 - 好好把握！',
  '小小的進步累積成大大的成就！',
  '今天會發現關於自己的什麼新事物呢？',
  '你的努力塑造你的能力！',
  '學習是你的旅程 - 決定自己的步調！',
  '每個面對的挑戰都使你更強大！',
  '讓好奇心當你的指南針吧！',
  '今日的練習，造就明日的專業！',
  '你正在建立受用一生的能力！',
];

const Header = () => {
  return (
    <div className="mb-6 p-2 flex items-center justify-between">
      <h2 className="heading-sm text-basic-500">
        {HEADER_TITLES[dayjs().get('hour') % HEADER_TITLES.length]}
      </h2>
      <Dropdown>
        <Dropdown.Toggle variant="solid" className="mb-1" withIcon>
          新增
        </Dropdown.Toggle>
        <Dropdown.List className="top-full right-0 z-20">
          <Dropdown.Item className="rounded-lg text-nowrap">
            <Button
              className="hover:bg-primary-lightest"
              onClick={() => toast.error('功能尚未開放')}
            >
              學習計畫
            </Button>
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

const Main = ({ date }: { date: Dayjs }) => {
  const { data: projects, mutate } = useProjectList({ isMe: true });
  const { data: reviews } = useProjectReviewList(projects?.[0]?.id);

  const currentProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.map((project) => ({
      ...project,
      milestones:
        project?.milestones?.filter((milestone) =>
          date.isBetween(
            dayjs(milestone.startDate),
            dayjs(milestone.endDate),
            'day',
            '[]'
          )
        ) ?? [],
    }));
  }, [projects, date]);

  const currentReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return reviews.filter((review) => date.isSame(review.createdAt));
  }, [reviews, date]);

  return (
    <>
      <ul>
        {currentProjects.map((project, index) => (
          <li key={project.id}>
            <Project
              title={project.title}
              href={`/manage/project?id=${project.id}`}
              defaultOpen={index === 0}
            >
              {project.milestones.map((milestone) => (
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  isLgScreen={false}
                  projectId={project.id}
                  onRefreshData={mutate}
                />
              ))}
            </Project>
          </li>
        ))}
      </ul>

      <ul>
        {currentReviews.map((review) => (
          <li key={review.id}>
            <ReviewCard
              data={review}
              detailLink="/manage/project/review/detail?id=1"
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const Manage = () => {
  const [date, setDate] = useState<Dayjs>(dayjs().startOf('day'));
  const { user } = useAuth();
  const pathname = usePathname();
  const canManage = useMemo(() => {
    const permissions = [
      RoleEnum.MarathonApplicant,
      RoleEnum.MarathonParticipant,
      RoleEnum.Mentor,
      RoleEnum.Admin,
      RoleEnum.SuperAdmin,
    ];
    return user ? permissions.includes(user?.role) : false;
  }, [user]);

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
        maxDate={config.marathonEndDate}
        minDate={config.marathonStartDate}
      />
      {canManage ? <Main date={date} /> : <AccessDenied />}
    </LocalizationProvider>
  );
};

Manage.getLayout = (page: React.ReactElement) =>
  getManageLayout(
    <ProjectProvider>
      <MilestonesProvider>{page}</MilestonesProvider>
    </ProjectProvider>
  );

export default Manage;
