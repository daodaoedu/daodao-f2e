import getClassroomLayout from '@/layout/ClassroomLayout';

const ClassroomDetail = () => {
  return (
    <>
      <h1 className="mb-6 heading-md">學習馬拉松</h1>
      <div className="mb-6 flex items-center gap-3.5">
        <h2 className="heading-md">我的學生</h2>
        <p className="vertical-separator-left before:bg-basic-300 pl-3 body-md text-basic-300">
          共 5 名
        </p>
      </div>
      <ul>
        <li>
          <div className="p-3 bg-basic-white">學生</div>
        </li>
      </ul>
    </>
  );
};

ClassroomDetail.getLayout = getClassroomLayout;

export default ClassroomDetail;
