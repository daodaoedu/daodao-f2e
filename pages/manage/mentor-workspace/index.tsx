import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaAngleLeft } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Container from "@/shared/components/Container";
import Image from "@/shared/components/Image";
import { getMentorMarathonPathname, MarathonSchema } from "@/services/mentors";
import dayjs from "dayjs";

const MentorWorkspaceCard = ({ marathon }: { marathon: MarathonSchema }) => {
  const days = Math.min(
    Math.max(0, dayjs().diff(dayjs(marathon.startDate), "day")),
    dayjs(marathon.endDate).diff(dayjs(marathon.startDate), "day")
  );
  const progress =
    (days / dayjs(marathon.endDate).diff(dayjs(marathon.startDate), "day")) *
    100;

  return (
    <Link
      href={`/manage/mentor-workspace/students?marathonId=${marathon.eventId}`}
      className="block bg-basic-white rounded-lg"
    >
      <div className="rounded-lg overflow-hidden">
        <Image src="" alt="" />
      </div>
      <div className="pb-2.5 px-2.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="body-sm text-basic-500">{marathon.title}</h2>
        </div>
        <div className="mb-2.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-basic-500">學生人數</span>
            <span className="text-xs text-basic-400">|</span>
            <span className="text-xs text-basic-400">
              {marathon.participantCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-basic-500">課堂時間</span>
            <span className="text-xs text-basic-400">|</span>
            <span className="text-xs text-basic-400">
              {dayjs(marathon.startDate).format("YYYY/M/D")}~
              {dayjs(marathon.endDate).format("YYYY/M/D")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="grow rounded-full overflow-hidden">
            <div
              className="h-2.5 bg-primary-base origin-left"
              style={{
                transform: `scaleX(${progress}%)`,
              }}
            />
          </div>
          <div className="body-sm text-basic-400">{days}天</div>
        </div>
      </div>
    </Link>
  );
};

const MentorWorkspace = () => {
  const router = useRouter();
  const { data: marathonList } = useSWR<MarathonSchema[]>(
    getMentorMarathonPathname()
  );

  return (
    <Container autoMinHeight>
      <div className="px-4 mx-auto max-w-4xl">
        <Button
          size="sm"
          variant="ghost"
          className="px-0 mb-6"
          onClick={() => router.push("/manage")}
        >
          <FaAngleLeft />
          返回 我的小島
        </Button>
        <h1 className="mb-6 heading-md">導師工作室</h1>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(marathonList) &&
            marathonList.map((marathon) => (
              <li key={marathon.id}>
                <MentorWorkspaceCard marathon={marathon} />
              </li>
            ))}
        </ul>
      </div>
    </Container>
  );
};

export default MentorWorkspace;
