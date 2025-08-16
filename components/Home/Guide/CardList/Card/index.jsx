import { useRouter } from 'next/router';

const Card = ({
  id, image, title, desc,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/search?cats=${title}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      key={id}
      className="hover:duration-400 relative m-2.5 h-[430px] w-[30%] animate-[slideInUp_1.5s_forwards] cursor-pointer rounded-[20px] border-none bg-transparent object-cover p-0 opacity-100 hover:scale-105 hover:transition-transform max-md:flex max-md:w-full max-md:flex-col max-md:justify-center max-md:pl-0 max-md:pt-0 max-md:text-center"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`搜尋 ${title} 相關資源`}
    >
      <div
        className="absolute left-0 top-0 z-[-1] h-full w-full overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat brightness-50"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="mx-auto h-[110px] w-[240px] pt-[130px] max-md:pt-0">
        <p className="title text-center text-[32px] font-bold leading-[45px] tracking-[0.08em] text-[#f0f0f0]">
          {title}
        </p>
        <p className="desc mt-5 text-center text-xl font-bold leading-[45px] tracking-[0.08em] text-[#f0f0f0]">
          {desc}
        </p>
      </div>
    </button>
  );
};

export default Card;
