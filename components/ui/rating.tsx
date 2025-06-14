"use client";

import * as React from "react";
import { Star, LucideProps } from "lucide-react";

import { cn } from "@/utils/cn";

type MouseEventHandler = React.MouseEventHandler<HTMLSpanElement>;

const ratingVariants = {
  default: {
    full: "fill-current text-tips",
    empty: "fill-current text-basic-200",
  },
  alert: {
    full: "fill-current text-alert",
    empty: "fill-current text-basic-200",
  },
};

const DEFAULT_PRECISION = 0.5;
const DEFAULT_MAX_STARS = 5;
const DEFAULT_STAR_SIZE = 20;
const DEFAULT_ICON = <Star className="px-0.5" />;

const checkPrecision = (precision: number) => {
  if (precision <= 0 || precision > 1) {
    console.error("Precision must be greater than 0 and less than 1");
    return false;
  }
  return true;
};

interface RatingIconProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onClick" | "onMouseMove"
  > {
  fillRatio: number;
  size: number;
  variant?: keyof typeof ratingVariants;
  value: number;
  position: number;
  name?: string;
  readOnly?: boolean;
  disabled?: boolean;
  precision: number;
  Icon: React.ReactElement<LucideProps>;
  onClick?: MouseEventHandler;
  onMouseMove?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
}

const RatingIcon = ({
  fillRatio,
  size,
  variant = "default",
  value,
  position,
  name,
  readOnly = false,
  disabled = false,
  precision,
  Icon,
  onClick,
  onMouseMove,
  onMouseLeave,
  ...props
}: RatingIconProps) => {
  const Comp = readOnly ? "span" : "label";
  const id = React.useId();
  const ratingIconId = `rating-icon-${id}`;
  const ref = React.useRef<HTMLDivElement>(null);
  const isPartiallyFilled = position >= value && value > position - 1;
  const isInteractive = !readOnly && !disabled;
  const tabIndex = isInteractive && isPartiallyFilled ? 0 : undefined;

  const icons = React.useMemo(() => {
    const emptyIcon = React.cloneElement(Icon, {
      size,
      className: cn(ratingVariants[variant].empty, Icon.props.className),
      "aria-hidden": "true",
    });
    const fullIcon = React.cloneElement(Icon, {
      size,
      className: cn(ratingVariants[variant].full, Icon.props.className),
      "aria-hidden": "true",
    });
    return { emptyIcon, fullIcon };
  }, [Icon, size, variant]);

  const ratingPoints = React.useMemo(() => {
    if (!checkPrecision(precision)) return [];

    const pointsCount = Math.floor(1 / precision);
    return Array.from({ length: pointsCount }).map(
      (_, i) => (i + 1) * precision + position - 1
    );
  }, [precision, position]);

  React.useEffect(() => {
    if (value === 0) {
      ref.current?.parentElement?.focus();
    } else if (isPartiallyFilled) {
      ref.current?.focus();
    }
  }, [position, value, isPartiallyFilled]);

  return (
    <span
      ref={ref}
      className={cn(
        "relative",
        isInteractive && "transition-transform hover:scale-110",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      {...props}
      data-position={position}
      tabIndex={tabIndex}
      onClick={!readOnly ? onClick : undefined}
      onMouseMove={!readOnly ? onMouseMove : undefined}
      onMouseLeave={!readOnly ? onMouseLeave : undefined}
      aria-disabled={disabled}
      aria-hidden={readOnly}
    >
      {ratingPoints.map((ratingPoint, index) => {
        const isPartialPoint = ratingPoint % 1 !== 0;
        const shouldShowFilled = fillRatio + position - 1 >= ratingPoint;
        const partialWidth = `${precision * (index + 1) * 100}%`;
        const isChecked = value === ratingPoint;
        const width =
          isPartialPoint && shouldShowFilled ? partialWidth : undefined;

        return (
          <React.Fragment key={ratingPoint}>
            <Comp
              htmlFor={`${ratingIconId}-${ratingPoint}`}
              aria-label={`${ratingPoint} Stars`}
              className={cn(
                "[&_svg]:pointer-events-none",
                isPartialPoint && "absolute top-0 left-0 overflow-hidden",
                isInteractive && "cursor-pointer"
              )}
              style={{ width }}
            >
              {!isPartialPoint && !shouldShowFilled && icons.emptyIcon}
              {shouldShowFilled && icons.fullIcon}
            </Comp>
            {!readOnly && (
              <input
                type="radio"
                id={`${ratingIconId}-${ratingPoint}`}
                name={name}
                value={ratingPoint}
                className="sr-only"
                tabIndex={-1}
                disabled={disabled}
                checked={isChecked}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};

interface RatingProps
  extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  name?: string;
  max?: number;
  size?: number;
  Icon?: React.ReactElement<LucideProps>;
  variant?: keyof typeof ratingVariants;
  readOnly?: boolean;
  disabled?: boolean;
  precision?: number;
  onChange?: (value: number) => void;
  onHover?: (value: number) => void;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      name,
      max = DEFAULT_MAX_STARS,
      size = DEFAULT_STAR_SIZE,
      Icon = DEFAULT_ICON,
      variant = "default",
      className,
      readOnly = false,
      disabled = false,
      precision = DEFAULT_PRECISION,
      onChange,
      onHover,
      ...props
    },
    ref
  ) => {
    const id = React.useId();
    const ratingName = name ?? `rating-${id}`;
    const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
    const isInteractive = !readOnly && !disabled;

    const getRatingPoint = React.useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        if (width === 0 || !checkPrecision(precision)) return null;
        const x = event.clientX - left;
        const fillRatio = x / width;
        const position = parseInt(
          event.currentTarget.dataset.position ?? "",
          10
        );

        return position + Math.ceil(fillRatio / precision) * precision - 1;
      },
      [precision]
    );

    const handleMouseMove = React.useCallback<MouseEventHandler>(
      (event) => {
        if (!isInteractive) return;
        const point = getRatingPoint(event);
        if (point === null) return;
        onHover?.(point);
        setHoveredValue(point);
      },
      [isInteractive, onHover, getRatingPoint]
    );

    const handleClick = React.useCallback<MouseEventHandler>(
      (event) => {
        if (!isInteractive) return;
        const point = getRatingPoint(event);
        if (point === null) return;
        setHoveredValue(null);
        onChange?.(point === value ? 0 : point);
      },
      [isInteractive, value, onChange, getRatingPoint]
    );

    const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
      (event) => {
        if (!isInteractive) return;
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
      [isInteractive, value, max, precision, onChange]
    );

    const stars = React.useMemo(() => {
      const displayValue = hoveredValue ?? value;
      const clampedRating = Math.max(0, Math.min(displayValue, max));

      return Array.from({ length: max }, (_, index) => {
        const position = index + 1;

        // full star
        if (position <= clampedRating) {
          return { position, fillRatio: 1 };
        }

        // partial star
        if (position <= Math.ceil(clampedRating)) {
          const partialFill = clampedRating % 1;
          return { position, fillRatio: partialFill };
        }

        // empty star
        return { position, fillRatio: 0 };
      });
    }, [hoveredValue, value, max]);

    return (
      <div
        ref={ref}
        role={!readOnly ? "radiogroup" : "img"}
        onKeyDown={!readOnly ? handleKeyDown : undefined}
        tabIndex={!readOnly && value === 0 ? 0 : undefined}
        className={cn("flex", className)}
        aria-label={readOnly ? `${value} stars` : "Rating"}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} of ${max} stars`}
        {...props}
      >
        {stars.map(({ position, fillRatio }) => (
          <RatingIcon
            key={position}
            fillRatio={fillRatio}
            size={size}
            name={ratingName}
            variant={variant}
            value={value}
            position={position}
            readOnly={readOnly}
            disabled={disabled}
            precision={precision}
            Icon={Icon}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredValue(null)}
          />
        ))}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };
