import { useState, useEffect } from 'react';
import { Project as ProjectType } from '@/components/Projects/Project/type';
import { BASE_URL } from '@/constants/common';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Skeleton } from '@mui/material';
import {
  Panel,
  Title,
  Tags,
  Description,
  Divider,
  FakeInput,
  FakeCheckBox,
} from '@/components/Projects/Project/Shared';
import Button from '@/shared/components/Button';
import Dropdown from '@/shared/components/Dropdown';
import { MdMoreVert } from 'react-icons/md';
import dayjs from 'dayjs';
import { ROLE } from '@/constants/member';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
interface UserInfoBarProps {
  user: {
    name: string,
    photoURL: string,
    roleList: string[]
  }
}

const ProjectUserInfoBar = ({ user }: UserInfoBarProps) => {
  const zhRole = ROLE.find((r) => {
    return r.value === user.roleList[0];
  })?.label;

  return (
    <div className="flex flex-row gap-2 items-center">
      <img
        src={user.photoURL}
        alt={user.name}
        className="rounded-full w-[30px] h-[30px]"
      />
      <span className="font-sans text-sm font-medium text-basic-400">
        {user.name}
      </span>
      {zhRole && (
        <div className="
          py-[3px] px-[10px] bg-basic-100 rounded-[4px]
          font-sans text-sm text-basic-500 leading-[1.4]
          "
        >
          {zhRole}
        </div>
      )}
    </div>
  );
};

const PageProjectDetail = () => {
  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [project, setProject] = useState<ProjectType>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsFetchingProject(true);
        const response = await fetch(`${BASE_URL}/projects/${projectId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();

        if (responseData && responseData.id) {
          setProject(responseData);
        }
      } catch (error) {
        console.error(error);
        toast.error('系統錯誤，請稍後再試');
      } finally {
        setIsFetchingProject(false);
      }
    };

    if (projectId) {
      if (UUID_REGEX.test(projectId)) {
        fetchProject();
      } else {
        toast.error('找不到這個計劃');
      }
    }
  }, [searchParams]);

  return (
    <>
      <div className="bg-[#EEF9F9] min-h-dvh">
        <div className="w-[750px] max-w-full mx-auto py-8 px-4 md:pt-[72px] md:pb-[100px]">
          {isFetchingProject ?
            <Skeleton />
            :
            (
              <>
                <div className="mb-8 md:mb-6">
                  <Button
                    size="sm"
                    className="px-0 mb-6"
                    prefixIcon="FaAngleLeft"
                    onClick={() => router.push('/projects')}
                  >
                    返回
                  </Button>
                </div>
                <div className="px-2 mb-4 md:mb-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-center md:justify-between gap-3 mb-3">
                    <h2 className="font-sans heading-md">{project?.title}</h2>
                    <div className="ml-auto flex flex-row justify-start items-center gap-2">
                      <span className="font-sans text-basic-300 text-sm leading-normal">
                        {dayjs(project?.updatedAt).format('YYYY/MM/DD')}
                      </span>

                      {/*
                        <span className="flex flex-row items-center justify-start gap-1
                          font-sans text-basic-300 text-base leading-normal"
                        >
                          <ViewIcon />
                          9999
                        </span>
                      */}
                      <Dropdown>
                        <Dropdown.Toggle variant="solid" className="flex flex-row items-center justify-center bg-transparent text-basic-300 hover:bg-basic-100 hover:text-basic-300 hover:shadow-none p-0 w-6 h-6 text-base">
                          <MdMoreVert />
                        </Dropdown.Toggle>
                        <Dropdown.List className="top-full left-0 z-20 p-0">
                          <Dropdown.Item className="rounded-lg text-nowrap">
                            <Button
                              onClick={() => window.open('https://forms.gle/NkVbDWC3eXk4P4gv7', '_blank', 'noopener')}
                              className="w-full text-left p-2 text-basic-500 hover:bg-transparent transition"
                            >
                              檢舉
                            </Button>
                          </Dropdown.Item>
                        </Dropdown.List>
                      </Dropdown>
                    </div>
                  </div>
                  {
                    project?.user && (
                      <ProjectUserInfoBar user={project?.user} />
                    )
                  }
                </div>
                <Panel className=" bg-white mb-8 md:mb-6">
                  <Title title="計畫簡述" />
                  <Description description={project?.description || ""} />
                  <Divider />
                  <Title title="學習動機" />
                  {
                    Array.isArray(project?.motivation) && project?.motivation?.length && (
                      <Tags category="motivation_tags" tags={project?.motivation} />
                    )
                  }
                  <Description description={project?.motivationDescription || ""} />
                  <Divider />
                  <Title title="學習目標" />
                  <Description description={project?.goal || ""} />
                  <Divider />
                  <Title title="學習內容" />
                  <Description description={project?.content || ""} />
                  <Divider />
                  <Title title="學習方法與策略" />
                  {
                    Array.isArray(project?.strategy) && project?.strategy?.length && (
                      <Tags category="strategy_tags" tags={project?.strategy} />
                    )
                  }
                  <Description description={project?.strategyDescription || ""} />
                  {
                    project?.resourceName?.length && (
                      <>
                        <Divider />
                        <Title title="學習資源" />
                        <div className="flex flex-col gap-2">
                          {
                            project?.resourceName?.map((name, index) => {
                              return (
                                <FakeInput
                                  key={`resource-${name}-${index}` as string}
                                  value={name || ""}
                                />
                              );
                            })
                          }
                        </div>
                      </>
                    )
                  }
                </Panel>

                <Panel className="bg-white">
                  <h3 className="body-md font-medium mb-5">學習成果及呈現方式 *</h3>
                  {
                    (Array.isArray(project?.outcome) && project?.outcome?.length) && (
                      <Tags category="outcome_tags" tags={project?.outcome} />
                    )
                  }
                  <Description description={project?.outcomeDescription || ""} />
                  <Divider />
                  <FakeCheckBox
                    isChecked={project?.isPublic}
                    text="是否公開給所有人看到"
                  />
                </Panel>
              </>
            )
          }
        </div>
      </div>
    </>
  );
};

export default PageProjectDetail;
