'use client';

import { useReducer } from 'react';
import { toast } from 'sonner';
import { SearchIcon } from 'lucide-react';
import { Input, Label, Checkbox } from '@/shared/ui';
import { MultipleSelector } from '@/shared/ui/multiple-selector';
import { Badge } from '@/shared/ui/badge';
import { Text } from '@/shared/ui/typography';
import { Speech } from '@/shared/ui/speech';
import { ALL_AREAS } from '@/constants/areas';
import { ACTIVITY_CATEGORIES, CATEGORIES } from '@/constants/category';
import { EDUCATION } from '@/constants/member';
import useQueryState from '@/shared/lib/use-query-state';
import { OptionProps } from '@/shared/ui/option';
import type { CircleSearchParams } from '@/entities/circle';
import { circleSearchParamsSchema } from '@/entities/circle';

export const CircleSearchForm = () => {
  const [query, setQuery] = useQueryState(circleSearchParamsSchema);
  const [inputKey, forceUpdateInputKey] = useReducer((prev) => prev + 1, 0);

  const handleMultipleChange =
    (key: keyof CircleSearchParams) => (options: OptionProps[]) => {
      setQuery({ ...query, [key]: options.map((item) => item.value) });
    };

  const formatOptions = (
    options: string[] | undefined,
    mapping: OptionProps[]
  ) => {
    if (!options) return [];
    return options.map((item) => ({
      value: item,
      label: mapping.find(({ value }) => value === item)?.label ?? item,
    }));
  };

  return (
    <>
      <div className="relative">
        <Input
          key={inputKey}
          type="search"
          name="search"
          placeholder="想尋找甚麼類型的揪團呢?"
          inputClassName="rounded-full pr-24"
          defaultValue={query.search}
          suffixIcon={<SearchIcon size={16} />}
          onSuffixIconClick={(search) => setQuery({ ...query, search })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setQuery({ ...query, search: e.currentTarget.value });
            }
          }}
        />
        <Speech
          variant="ghost"
          size="icon"
          className="absolute right-11 top-1/2 -translate-y-1/2 text-basic-300"
          onTranscriptEnd={(transcript) => {
            setQuery({ ...query, search: transcript });
            forceUpdateInputKey();
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <MultipleSelector
          options={ALL_AREAS}
          placeholder="地點"
          maxSelected={5}
          onMaxSelected={() => toast.error('最多選擇 5 個地點')}
          value={formatOptions(query.area, ALL_AREAS)}
          onChange={handleMultipleChange('area')}
        />
        <MultipleSelector
          options={ACTIVITY_CATEGORIES}
          placeholder="揪團類型"
          maxSelected={5}
          onMaxSelected={() => toast.error('最多選擇 5 個揪團類型')}
          value={formatOptions(query.activityCategory, ACTIVITY_CATEGORIES)}
          onChange={handleMultipleChange('activityCategory')}
        />
        <MultipleSelector
          options={EDUCATION}
          placeholder="適合的學習階段"
          value={formatOptions(query.partnerEducationStep, EDUCATION)}
          onChange={handleMultipleChange('partnerEducationStep')}
        />
        <Label
          htmlFor="isEnded"
          className="ml-auto flex items-center gap-1 text-nowrap py-3"
        >
          <Checkbox
            id="isEnded"
            checked={query.isGrouping === false}
            onCheckedChange={(checked) =>
              setQuery({ ...query, isGrouping: checked ? false : undefined })
            }
          />
          已結束
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Text size="sm" className="shrink-0 text-basic-400">
          學習領域
        </Text>
        <div className="flex gap-2 overflow-x-auto">
          <Badge
            variant={!query.category?.length ? 'default' : 'outline'}
            className="shrink-0 cursor-pointer"
            onClick={() => setQuery({ ...query, category: undefined })}
          >
            全部
          </Badge>
          {CATEGORIES.map(({ value, label }) => (
            <Badge
              key={value}
              variant={query.category?.includes(value) ? 'default' : 'outline'}
              className="shrink-0 cursor-pointer"
              onClick={() =>
                setQuery({
                  ...query,
                  category: query.category?.includes(value)
                    ? query.category.filter((item) => item !== value)
                    : [...(query.category || []), value],
                })
              }
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
};

