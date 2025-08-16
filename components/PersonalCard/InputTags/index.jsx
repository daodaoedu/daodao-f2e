import { Text } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { forwardRef } from 'react';

const Tag = ({ label, onCancel }) => (
  <div className="mb-2 mr-2 flex items-center rounded bg-[#DEF5F5] p-2 text-[#293A3D]">
    <Text className="mr-1 whitespace-nowrap pr-0.5 text-sm font-normal leading-[140%]">
      {label}
    </Text>
    <X
      className="cursor-pointer text-xs"
      size={12}
      onClick={onCancel}
    />
  </div>
);

function InputTags({ value = [], change }, ref) {
  const keyDownHandle = (e) => {
    if (e.keyCode === 13) {
      if (!value.includes(e.target.value)) {
        change(e.target.value);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="min-h-[50px] w-full items-center rounded border border-solid border-[#DBDBDB] px-4 py-2">
      <div className="mt-1.5 flex flex-wrap items-center">
        {Array.isArray(value) &&
          value.map(
            (item) => typeof item === 'string' && (
            <Tag key={item} label={item} onCancel={() => change(item)} />
            )
          )}
        <Input
          ref={ref}
          placeholder={value.length ? '' : '搜尋或新增標籤'}
          onKeyDown={keyDownHandle}
          className="w-auto min-w-[50px] flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}

export default forwardRef(InputTags);
