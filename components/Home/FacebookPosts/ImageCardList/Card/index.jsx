import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Card = ({ message = '', image, url }) => {
  const handleClick = () => {
    window.open(url, '_target');
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
            className="relative w-[150px] h-[150px] flex-[0_0_150px] m-1.5 text-[#16b9b3] overflow-hidden cursor-pointer object-cover hover:scale-105 hover:transition-transform hover:duration-400 bg-transparent border-none p-0"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`Instagram post: ${message.slice(0, 50)}...`}
          >
            <LazyLoadImage
              className="w-[150px] h-[150px] min-w-[150px] min-h-[150px] relative object-cover object-center"
              alt={message}
              src={image}
              effect="opacity"
            />
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
