import { forwardRef } from "react";
import { X, SearchIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import useControlledState from "@/hooks/useControlledState";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = "搜尋...",
      onChange,
      icon,
      className,
      inputClassName,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useControlledState(
      defaultValue ?? "",
      value,
      onChange
    );

    const handleClear = () => {
      setInternalValue("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    return (
      <div className={cn("relative", className)}>
        <span className="absolute top-1/2 -translate-y-1/2 left-4 [&>svg]:size-5 pointer-events-none">
          {icon || <SearchIcon />}
        </span>
        <Input
          ref={ref}
          type="search"
          className={cn(
            "h-10 w-full rounded-lg border-[#DBDBDB] border",
            "flex items-center justify-center px-11",
            "[&::-webkit-search-cancel-button]:hidden",
            inputClassName
          )}
          placeholder={placeholder}
          onChange={handleChange}
          value={internalValue}
          {...props}
        />
        {internalValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-1 cursor-pointer [&>svg]:size-5"
            onClick={handleClear}
          >
            <X />
          </Button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export default SearchInput;
