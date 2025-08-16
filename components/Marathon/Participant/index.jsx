import { Title } from '@/components/ui/typography';
import { Image } from '@/components/ui/image';
import PersonaImage1 from '@/public/assets/marathon-persona-1.png';
import PersonaImage2 from '@/public/assets/marathon-persona-2.png';
import PersonaImage3 from '@/public/assets/marathon-persona-3.png';
import PersonaImage4 from '@/public/assets/marathon-persona-4.png';

export default function Participant() {
  return (
    <div className="grid w-full max-w-full grid-cols-2 grid-rows-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-none">
      <div className="h-[300px] rounded-[10px] bg-white px-8 py-10 text-center">
        <div className="mb-2 h-[160px]">
          <Image
            alt="marathon-persona-1"
            src={PersonaImage1.src}
            width={200}
            height={160}
            className="mx-auto block object-cover object-center"
          />
        </div>
        <Title className="text-center text-lg font-bold leading-[140%] text-[#293A3D]">
          有模糊的職涯／生涯方向，
          <br />
          想開始做準備與鋪路
        </Title>
      </div>
      <div className="h-[300px] rounded-[10px] bg-[#DEEDF5] px-8 py-10 text-center">
        <div className="mb-2 h-[160px]">
          <Image
            alt="marathon-persona-2"
            src={PersonaImage2.src}
            width={200}
            height={160}
            className="mx-auto block object-cover object-center"
          />
        </div>
        <Title className="text-center text-lg font-bold leading-[140%] text-[#293A3D]">
          考試不適合我，
          <br />
          更想用個人經歷上大學
        </Title>
      </div>
      <div className="h-[300px] rounded-[10px] bg-[#DEF5E7] px-8 py-10 text-center">
        <div className="mb-2 h-[160px]">
          <Image
            alt="marathon-persona-3"
            src={PersonaImage3.src}
            width={200}
            height={160}
            className="mx-auto block object-cover object-center"
          />
        </div>
        <Title className="text-center text-lg font-bold leading-[140%] text-[#293A3D]">
          學校課程好無聊，希望可以用
          <br />
          自己的方式學有興趣的事情
        </Title>
      </div>
      <div className="h-[300px] rounded-[10px] bg-white px-8 py-10 text-center">
        <div className="mb-2 h-[160px]">
          <Image
            alt="marathon-persona-4"
            src={PersonaImage4.src}
            width={200}
            height={160}
            className="mx-auto block object-cover object-center"
          />
        </div>
        <Title className="text-center text-lg font-bold leading-[140%] text-[#293A3D]">
          想自主學習，
          <br />
          有方向但不確定可以怎麼開始
        </Title>
      </div>
    </div>
  );
}
