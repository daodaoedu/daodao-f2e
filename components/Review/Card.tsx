import { AiOutlineEye, AiOutlineMore } from 'react-icons/ai';
import { MdLockOpen } from "react-icons/md";

import Button from '@/shared/components/Button';

function ReviewCard() {
  return (
    <div className="p-10 bg-white rounded-2xl">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 body-sm bg-primary-base rounded-full text-white">
            覆盤二
          </div>
          <div className="body-md text-basic-500">學習計畫一</div>
          <div className="body-md text-primary-base">第五週</div>
        </div>
        <div className="flex items-center gap-2 text-basic-300">
          <time>2024/12/11</time>
          <div className="flex items-center gap-0.5">
            <AiOutlineEye className="size-5" />
            <div>9999</div>
          </div>
          <div className="flex items-center gap-0.5">
            <MdLockOpen className="size-5" />
            <div>公開</div>
          </div>
          <Button className="p-0">
            <AiOutlineMore className="size-5" />
          </Button>
        </div>
      </header>
      <div className="mb-3.5 flex items-center gap-3">
        <p className="body-lg text-basic-500">這段時間的整體心情....</p>
        <div className="p-2 bg-basic-100 rounded">😊 開心</div>
      </div>
      <footer className="flex items-center justify-between">
        <Button
          size="sm"
          className="gap-1 px-2 -ml-2 text-basic-300"
          suffixIcon="FaArrowRight"
        >
          更多
        </Button>
        <div className="flex items-center gap-3 text-basic-black">
          <div className="flex items-center gap-0.5">
            <AiOutlineEye className="size-5" />
            <div>5</div>
          </div>
          <div className="flex items-center gap-0.5">
            <AiOutlineEye className="size-5" />
            <div>1</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ReviewCard;
