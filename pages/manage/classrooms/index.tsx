import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AiOutlineMore } from 'react-icons/ai';
import Button from '@/shared/components/Button';
import Container from '@/shared/components/Container';
import Image from '@/shared/components/Image';

const ClassCard = () => {
  return (
    <Link href="/manage/classrooms/reviews" className="block bg-basic-white rounded-lg">
      <div className="rounded-lg overflow-hidden">
        <Image src="" alt="" />
      </div>
      <div className="pb-2.5 px-2.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="body-sm text-basic-500">學習馬拉松</h2>
          <Button className="p-0">
            <AiOutlineMore />
          </Button>
        </div>
        <div className="mb-2.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-basic-500">學生人數</span>
            <span className="text-xs text-basic-400">|</span>
            <span className="text-xs text-basic-400">5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-basic-500">學習階段</span>
            <span className="text-xs text-basic-400">|</span>
            <span className="text-xs text-basic-400">高中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-basic-500">課堂時間</span>
            <span className="text-xs text-basic-400">|</span>
            <span className="text-xs text-basic-400">2025/2/15~2024/6/13</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="grow">
            <div className="w-1/2 h-2.5 rounded-full bg-primary-base" />
          </div>
          <div>50天</div>
        </div>
      </div>
    </Link>
  );
};

const Classrooms = () => {
  const router = useRouter();

  return (
    <Container autoMinHeight>
      <div className="px-4 mx-auto max-w-4xl">
        <Button
          size="sm"
          className="px-0 mb-6"
          prefixIcon="FaAngleLeft"
          onClick={() => router.push('/manage')}
        >
          返回 我的小島
        </Button>
        <h1 className="mb-6 heading-md">導師工作室</h1>
        <ul className="grid grid-cols-3 gap-4">
          <li>
            <ClassCard />
          </li>
        </ul>
      </div>
    </Container>
  );
};

export default Classrooms;
