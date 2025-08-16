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
      className="relative w-[30%] h-[430px] rounded-[20px] opacity-100 m-2.5 cursor-pointer object-cover hover:scale-105 hover:transition-transform hover:duration-400 animate-[slideInUp_1.5s_forwards] max-md:flex max-md:flex-col max-md:justify-center max-md:w-full max-md:pt-0 max-md:pl-0 max-md:text-center bg-transparent border-none p-0"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`搜尋 ${title} 相關資源`}
    >
      <div
        className="absolute left-0 top-0 w-full h-full overflow-hidden rounded-[20px] z-[-1] bg-cover bg-no-repeat bg-center brightness-50"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="mx-auto w-[240px] h-[110px] pt-[130px] max-md:pt-0">
        <p className="title text-[#f0f0f0] text-[32px] leading-[45px] tracking-[0.08em] font-bold text-center">
          {title}
        </p>
        <p className="desc text-[#f0f0f0] text-xl leading-[45px] tracking-[0.08em] font-bold text-center mt-5">
          {desc}
        </p>
      </div>
    </button>
  );
};

export default Card;
