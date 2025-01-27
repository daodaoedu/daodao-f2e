import ProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import ReviewCard from '@/components/Review/Card';

const Project = () => {
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between body-md">
          <div className="flex items-center gap-1">
            <div className="text-basic-500">覆盤（04 週/22週)</div>
            <Button className="px-2 text-primary-base">覆盤設定</Button>
          </div>
          <Button variant="solid" color="primary">
            新增覆盤
          </Button>
        </div>
      </div>
      <ReviewCard />
    </>
  );
};

Project.getLayout = ProjectLayout;

export default Project;
