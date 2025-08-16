import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/typography';
import { StyledGroup } from './Edit.styled';

function EditFormInput(
  {
    title = '',
    parmKey = '',
    value = '',
    onChange = () => ({}),
    errorMsg = '',
    isRequire = false,
    placeholder = '',
  },
  ref
) {
  return (
    <StyledGroup>
      <Text className="font-medium">
        {title}
        {' '}
        {isRequire && '*'}
      </Text>
      <Input
        ref={ref}
        name={parmKey}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange({ key: parmKey, value: e.target.value })}
        className={errorMsg ? 'border-red-500' : ''}
      />
      {errorMsg && (
        <Text className="mt-1 text-sm text-red-500">
          {errorMsg}
        </Text>
      )}
    </StyledGroup>
  );
}

export default forwardRef(EditFormInput);
