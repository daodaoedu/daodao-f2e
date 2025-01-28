import Image from '@/shared/components/Image';
import PostCard from '@/shared/components/Post/PostCard';

interface OutcomeCardProps {
  className?: string;
}

function OutcomeCard({ className }: OutcomeCardProps) {
  return (
    <PostCard className={className}>
      <PostCard.Header
        title="學習計畫一"
        subtitle="第五週"
        tag="成果一"
        date="2024/12/11"
        viewCount={100}
        isLocked={false}
      />
      <div className="mb-3 body-sm text-basic-500">
        <p className="mb-3">
          因為對剪影片和當 Youtuber 有興趣，我預計會研究搞笑型 Youtuber
          的影片腳本與剪輯方式、拍攝我日常生活及練習剪輯，並建立 Youtube
          頻道上傳影片。希望能藉此了解如何當一位 Youtuber。
        </p>
        <Image src="" alt="" height="300px" />
      </div>
      <PostCard.MoreActions />
    </PostCard>
  );
}

export default OutcomeCard;
