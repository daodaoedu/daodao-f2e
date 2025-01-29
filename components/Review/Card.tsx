import PostCard from '@/shared/components/Post/PostCard';

interface ReviewCardProps {
  detailLink: string;
}

function ReviewCard({ detailLink }: ReviewCardProps) {
  return (
    <PostCard>
      <PostCard.Header
        title="學習計畫可以很多很多的字一"
        subtitle="第五週"
        tag="覆盤二"
        date="2024/12/11"
        viewCount={100}
        isLocked={false}
      />
      <div className="mb-3.5 flex items-center gap-3">
        <p className="body-lg text-basic-500">這段時間的整體心情....</p>
        <div className="p-2 bg-basic-100 rounded">😊 開心</div>
      </div>
      <PostCard.Footer detailLink={detailLink} />
    </PostCard>
  );
}

export default ReviewCard;
