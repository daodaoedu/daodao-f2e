import { ReactNode } from 'react';
import { InfoIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  ResourceSearchParamsSchema,
  resourceSearchParamsSchema,
} from '@/services/resources/core/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  costTypeOptions,
  targetAudienceTypeOptions,
  resourceTypeOptions,
} from '../constants';

interface SearchFormProps {
  onFilter: (filters: ResourceSearchParamsSchema) => void;
  onClose: () => void;
  filters?: Partial<ResourceSearchParamsSchema>;
}

interface FormSectionProps {
  title: string;
  onClear: () => void;
  children: ReactNode;
}

const FormSection = ({ title, onClear, children }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="body-md font-bold text-lg">{title}</h3>
      <Button
        type="button"
        onClick={onClear}
        variant="ghost"
        size="sm"
        className="h-7 text-gray-500 hover:text-gray-700"
      >
        清除
      </Button>
    </div>
    {children}
  </div>
);

interface CheckboxItemProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  tooltipContent?: string;
  hasTooltip?: boolean;
}

const CheckboxItem = ({
  label,
  isChecked,
  onChange,
  tooltipContent,
  hasTooltip = false,
}: CheckboxItemProps) => (
  <FormItem className="flex items-center border border-solid border-basic-200 rounded-lg relative gap-2">
    <FormLabel className="cursor-pointer flex-1 m-0 p-3 flex items-center gap-2 body-md font-normal">
      <FormControl>
        <Checkbox checked={isChecked} onCheckedChange={onChange} />
      </FormControl>
      {label}
      {hasTooltip && tooltipContent && (
        <Tooltip>
          <TooltipTrigger className="ml-auto" asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 text-basic-200 hover:text-basic-300"
              aria-label={`關於${label}的資訊`}
            >
              <InfoIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-gray-800 border shadow-md p-2">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      )}
    </FormLabel>
  </FormItem>
);

export default function ResourceSearchForm({
  onFilter,
  onClose,
  filters,
}: SearchFormProps) {
  const form = useForm({
    resolver: zodResolver(resourceSearchParamsSchema),
    values: filters,
  });

  const handleClear = (type: 'type' | 'cost' | 'level' | 'tags') => {
    form.setValue(type, '');
  };

  function onSubmit(data: ResourceSearchParamsSchema) {
    onFilter(data);
    onClose();
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 bg-white p-6 rounded-xl">
            {/* 資源類型 */}
            <FormSection title="資源類型" onClear={() => handleClear('type')}>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {resourceTypeOptions.map((type) => (
                        <CheckboxItem
                          key={type.value}
                          label={type.label}
                          isChecked={field.value === type.value}
                          onChange={(checked) => field.onChange(checked ? type.value : '')}
                          hasTooltip
                          tooltipContent={type.description}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* 費用 */}
            <FormSection title="費用" onClear={() => handleClear('cost')}>
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {costTypeOptions.map((type) => (
                        <CheckboxItem
                          key={type.value}
                          label={type.label}
                          isChecked={field.value === type.value}
                          onChange={(checked) => field.onChange(checked ? type.value : '')}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* 適合對象 */}
            <FormSection title="適合" onClear={() => handleClear('level')}>
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {targetAudienceTypeOptions.map((type) => (
                        <CheckboxItem
                          key={type.value}
                          label={type.label}
                          isChecked={field.value === type.value}
                          onChange={(checked) => field.onChange(checked ? type.value : '')}
                          hasTooltip
                          tooltipContent={type.description}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </div>

          {/* 確認按鈕 */}
          <div className="flex justify-center mt-6">
            <Button type="submit">
              <CheckIcon size={20} />
              確認
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}
