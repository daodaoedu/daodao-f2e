import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/components/SEOConfig';
import { Box, Skeleton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EastIcon from '@mui/icons-material/East';
import { BASE_URL } from "@/constants/common";
import { cn } from '@/utils/cn';
import dayjs from 'dayjs';
import { ISOToWeekday } from '@/components/Marathon/SignUp/dateMap';
import { EDUCATION, ROLE } from '@/constants/member';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ShareButtonGroup from '@/components/Group/detail/ShareButtonGroup';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { z } from 'zod';
import { AREA_DELIMITER, AREAS, TAIWAN_OPTION } from '@/constants/areas';
import { mapToTable } from '@/utils/helper';

const AREAS_TABLE = mapToTable(AREAS);

const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

function validateIdWithZod(id) {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result
    };
  } catch (error) {
    return {
      isValid: false,
      error
    };
  }
}

const Panel = ({ children, className = "" }) => {
  return (
    <div className={
      cn('w-full sm:w-[750px] mx-auto rounded-2xl p-10', className)
    }
    >
      {children}
    </div>
  );
};
const Title = ({ title, isLoading = true }) => {
  return isLoading ? (
    <Skeleton animation="wave" width="60%" height="28px" />
  ) : (
    <h3 className="text-basic-500 body-md font-medium mb-2 font-sans">
      {title}
    </h3>
  );
};
const Divider = () => {
  return (
    <hr className="my-5 border-basic-100" />
  );
};

const Description = ({ description, isLoading = true }) => {
  return isLoading ? (
    <Skeleton animation="wave" width="80%" height="28px" />
  ) : (
    <p className="body-md font-sans">{description}</p>
  );
};

const Tags = ({ tags, isLoading = true }) => {
  return isLoading ? (
    <Skeleton animation="wave" width="30%" height="28px" />
  ) : (
    <div className="flex flex-row gap-2 mb-2">
      {tags.map((tag, /* _i */) => {
        return (
          <span key={tag} className="text-sm text-[#2D3648] px-2 bg-primary-lightest rounded-[4px] py-[2px] font-sans">{tag}</span>
        );
      })}
    </div>
  );
};

const FakeInput = ({ value, isLoading = true }) => {
  return isLoading ? (
    <Skeleton animation="wave" width="80%" height="45px" />
  ) : (
    <div
      className="py-3 px-4
      border border-solid border-basic-200
      rounded-lg font-sans"
    >
      {value}
    </div>
  );
};

const FakeDateSelector = ({ title, value, type = "date", isLoading = true }) => {
  const skeletonContent = (
    <Skeleton animation="wave" width="100%" height="45px" />
  );

  const content = (
    <div className="w-full flex flex-row items-center justify-between py-3 px-4 border border-solid border-basic-200 rounded-lg">
      <p className="mr-5 text-basic-300">{value}</p>
      {type === "date" ? (
        <CalendarTodayIcon
          className="text-basic-300"
          sx={{
            width: '18px',
            height: '18px'
          }}
        />
      ) : (
        <ExpandMoreIcon
          className="text-basic-300"
        />
      )
      }
    </div>
  );
  return (
    <>
      <span className="text-sm text-basic-400 pl-1">{title}</span>
      {isLoading ? skeletonContent : content}
    </>
  );
};
const SubMilestone = ({ subMilestone, index }) => {
  const weekDay = subMilestone.dates.map((isoDate) => {
    return ISOToWeekday(isoDate);
  });
  return (
    <div className="w-full bg-white rounded-lg py-3 px-4">
      <p className="mb-2">
        {`${index + 1}. `}{subMilestone.name}
      </p>
      <div className="flex flex-row items-center justify-start">
        <CalendarTodayIcon
          className="text-basic-300 mr-[5px]"
          sx={{
            width: '16px',
            height: '16px'
          }}
        />
        <p className="font-sans text-basic-300 text-xs font-light">
          {weekDay.join(', ')}
        </p>
      </div>
    </div>
  );
};
const LearningMarathonProfile = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '島島盃 - 2025 春季學習馬拉松｜多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath],
  );

  const biweeklyMilestonesLength = 11;
  const { id } = router.query;
  const [fullUrl, setFullUrl] = useState('');

  // states for marathon profile
  const [data, setData] = useState({});
  const [loadingMarathon, setLoadingMarathon] = useState(false);
  const [loadedMarathon, setLoadedMarathon] = useState(false);

  // states for milestones data
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("每週");

  // states for user data
  const [user, setUser] = useState({});
  const [role, setRole] = useState(null);
  const [eduStep, setEduStep] = useState(null);
  const [locations, setLocations] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // set url for social share
  useEffect(() => {
    setFullUrl(window.location.href);
  }, [router]);

  // set data for showing marathon profile
  useEffect(() => {
    if (id) {
      // validate id before fetching
      const validation = validateIdWithZod(id);
      if (!validation.isValid) {
        router.push('/');
        return;
      }
      const fetchMarathonData = async () => {
        try {
          setLoadingMarathon(true);
          const response = await fetch(`${BASE_URL}/marathons/${encodeURIComponent(id)}`);

          // check: if response 200
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // check: if response data valid
          const responseData = await response.json();

          if (!responseData || !responseData.data) {
            throw new Error('Invalid response structure');
          }

          // json parse response data
          const result = responseData.data;

          // set marathon data
          setData(result);
          setLoadedMarathon(true);

          // set milestone data
          if (result.milestones.length === biweeklyMilestonesLength) {
            setFrequency('每兩週');
          }
          setStartDate(dayjs(result.milestones[0].startDate).format('YYYY-MM-DD'));
          setEndDate(dayjs(result.milestones.at(-1).endDate).format('YYYY-MM-DD'));
          setLoadingMarathon(false);
        } catch (error) {
          console.error('error fetching data', error);
        }
      };
      fetchMarathonData();
    }
  }, [id]);

  // set data for showing user data by marathon.userId
  useEffect(() => {
    if (loadedMarathon) {
      const fetchUserData = async () => {
        try {
          setLoadingUser(true);
          const response = await fetch(`${BASE_URL}/users/${data.userId}`);

          // check: if response 200
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // check: if data valid
          const responseData = await response.json();
          if (!responseData || !responseData.data) {
            throw new Error('Invalid response structure');
          }

          // check: if data exist
          if (!responseData.data.length) {
            throw new Error('User Not Found');
          }
          const result = responseData.data[0];

          // set userData
          setUser(result);

          // set user role
          if (result.roleList[0]) {
            const roleZh = ROLE.find((option) => {
              return option.value === result.roleList[0];
            });
            if (roleZh) {
              setRole(roleZh.label);
            } else {
              setRole('暫無資料');
            }
          } else {
            setRole('暫無資料');
          }

          // set user edu stage
          if (result.educationStage) {
            const eduZh = EDUCATION.find((option) => {
              return option.value === result.educationStage;
            });
            if (eduZh) {
              setEduStep(eduZh.label);
            } else {
              setEduStep('暫無資料');
            }
          } else {
            setEduStep('暫無資料');
          }

          if (result.location) {
            setLocation(result.location);
            setLocations(result.location.split(AREA_DELIMITER).map((item) => AREAS_TABLE[item] ?? item));
          }

          setLoadingUser(false);
        } catch (error) {
          console.error('error fetching user data', error);
        }
      };
      fetchUserData();
    }
  }, [loadedMarathon]);
  return (
    <Box
      style={{
        background: 'linear-gradient(0deg, #F3FCFC 0%, #F3FCFC 100%), #F7F8FA'
      }}
      className="px-4 py-5 sm:py-[50px]"
    >
      <SEOConfig {...SEOData} />
      <Panel className="mb-4 p-0">
        <button
          type="button"
          onClick={() => router.push('/profile?id=my-marathon')}
          className="flex flex-row items-center justify-start text-basic-400 font-sans body-sm"
        >
          <NavigateBeforeIcon />
          返回
        </button>
      </Panel>
      <Panel className="mb-4 p-[10px] flex flex-col gap-2 justify-start items-start">
        <div className="w-full flex flex-row justify-between">
          <div className="py-1 px-[10px] flex flex-row items-center justify-center gap-1 rounded-[4px] bg-primary-lightest">
            <FiberManualRecordIcon
              className="text-primary-base"
              sx={{ width: '8px', height: '8px' }}
            />
            <span className="text-primary-base font-sans text-xs font-medium">
              學習馬拉松
            </span>
          </div>
          {
            loadingMarathon ? (
              <Skeleton animation="wave" width="80%" height="28px" />
            ) : (
              <ShareButtonGroup
                title={data.title}
                url={fullUrl}
                hashtag={data.title}
                text={data.description}
              />
            )
          }
        </div>
        {
          loadingMarathon ? (
            <>
              <Skeleton animation="wave" width="80%" height="30px" />
              <Skeleton animation="wave" width="20%" height="30px" />
            </>
          ) : (
            <>
              <h2 className="text-basic-400 heading-md">{data.title}</h2>
              <p className="bg-basic-100 py-1 px-[10px] rounded-[4px] inline-block text-basic-500 body-sm">{data.isPublic ? '公開' : '不公開'}</p>
            </>
          )
        }
      </Panel>

      <Panel className="mb-4 bg-white p-[30px] flex flex-row items-center justify-start">
        {loadingUser ? (
          <div className="flex flex-col w-full">
            <Skeleton animation="wave" width="100%" height="28px" className="mb-2" />
            <Skeleton animation="wave" width="100%" height="20px" />
          </div>
        ) : (
          <>
            <img className="rounded-full size-10 mr-3" src={user.photoURL} alt={user.name} />
            <div className="mr-auto">
              <div className="flex flex-row items-center justify-start gap-[10px] mb-[2px]">
                <p className="text-basic-400 font-sans">{user.name}</p>
                <p className="py-1 px-[10px] body-sm text-basic-500 font-sans bg-basic-100 rounded-[4px]">{eduStep}</p>
              </div>
              <p className="body-sm text-basic-300 font-sans">{role}</p>
            </div>
            <div className="mb-auto flex flex-row items-center gap-1 sm:mr-[30px]">
              {location && (
                <>
                  <LocationOnOutlinedIcon
                    className="text-basic-400"
                    sx={{
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span className="text-basic-400">{location
                    ? location.length >= 2
                      ? locations
                          .join('')
                          .replace(TAIWAN_OPTION.value, '')
                          .replace('null', '')
                      : locations.join('')
                    : '-'}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </Panel>

      <Panel className="mb-4 bg-white">
        <Title title="計畫簡述" isLoading={loadingMarathon} />
        <Description description={data.description} isLoading={loadingMarathon} />
        <Divider />
        <Title title="學習動機" isLoading={loadingMarathon} />
        {
          data.motivation?.tags.length && (
            <Tags tags={data.motivation.tags} isLoading={loadingMarathon} />
          )
        }
        <Description description={data.motivation?.description} isLoading={loadingMarathon} />
        <Divider />
        <Title title="學習目標" isLoading={loadingMarathon} />
        <Description description={data.goals} isLoading={loadingMarathon} />
        <Divider />
        <Title title="學習內容" isLoading={loadingMarathon} />
        <Description description={data.content} isLoading={loadingMarathon} />
        <Divider />
        <Title title="學習方法與策略" isLoading={loadingMarathon} />
        {
          data.strategies?.tags.length && (
            <Tags tags={data.strategies.tags} isLoading={loadingMarathon} />
          )
        }
        <Description description={data.strategies?.description} isLoading={loadingMarathon} />
        <Divider />
        <Title title="學習資源" isLoading={loadingMarathon} />
        <FakeInput value={data.resources} isLoading={loadingMarathon} />
      </Panel>

      <Panel className="mb-4 p-[30px] bg-white">
        <h3 className="body-md font-medium mb-5">
          學習里程碑 *
        </h3>
        <div className="w-full flex flex-col sm:flex-row items-start gap-2 sm:gap-[10px] mb-5">
          <div className="w-full sm:w-auto">
            <FakeDateSelector title="開始日期" value={startDate} type="date" isLoading={loadingMarathon} />
          </div>

          <div className="w-full sm:w-auto">
            <FakeDateSelector title="結束日期" value={endDate} type="date" isLoading={loadingMarathon} />
          </div>

          <div className="w-full sm:w-auto">
            <FakeDateSelector title="頻率" value={frequency} type="frequency" isLoading={loadingMarathon} />
          </div>
        </div>

        {
          ((!loadingMarathon) && (data.milestones?.length > 0)) && (
            <div className="flex flex-col gap-5">
              {
                data.milestones.map((milestone, index) => {
                  let weeks = [];
                  if (frequency === '每兩週') {
                    weeks = ['一', '三', '五', '七', '九', '十一', '十三', '十五', '十七', '十九', '二十一'];
                  } else {
                    weeks = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '二十一', '二十二'];
                  }
                  const key = dayjs(milestone.startDate).format('YYYY/MM/DD');
                  return (
                    <div
                      key={key}
                      className="w-full flex flex-col justify-start items-start gap-2 rounded-xl bg-basic-100 p-[10px]"
                    >
                      <div className="w-full flex flex-row items-center justify-between">
                        <div className="py-[5px] px-5 text-white bg-primary-base rounded-[20px]">
                          <span className="font-sans body-sm">第{weeks[index]}週</span>
                        </div>
                        <div className="flex flex-row items-center gap-1 pr-1">
                          <p className="text-basic-300">{dayjs(milestone.startDate).format('YYYY/MM/DD')}</p>
                          <EastIcon
                            className="text-basic-300"
                            sx={{
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          <p className="text-basic-300">{dayjs(milestone.endDate).format('YYYY/MM/DD')}</p>
                        </div>
                      </div>
                      <div className="w-full py-3 px-4 rounded-lg bg-white border border-solid border-basic-200 box-sizing ">{milestone.name}</div>
                      {(milestone.subMilestones.length > 0) && (
                        milestone.subMilestones.map((subMilestone, i) => {
                          const subKey = `${key}-sub-${i}`;
                          return (
                            <SubMilestone
                              subMilestone={subMilestone}
                              index={i}
                              key={subKey}
                            />
                          );
                        })
                      )}
                    </div>
                  );
                })
              }
            </div>
          )
        }
      </Panel>

      <Panel className="bg-white">
        <Title title="學習成果" isLoading={loadingMarathon} />
        {
          (data.outcomes?.tags.length) && (
            <Tags tags={data.outcomes.tags} isLoading={loadingMarathon} />
          )
        }
        <Description description={data.outcomes?.description} isLoading={loadingMarathon} />
      </Panel>
    </Box>
  );
};

export default LearningMarathonProfile;
