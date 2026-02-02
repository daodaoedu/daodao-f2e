"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/shared/ui/command";
import { Button } from "./button";
import { type BaseFormFieldProps, FormFieldWrapper } from "./form";
import type { OptionProps } from "./option";

interface GroupOption {
  [key: string]: OptionProps[];
}

interface MultipleSelectorProps {
  value?: OptionProps[];
  defaultOptions?: OptionProps[];
  /** manually controlled options */
  options?: OptionProps[];
  placeholder?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   */
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<OptionProps[]>;
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   */
  onSearchSync?: (value: string) => OptionProps[];
  onChange?: (options: OptionProps[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number, options: OptionProps) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  /** hide the clear all button. */
  hideClearAllButton?: boolean;
  /** Enable virtual scrolling for large lists */
  virtualScroll?: boolean;
  /** Virtual scrolling configuration */
  virtualScrollOptions?: {
    /** Height of each item in pixels */
    itemHeight?: number;
    /** Maximum height of the dropdown in pixels */
    maxHeight?: number;
    /** Number of items to render outside visible area for smooth scrolling */
    overscan?: number;
  };
}

export interface MultipleSelectorRef {
  selectedValue: OptionProps[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 虛擬滾動 Hook - 只渲染可見區域的項目以提升性能
 *
 * 實現原理：
 * 1. 根據滾動位置計算可見範圍
 * 2. 只渲染可見項目 + 緩衝區項目
 * 3. 使用 transform 來定位項目
 * 4. 維護總高度以保持滾動條行為
 */
function useVirtualScroll(
  items: OptionProps[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = React.useMemo(() => {
    // 計算可見區域的開始和結束索引
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight), items.length);

    // 添加緩衝區，讓滾動更流暢
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // 只取可見範圍內的項目
  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  // 計算總高度和偏移量
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
}

function transToGroupOption(options: OptionProps[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: OptionProps[]) {
  return Object.entries(groupOption).reduce((acc, [key, value]) => {
    acc[key] = value.filter((val) => !picked.find((p) => p.value === val.value));
    return acc;
  }, {} as GroupOption);
}

function isOptionsExist(groupOption: GroupOption, targetValue: string) {
  const flatOptions = Object.values(groupOption).flat();
  return flatOptions.some((option) => targetValue === option.value);
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 */
const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-4 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

interface VirtualizedOptionsListProps {
  options: OptionProps[];
  onSelect: (option: OptionProps) => void;
  virtualScrollOptions: {
    itemHeight: number;
    maxHeight: number;
    overscan: number;
  };
}

/**
 * 虛擬化選項列表組件
 *
 * 這個組件實現了虛擬滾動：
 * - 只渲染可見的項目
 * - 使用 transform 來定位項目
 * - 監聽滾動事件來更新可見範圍
 */
const VirtualizedOptionsList = React.memo(
  ({ options, onSelect, virtualScrollOptions }: VirtualizedOptionsListProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { itemHeight, maxHeight, overscan } = virtualScrollOptions;

    const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualScroll(
      options,
      maxHeight,
      itemHeight,
      overscan
    );

    const handleScroll = React.useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
      },
      [setScrollTop]
    );

    return (
      <div
        ref={containerRef}
        className="overflow-auto focus:outline-none"
        style={{ maxHeight }}
        onScroll={handleScroll}
        tabIndex={-1}
      >
        {/* 總高度容器，維持滾動條的正確行為 */}
        <div style={{ height: totalHeight, position: "relative" }}>
          {/* 可見項目容器，使用 transform 定位 */}
          <div
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${offsetY}px)` }}
          >
            {visibleItems.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                disabled={option.disable}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onSelect={() => onSelect(option)}
                className={cn(
                  "flex cursor-pointer items-center",
                  option.disable && "cursor-default text-muted-foreground"
                )}
                style={{
                  height: itemHeight,
                  minHeight: itemHeight,
                }}
              >
                {option.label}
              </CommandItem>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected = true,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
      virtualScroll = false,
      virtualScrollOptions = {
        itemHeight: 32,
        maxHeight: 200,
        overscan: 5,
      },
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null); // Added this

    const [selected, setSelected] = React.useState<OptionProps[]>(value || []);
    const [options, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy)
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected]
    );

    const handleClickOutside = React.useCallback((event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    }, []);

    const handleUnselect = React.useCallback(
      (option: OptionProps) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const handleSelect = React.useCallback(
      (option: OptionProps) => {
        if (selected.length >= maxSelected && maxSelected !== 1) {
          onMaxSelected?.(selected.length, option);
          return;
        }
        setInputValue("");
        if (maxSelected === 1) {
          setSelected([option]);
          onChange?.([option]);
          setOpen(false);
          inputRef.current?.blur();
          return;
        }
        const newOptions = [...selected, option];
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected, maxSelected, onMaxSelected]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              // If there is a last item and it is not fixed, we can remove it.
              if (lastSelectOption && !lastSelectOption.fixed) {
                handleUnselect(lastSelectOption);
              }
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open, handleClickOutside]);

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;

        if (triggerSearchOnFocus) {
          doSearchSync();
        }

        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearchSync]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        if (triggerSearchOnFocus) {
          await doSearch();
        }

        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (isOptionsExist(options, inputValue) || selected.find((s) => s.value === inputValue)) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(_value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length, {
                value: _value,
                label: _value,
              });
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value: _value, label: _value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`新增「${inputValue}」`}
        </CommandItem>
      );

      // For normal creatable
      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      // For async search creatable. avoid showing creatable item before loading at first.
      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      // For async search that showing emptyIndicator
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    // 將所有選項扁平化，用於虛擬滾動
    const flatOptions = React.useMemo(() => {
      return Object.values(selectables).flat();
    }, [selectables]);

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (_value: string, _search: string) =>
          _value.toLowerCase().includes(_search.toLowerCase()) ? 1 : -1;
      }
      // Using default filter in `cmdk`. We don't have to provide it.
      return undefined;
    }, [creatable, commandProps?.filter]);

    return (
      <Command
        ref={dropdownRef}
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          "h-auto overflow-visible border border-solid border-basic-200 bg-transparent",
          commandProps?.className
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch && !virtualScroll // 虛擬滾動時也不要過濾，因為我們自己處理
        } // When onSearch or virtualScroll is provided, we don't want to filter the options. You can still override it.
        filter={commandFilter()}
      >
        <div
          role="textbox"
          tabIndex={0}
          className={cn(
            "body-sm min-h-[38px] rounded-md border border-input ring-offset-background focus-within:ring-1 focus-within:ring-primary-base focus-within:ring-ring",
            {
              "px-2 py-1": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            className
          )}
          onClick={() => {
            if (disabled) return;
            inputRef?.current?.focus();
          }}
          onKeyDown={(e) => {
            switch (e.key) {
              case " ":
              case "Enter":
              case "ArrowUp":
              case "ArrowDown":
                if (disabled) return;
                inputRef?.current?.focus();
                break;
              default:
                break;
            }
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelected(selected.filter((s) => s.fixed));
              onChange?.(selected.filter((s) => s.fixed));
            }}
            className={cn(
              "float-right mb-1.5 mt-1 size-6",
              (hideClearAllButton ||
                disabled ||
                selected.length < 1 ||
                selected.filter((s) => s.fixed).length === selected.length) &&
                "hidden"
            )}
          >
            <X />
          </Button>
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant={maxSelected === 1 ? "secondary" : "gray"}
              className={cn(
                "float-left m-0.5",
                "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                maxSelected === 1 && "px-0",
                badgeClassName
              )}
              data-fixed={option.fixed}
              data-disabled={disabled || undefined}
            >
              {option.label}
              {maxSelected !== 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "-m-1 ml-0 size-5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    (disabled || option.fixed) && "hidden"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="size-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </Badge>
          ))}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(_value) => {
              setInputValue(_value);
              inputProps?.onValueChange?.(_value);
            }}
            onBlur={(event) => {
              if (!onScrollbar) {
                setOpen(false);
              }
              inputProps?.onBlur?.(event);
            }}
            onFocus={(event) => {
              setOpen(true);
              inputProps?.onFocus?.(event);
            }}
            placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? "" : placeholder}
            className={cn(
              "float-left flex-1 w-full border border-transparent bg-transparent outline-none placeholder:text-muted-foreground",
              {
                "w-0 focus:w-full": hidePlaceholderWhenSelected && selected.length !== 0,
                "min-h-[38px] px-3 py-2": selected.length === 0,
                "ml-1": selected.length !== 0,
              },
              inputProps?.className
            )}
          />
        </div>
        <div className="relative">
          {open && (
            <CommandList
              className={cn(
                "absolute top-1 z-50 w-full rounded-md border bg-white text-basic-600 shadow-md outline-none animate-in",
                virtualScroll && flatOptions.length > 0 && "overflow-hidden" // 虛擬滾動時禁用 CommandList 的滾動
              )}
              onMouseLeave={() => {
                setOnScrollbar(false);
              }}
              onMouseEnter={() => {
                setOnScrollbar(true);
              }}
              onMouseUp={() => {
                inputRef?.current?.focus();
              }}
            >
              {isLoading ? (
                loadingIndicator
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                  {virtualScroll && flatOptions.length > 0 ? (
                    // 虛擬滾動渲染
                    <VirtualizedOptionsList
                      options={flatOptions}
                      onSelect={handleSelect}
                      virtualScrollOptions={{
                        itemHeight: virtualScrollOptions?.itemHeight ?? 32,
                        maxHeight: virtualScrollOptions?.maxHeight ?? 200,
                        overscan: virtualScrollOptions?.overscan ?? 5,
                      }}
                    />
                  ) : (
                    // 傳統渲染（支援分組）
                    Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                        {dropdowns.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            disabled={option.disable}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={() => handleSelect(option)}
                            className={cn(
                              "cursor-pointer",
                              option.disable && "cursor-default text-muted-foreground"
                            )}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))
                  )}
                </>
              )}
            </CommandList>
          )}
        </div>
      </Command>
    );
  }
);
MultipleSelector.displayName = "MultipleSelector";

interface FormMultipleSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  defaultOptions?: OptionProps[];
  options?: OptionProps[];
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<OptionProps[]>;
  onSearchSync?: (value: string) => OptionProps[];
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  hideClearAllButton?: boolean;
  /** Custom function to transform field values to OptionProps */
  valueToOption?: (value: string, options?: OptionProps[]) => OptionProps;
  /** Enable virtual scrolling for large lists */
  virtualScroll?: boolean;
  /** Virtual scrolling configuration */
  virtualScrollOptions?: MultipleSelectorProps["virtualScrollOptions"];
}

const defaultValueToOption = (value: string, options?: OptionProps[]): OptionProps => ({
  value,
  label: options?.find((opt) => opt.value === value)?.label || value,
});

const FormMultipleSelector = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  disabled,
  placeholder,
  defaultOptions,
  options,
  loadingIndicator,
  emptyIndicator,
  delay,
  triggerSearchOnFocus,
  onSearch,
  onSearchSync,
  maxSelected,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  groupBy,
  className,
  badgeClassName,
  selectFirstItem,
  creatable,
  commandProps,
  inputProps,
  hideClearAllButton,
  valueToOption = defaultValueToOption,
  virtualScroll,
  virtualScrollOptions,
}: FormMultipleSelectorProps<TFieldValues, TName>) => (
  <FormFieldWrapper control={control} name={name} label={label} required={required}>
    {(field) => (
      <MultipleSelector
        ref={field.ref}
        value={
          Array.isArray(field.value)
            ? field.value.map((val: string) => valueToOption(val, options || defaultOptions))
            : []
        }
        onChange={(selectedOptions) => field.onChange(selectedOptions.map((opt) => opt.value))}
        disabled={disabled}
        placeholder={placeholder}
        defaultOptions={defaultOptions}
        options={options}
        loadingIndicator={loadingIndicator}
        emptyIndicator={emptyIndicator}
        delay={delay}
        triggerSearchOnFocus={triggerSearchOnFocus}
        onSearch={onSearch}
        onSearchSync={onSearchSync}
        maxSelected={maxSelected}
        onMaxSelected={onMaxSelected}
        hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
        groupBy={groupBy}
        className={className}
        badgeClassName={badgeClassName}
        selectFirstItem={selectFirstItem}
        creatable={creatable}
        commandProps={commandProps}
        inputProps={inputProps}
        hideClearAllButton={hideClearAllButton}
        virtualScroll={virtualScroll}
        virtualScrollOptions={virtualScrollOptions}
      />
    )}
  </FormFieldWrapper>
);

FormMultipleSelector.displayName = "FormMultipleSelector";

export { FormMultipleSelector };
