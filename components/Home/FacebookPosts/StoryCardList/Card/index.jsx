import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Image } from '@/components/ui/image';

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
              className="hover:duration-400 relative m-1.5 h-[calc(calc(150px/9)*16)] w-[150px] flex-[0_0_150px] cursor-pointer overflow-hidden border-none bg-transparent object-cover p-0 text-[#16b9b3] hover:scale-105 hover:transition-transform"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              aria-label={`Instagram video: ${message.slice(0, 50)}...`}
            >
              <video
                className="h-full w-full object-cover"
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
            className="hover:duration-400 relative m-1.5 h-[calc(calc(150px/9)*16)] w-[150px] flex-[0_0_150px] cursor-pointer overflow-hidden border-none bg-transparent object-cover p-0 text-[#16b9b3] hover:scale-105 hover:transition-transform"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`Instagram post: ${message.slice(0, 50)}...`}
          >
            <Image
              className="relative h-[calc(calc(150px/9)*16)] min-h-[calc(calc(150px/9)*16)] w-[150px] min-w-[150px] object-cover object-center"
              alt={message}
              src={media}
              width={150}
              height={267}
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
