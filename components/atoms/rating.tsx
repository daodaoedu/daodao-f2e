import * as React from "react";
import { Star, LucideProps } from "lucide-react";

import { cn } from "@/utils/cn";

const ratingVariants = {
  default: {
    full: "text-foreground",
    empty: "text-muted-foreground",
  },
  destructive: {
    full: "text-red-500",
    empty: "text-red-200",
  },
  yellow: {
    full: "text-yellow-500",
    empty: "text-yellow-200",
  },
};

interface PartialIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fillPercentage: number;
  size: number;
  variant?: keyof typeof ratingVariants;
  value: number;
  index: number;
  readOnly?: boolean;
  Icon: React.ReactElement<LucideProps>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const PartialIcon = ({
  fillPercentage,
  size,
  variant = "default",
  value,
  index,
  readOnly = false,
  Icon,
  onClick,
  onMouseEnter,
  ...props
}: PartialIconProps) => {
  const Comp = readOnly ? "span" : "button";
  const ref = React.useRef<HTMLButtonElement>(null);
  const emptyIcon = React.cloneElement(Icon, {
    size,
    className: cn("fill-transparent", ratingVariants[variant].empty),
  });
  const fullIcon = React.cloneElement(Icon, {
    size,
    className: cn("fill-current", ratingVariants[variant].full),
  });

  React.useEffect(() => {
    const prevIndex = index - 1;
    if (value === 0) {
      ref.current?.parentElement?.focus();
    }
    if (value > prevIndex && value <= index) {
      ref.current?.focus();
    }
  }, [index, value]);

  return (
    <Comp
      ref={ref}
      type={Comp === "button" ? "button" : undefined}
      className={cn(
        "px-0.5 relative inline-block",
        !readOnly && "hover:scale-125"
      )}
      onClick={readOnly ? undefined : onClick}
      onMouseEnter={readOnly ? undefined : onMouseEnter}
      {...props}
      data-icon-index={index}
    >
      {fillPercentage === 1 ? fullIcon : emptyIcon}
      {fillPercentage < 1 && (
        <div
          className="absolute top-0 overflow-hidden"
          style={{ width: `calc(${fillPercentage * 100}% - 2px)` }}
        >
          {fullIcon}
        </div>
      )}
    </Comp>
  );
};

const calculateFillPercentage = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  iconIndex: string,
  precision: number
) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = event.currentTarget.clientWidth;
  const index = parseFloat(iconIndex) - 1;
  const x = event.pageX - rect.left;
  const fillPercentage = x / width;
  return precision === 0
    ? index + fillPercentage
    : index + Math.ceil(fillPercentage / precision) * precision;
};

interface RatingProps
  extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  max?: number;
  size?: number;
  Icon?: React.ReactElement<LucideProps>;
  variant?: keyof typeof ratingVariants;
  readOnly?: boolean;
  precision?: number;
  onChange?: (value: number) => void;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      size = 20,
      Icon = <Star />,
      variant = "default",
      className,
      readOnly = false,
      precision = 0.5,
      onChange,
      ...props
    },
    ref
  ) => {
    const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

    const handleMouseMoveIcon = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const { iconIndex } = event.currentTarget.dataset;
        if (readOnly) return;
        if (iconIndex) {
          const fillPercentage = calculateFillPercentage(
            event,
            iconIndex,
            precision
          );
          setHoveredStar(fillPercentage);
        }
      },
      [readOnly, precision, setHoveredStar]
    );

    const handleClickIcon = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (readOnly) return;
        const { iconIndex } = event.currentTarget.dataset;
        if (iconIndex) {
          const fillPercentage = calculateFillPercentage(
            event,
            iconIndex,
            precision
          );
          setHoveredStar(null);
          onChange?.(fillPercentage === value ? 0 : fillPercentage);
        }
      },
      [readOnly, value, precision, onChange]
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (readOnly) return;
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            event.preventDefault();
            if (value + precision > max) {
              onChange?.(0);
            } else {
              onChange?.(value + precision);
            }
            break;
          case "ArrowLeft":
          case "ArrowDown":
            event.preventDefault();
            if (value - precision < 0) {
              onChange?.(max);
            } else {
              onChange?.(value - precision);
            }
            break;
          default:
            break;
        }
      },
      [readOnly, value, onChange, max, precision]
    );

    const stars = React.useMemo(() => {
      // clamp rating to 0-max
      const clampedRating = Math.max(0, Math.min(hoveredStar ?? value, max));

      return Array.from({ length: max }, (_, index) => {
        const position = index + 1;

        // full star
        if (position <= clampedRating) {
          return { position, fillPercentage: 1 };
        }

        // partial star
        if (position <= Math.ceil(clampedRating)) {
          const partialFill = clampedRating % 1;
          return { position, fillPercentage: partialFill };
        }

        // empty star
        return { position, fillPercentage: 0 };
      });
    }, [hoveredStar, value, max]);

    return (
      <div
        ref={ref}
        role="group"
        className={cn("flex items-center", className)}
        onMouseLeave={() => setHoveredStar(null)}
        onKeyDown={handleKeyDown}
        tabIndex={readOnly ? -1 : 0}
        {...props}
      >
        {stars.map(({ position, fillPercentage }) => (
          <PartialIcon
            key={position}
            fillPercentage={fillPercentage}
            size={size}
            variant={variant}
            value={value}
            index={position}
            readOnly={readOnly}
            Icon={Icon}
            onClick={handleClickIcon}
            onMouseMove={handleMouseMoveIcon}
          />
        ))}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };
