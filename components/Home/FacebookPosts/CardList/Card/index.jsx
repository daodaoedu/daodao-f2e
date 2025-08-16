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
            className="hover:duration-400 relative m-1.5 h-[120px] w-[200px] flex-[0_0_200px] cursor-pointer overflow-hidden rounded-xl border-2 border-[#16b9b3] bg-white object-cover p-2.5 text-[#16b9b3] hover:scale-105 hover:transition-transform"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`Facebook post from ${format(new Date(date), 'yyyy/MM/dd')}`}
          >
            <div className="font-bold">
              時間：
              {format(new Date(date), 'yyyy/MM/dd')}
            </div>
            <p className="flex h-[calc(90px-20px)] flex-col items-center overflow-hidden text-ellipsis whitespace-pre-wrap text-left text-xs font-medium [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
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
