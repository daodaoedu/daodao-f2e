export const BackgroundAnimation = () => {
  return (
    <div className="absolute inset-0 -z-10 bg-very-light-gray blur-[100px]">
      <div className="absolute top-2/7 right-1/7 rounded-full size-[198px] bg-[#DBF9FF] animate-float animate-duration-20000" />
      <div className="absolute bottom-2/7 left-1/7 rounded-full size-[198px] bg-[#C8FFF2] animate-float animate-duration-22000" />
      <div className="absolute bottom-2/7 left-2/7 rounded-full size-[240px] bg-[#FFF0C8] animate-float animate-duration-25000" />
      <div className="absolute bottom-1/7 left-1/7 size-[195px] bg-[#C8DEFF] animate-float animate-duration-18000" />
    </div>
  );
};

