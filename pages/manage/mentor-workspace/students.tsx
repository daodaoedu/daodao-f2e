import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import Image from '@/shared/components/Image';
import getMentorWorkspaceLayout from '@/layout/MentorWorkspaceLayout';
import { useMentorMarathonParticipant } from '@/hooks/api/mentor';
import { ParticipantSchema } from '@/services/mentors/marathons';
import LocationSvg from '@/public/assets/icons/location.svg';
import { EDUCATION, ROLE, WANT_TO_DO_WITH_PARTNER } from '@/constants/member';
import { timeDuration } from '@/utils/date';

const ParticipantCard = ({
  participant,
}: {
  participant?: ParticipantSchema;
}) => {
  if (!participant) return null;

  const educationStage = EDUCATION.find(
    (item) => item.value === participant.educationStage
  )?.label;
  const role = ROLE.find(
    (item) => item.value === participant.roleList[0]
  )?.label;

  const wantToDoWithPartner = WANT_TO_DO_WITH_PARTNER.filter((item) =>
    participant.wantToDoList.includes(item.value)
  )
    .map((item) => item.label)
    .join('、');

  return (
    <div className="p-3 bg-basic-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-center gap-3 mb-2">
        <div className="flex items-start gap-4">
          <Image
            src={participant.photoURL}
            alt={participant.name}
            className="object-cover !rounded-full overflow-hidden"
            width="50px"
            height="50px"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="body-md font-bold">{participant.name}</h3>
            <p className="body-sm bg-basic-100 text-basic-500 px-2.5 py-0.5 rounded">
              {educationStage}
            </p>
          </div>
          <p className="body-sm text-basic-300">{role}</p>
        </div>
      </header>

      <div>
        {participant.share && (
          <div className="flex gap-1 mb-0.5 body-sm">
            <h4 className="font-bold shrink-0 text-basic-500">可分享</h4>
            <span className="body-md text-basic-400">|</span>
            <p className="text-basic-400 truncate">
              {participant.share}
            </p>
          </div>
        )}
        {wantToDoWithPartner && (
          <div className="flex gap-1 mb-0.5 body-sm">
            <h4 className="font-bold shrink-0 text-basic-500">想一起</h4>
            <span className="body-md text-basic-400">|</span>
            <p className="text-basic-400 truncate">
              {wantToDoWithPartner}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 my-2">
        {participant.tagList.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 text-sm bg-primary-lightest text-basic-400 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-1 text-basic-300 text-sm">
        <p className="flex items-center gap-1">
          <LocationSvg />
          {participant.location || '未提供'}
        </p>
        <p>{timeDuration(dayjs(participant.updatedDate))}更新</p>
      </div>

      <p className="border-t mt-2.5 py-2 body-md font-bold border-solid border-basic-100">
        <Link
          href={`/admin/projects/detail?id=${participant.projectId}`}
          target="_blank"
          className="text-primary-base hover:underline"
        >
          {participant.projectTitle}
        </Link>
      </p>
    </div>
  );
};

const MentorWorkspaceStudents = () => {
  const searchParams = useSearchParams();
  const marathonId = searchParams.get('marathonId') ?? undefined;
  const { data: marathonParticipantList } = useMentorMarathonParticipant({
    marathonId,
  });

  return (
    <>
      <h1 className="mb-6 heading-md">學習馬拉松</h1>
      <div className="mb-6 flex items-center gap-3.5">
        <h2 className="heading-md">我的學生</h2>
        <p className="vertical-separator-left before:bg-basic-300 pl-3 body-md text-basic-300">
          共{' '}
          {Array.isArray(marathonParticipantList?.participants)
            ? marathonParticipantList?.participants.length
            : 0}
          名
        </p>
      </div>
      <ul className="space-y-4">
        {Array.isArray(marathonParticipantList?.participants) &&
          marathonParticipantList.participants.map((participant) => (
            <li key={participant._id}>
              <ParticipantCard participant={participant} />
            </li>
          ))}
      </ul>
    </>
  );
};

MentorWorkspaceStudents.getLayout = getMentorWorkspaceLayout;

export default MentorWorkspaceStudents;
