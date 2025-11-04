'use client';

import { useState, useEffect } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useWatch,
  useController,
} from 'react-hook-form';
import { PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Selector } from '@/shared/ui/select';
import { OptionProps } from '@/shared/ui/option';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui';

interface ContactItem {
  id: string;
  platform: string;
  value: string;
}

interface DynamicContactSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  options: OptionProps[];
  className?: string;
  platformPlaceholder?: string;
  valuePlaceholder?: string;
}

const generateId = () => crypto.randomUUID();

const getAvailableOptions = (
  allOptions: OptionProps[],
  selectedPlatforms: string[],
  currentPlatform?: string
): OptionProps[] => {
  return allOptions.filter(
    (option) =>
      !selectedPlatforms.includes(option.value) ||
      option.value === currentPlatform
  );
};

const getContactItems = (contactList: Record<string, string>) =>
  Object.entries(contactList)
    .filter(([, value]) => value && value.trim() !== '')
    .map(([platform, value]) => ({
      id: generateId(),
      platform,
      value,
    }));

export const DynamicContactSelector = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  options,
  className,
  platformPlaceholder,
  valuePlaceholder,
}: DynamicContactSelectorProps<TFieldValues, TName>) => {
  const { field } = useController({ control, name });
  const watchedValue = useWatch({ control, name }) as
    | Record<string, string>
    | undefined;

  // 從表單值初始化聯絡項目
  const [items, setItems] = useState<ContactItem[]>(() => {
    if (!watchedValue) return [];
    return getContactItems(watchedValue);
  });

  // 當表單值變化時同步更新項目（僅在初始化時）
  useEffect(() => {
    if (watchedValue && items.length === 0) {
      const newItems = getContactItems(watchedValue);
      setItems(newItems);
    }
  }, [watchedValue, items.length]);

  // 計算已選擇的平台
  const selectedPlatforms = items.map((item) => item.platform);

  // 計算最大項目數
  const effectiveMaxItems = options.length;

  // 是否可以新增更多項目
  const canAddMore = items.length < effectiveMaxItems;

  // 更新表單值
  const updateFormValue = (newItems: ContactItem[]) => {
    const newFormValue = newItems.reduce(
      (acc, item) => {
        if (item.platform && item.value.trim()) {
          acc[item.platform] = item.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    field.onChange(newFormValue);
  };

  // 新增聯絡項目
  const handleAddItem = () => {
    if (!canAddMore) return;

    const newItem: ContactItem = {
      id: generateId(),
      platform: '',
      value: '',
    };
    const newItems = [...items, newItem];
    setItems(newItems);
  };

  // 移除聯絡項目
  const handleRemoveItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    updateFormValue(newItems);
  };

  // 更新聯絡項目
  const handleUpdateItem = (
    id: string,
    fieldType: 'platform' | 'value',
    newValue: string
  ) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [fieldType]: newValue };

        // 如果是平台變更且新平台為空，清空值
        if (fieldType === 'platform' && !newValue) {
          updatedItem.value = '';
        }

        return updatedItem;
      }
      return item;
    });

    setItems(newItems);
    updateFormValue(newItems);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const availableOptions = getAvailableOptions(
          options,
          selectedPlatforms,
          item.platform
        );

        return (
          <div key={item.id} className="flex items-center gap-2">
            {/* 平台選擇 */}
            <div className="flex-1">
              <Selector
                options={availableOptions}
                placeholder={platformPlaceholder}
                value={item.platform}
                onValueChange={(value) =>
                  handleUpdateItem(item.id, 'platform', value || '')
                }
              />
            </div>

            {/* 值輸入 */}
            <div className="flex-[2]">
              <Input
                type="text"
                placeholder={valuePlaceholder}
                value={item.value}
                onChange={(e) =>
                  handleUpdateItem(item.id, 'value', e.target.value)
                }
                disabled={!item.platform}
              />
            </div>

            {/* 刪除按鈕 */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveItem(item.id)}
              aria-label="移除此社群連結"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        );
      })}

      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="rounded"
        >
          <PlusIcon className="size-4" />
          新增社群連結
        </Button>
      )}
    </div>
  );
};

DynamicContactSelector.displayName = 'DynamicContactSelector';
