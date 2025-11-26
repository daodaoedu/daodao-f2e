import EmptyImg from '@/public/assets/images/empty.png';

const EmptyList = () => (
  <div className="flex flex-col items-center justify-center bg-white p-4 md:p-8">
    <img
      src={EmptyImg.src}
      alt="no projects available"
      className="w-[150px]"
    />
    <p className="font-sans text-base leading-normal text-basic-500">
      這裡還沒有東西喔！
    </p>
  </div>
);
export default EmptyList;
