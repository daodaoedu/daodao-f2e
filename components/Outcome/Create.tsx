import dayjs from 'dayjs';
import Modal from '@/shared/components/Modal';
import PostCard from '@/shared/components/Post/PostCard';
import Button from '@/shared/components/Button';

interface OutcomeCreateProps {
  isOpen: boolean;
  onClose: () => void;
}

function OutcomeCreate({ isOpen, onClose }: OutcomeCreateProps) {
  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <PostCard className="p-0">
        <PostCard.Header
          title="學習計畫一"
          subtitle="第三週"
          tag="成果一"
          date={dayjs().format('YYYY/MM/DD')}
        />
      </PostCard>
      <textarea
        className="w-full h-80 px-2 py-1 body-sm focus-within:outline-none resize-none"
        placeholder="學習成果的提示文字
例如：你的成果包含哪些內容？
可以分享簡報、PDF檔案的連結，也可以分享影片連結，分享時記得設為公開喔～"
      />
      <div className="px-2">
        <Button variant="solid" color="secondary">
          加入圖片
        </Button>
      </div>
      <div className="flex justify-end gap-5">
        <Button className="text-primary-base">儲存草稿</Button>
        <Button variant="solid" color="primary">
          發布
        </Button>
      </div>
    </Modal>
  );
}

export default OutcomeCreate;
