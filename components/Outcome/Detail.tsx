import CommentInput from '@/shared/components/Comment/CommentInput';
import Comment from '@/public/assets/icons/comment.svg';
import Image from '@/shared/components/Image';
import PostCard from '@/shared/components/Post/PostCard';
import CommentCard from '@/shared/components/Comment/CommentCard';

interface OutcomeDetailProps {
  className?: string;
}

function OutcomeDetail({ className }: OutcomeDetailProps) {
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
      <div className="mb-4 body-sm text-basic-500">
        <p className="mb-3">
          因為對剪影片和當 Youtuber 有興趣，我預計會研究搞笑型 Youtuber
          的影片腳本與剪輯方式、拍攝我日常生活及練習剪輯，並建立 Youtube
          頻道上傳影片。希望能藉此了解如何當一位 Youtuber。
        </p>
        <Image src="" alt="" height="300px" />
      </div>
      <hr className="mb-4 h-px bg-basic-100" />
      <PostCard.Reward shellCount={5} userName="用戶A" />
      <CommentInput className="px-4 py-6 border-b border-solid border-basic-200" />
      <div className="my-2 flex items-center gap-0.5 body-md text-basic-500">
        <Comment />
        <span>回覆 (1)</span>
      </div>
      <CommentCard
        avatar=""
        className="px-8 py-6 border border-solid border-basic-200 rounded-lg"
      >
        <CommentCard avatar="" />
      </CommentCard>
    </PostCard>
  );
}

export default OutcomeDetail;
