import { useId } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { EMOJI_OPTIONS } from '@/constants/project';
import RadioBox from '@/shared/components/RadioBox';

type BaseRadioGroupProps<T extends FieldValues> = {
  type: 'emoji' | 'tenPoint';
  name: Path<T>;
};

type RadioGroupProps<T extends FieldValues> = BaseRadioGroupProps<T> &
  (
    | { control: Control<T>; value?: never }
    | { control?: never; value?: string | number }
  );

function RadioGroupWithoutControl<T extends FieldValues>({
  type,
  name,
  value,
}: RadioGroupProps<T>) {
  const getOptionProps = (option: string | number) => {
    return {
      name,
      value: option,
      isChecked: option === value,
      readOnly: true,
    };
  };

  if (type === 'emoji') {
    return (
      <div className="flex gap-1">
        {EMOJI_OPTIONS.map((option) => (
          <RadioBox
            key={option.value}
            className="pointer-events-none"
            {...getOptionProps(option.value)}
          >
            <div className="text-center">{option.emoji}</div>
            <div>{option.label}</div>
          </RadioBox>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((option) => (
        <RadioBox
          key={option}
          className="md:px-3 pointer-events-none"
          {...getOptionProps(option)}
        >
          {option}
        </RadioBox>
      ))}
    </div>
  );
}

function RadioGroupWithControl<T extends FieldValues>({
  type,
  name,
  control,
}: RadioGroupProps<T>) {
  const id = useId();
  const generateId = (tag: string) => `${id}-${tag}`;
  const { field, fieldState } = useController({ name, control });

  const getOptionProps = (option: string | number) => {
    return {
      ref: field.ref,
      id: generateId(option.toString()),
      name,
      value: option,
      isChecked: option === field.value,
      isError: !!fieldState.error,
      onChange: () => field.onChange(option),
    };
  };

  if (type === 'emoji') {
    return (
      <div className="flex gap-1">
        {EMOJI_OPTIONS.map((option) => (
          <RadioBox key={option.value} {...getOptionProps(option.value)}>
            <div className="text-center">{option.emoji}</div>
            <div>{option.label}</div>
          </RadioBox>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((option) => (
        <RadioBox key={option} className="md:px-3" {...getOptionProps(option)}>
          {option}
        </RadioBox>
      ))}
    </div>
  );
}

function RadioGroup<T extends FieldValues>(props: RadioGroupProps<T>) {
  if (props?.control) {
    return <RadioGroupWithControl {...props} />;
  }
  return <RadioGroupWithoutControl {...props} />;
}

export default RadioGroup;
