import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

const Card = ({ id, message = '', date }) => {
  const handleClick = () => {
    window.open(
      `https://www.facebook.com/${id.split('_')[0]}/posts/${id.split('_')[1]}`,
      '_target'
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="relative w-[200px] h-[120px] flex-[0_0_200px] rounded-xl m-1.5 p-2.5 text-[#16b9b3] border-2 border-[#16b9b3] overflow-hidden cursor-pointer object-cover hover:scale-105 hover:transition-transform hover:duration-400 bg-white"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`Facebook post from ${format(new Date(date), 'yyyy/MM/dd')}`}
          >
            <div className="font-bold">
              時間：
              {format(new Date(date), 'yyyy/MM/dd')}
            </div>
            <p className="flex flex-col items-center h-[calc(90px-20px)] font-medium text-left [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden whitespace-pre-wrap text-xs [display:-webkit-box] text-ellipsis">
              {message}
            </p>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message.slice(0, 150)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Card;
