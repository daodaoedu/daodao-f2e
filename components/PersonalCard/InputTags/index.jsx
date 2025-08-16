import { Text } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { forwardRef } from 'react';

const Tag = ({ label, onCancel }) => (
  <div className="flex items-center text-[#293A3D] bg-[#DEF5F5] rounded p-2 mr-2 mb-2">
    <Text className="whitespace-nowrap pr-0.5 font-normal text-sm leading-[140%] mr-1">
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
    <div className="w-full border border-[#DBDBDB] rounded border-solid items-center py-2 px-4 min-h-[50px]">
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
          className="border-0 p-0 min-w-[50px] w-auto flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}

export default forwardRef(InputTags);
