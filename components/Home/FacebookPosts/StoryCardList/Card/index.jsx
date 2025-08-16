import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Card = ({
  message = '', media, url, type,
}) => {
  const handleClick = () => {
    window.open(url, '_target');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  if (type === 'VIDEO') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="relative w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px] m-1.5 text-[#16b9b3] overflow-hidden cursor-pointer object-cover hover:scale-105 hover:transition-transform hover:duration-400 bg-transparent border-none p-0"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              aria-label={`Instagram video: ${message.slice(0, 50)}...`}
            >
              <video
                className="object-cover w-full h-full"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={media} type="video/mp4" />
              </video>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message.slice(0, 150)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="relative w-[150px] h-[calc(calc(150px/9)*16)] flex-[0_0_150px] m-1.5 text-[#16b9b3] overflow-hidden cursor-pointer object-cover hover:scale-105 hover:transition-transform hover:duration-400 bg-transparent border-none p-0"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`Instagram post: ${message.slice(0, 50)}...`}
          >
            <LazyLoadImage
              className="w-[150px] h-[calc(calc(150px/9)*16)] min-w-[150px] min-h-[calc(calc(150px/9)*16)] relative object-cover object-center"
              alt={message}
              src={media}
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
