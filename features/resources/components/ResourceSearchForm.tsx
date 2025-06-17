import { ReactNode } from "react";
import { InfoIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import {
  ResourceSearchParamsSchema,
  resourceSearchParamsSchema,
} from "@/services/resources/core/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import {
  durationTypes,
  costTypes,
  targetAudienceTypes,
  resourceTypes,
} from "../constants";

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
    <FormLabel className="cursor-pointer flex-1 m-0 p-3 flex items-center gap-2">
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

  const handleClear = (
    type: "resourceType" | "cost" | "targetAudience" | "tags"
  ) => {
    form.setValue(type, "");
  };

  function onSubmit(data: ResourceSearchParamsSchema) {
    onFilter(data);
    onClose();
  }

  const handleCheckboxChange = (
    field: ControllerRenderProps<
      ResourceSearchParamsSchema,
      "cost" | "resourceType" | "targetAudience" | "tags"
    >,
    itemId: string,
    checked: boolean
  ) => {
    if (checked) {
      field.onChange(field.value ? `${field.value},${itemId}` : itemId);
    } else {
      const updatedValue = (field.value ?? "")
        .split(",")
        .filter((value) => value !== itemId)
        .join(",");

      field.onChange(updatedValue);
    }
  };

  const getResourceTypeDescription = (id: string) => {
    switch (id) {
      case "learning-platform":
        return "專門用於學習的平台或應用程式，提供多種課程和學習資源";
      case "learning-tool":
        return "輔助學習的工具，如筆記軟體、繪圖工具等";
      case "book":
        return "包含紙本書籍、電子書、文章或其他文字形式的學習資源";
      case "video":
        return "包含教學視頻、講座錄影等影片形式的學習資源";
      case "podcast":
        return "以音頻形式提供的學習內容和討論";
      case "workshop":
        return "實體或線上的工作坊、講座和課程";
      case "certificate":
        return "可獲得專業認證的課程或學習計劃";
      case "online-course":
        return "各大線上學習平台提供的系統性課程";
      default:
        return "資源類型";
    }
  };

  const getTargetAudienceDescription = (id: string) => {
    switch (id) {
      case "beginner":
        return "適合剛開始學習，沒有相關基礎知識的人";
      case "intermediate":
        return "適合已有基礎知識，想要進一步深入學習的人";
      case "expert":
        return "適合已有相當程度專業知識，想要精進特定領域的人";
      default:
        return "適合對象";
    }
  };

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 bg-white p-6 rounded-xl">
            {/* 資源類型 */}
            <FormSection
              title="資源類型"
              onClear={() => handleClear("resourceType")}
            >
              <FormField
                control={form.control}
                name="resourceType"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {resourceTypes.map((type) => (
                        <CheckboxItem
                          key={type.id}
                          label={type.label}
                          isChecked={
                            !!field.value?.split(",").includes(type.id)
                          }
                          onChange={(checked) =>
                            handleCheckboxChange(field, type.id, checked)
                          }
                          hasTooltip
                          tooltipContent={getResourceTypeDescription(type.id)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* 費用 */}
            <FormSection title="費用" onClear={() => handleClear("cost")}>
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {costTypes.map((type) => (
                        <CheckboxItem
                          key={type.id}
                          label={type.label}
                          isChecked={
                            !!field.value?.split(",").includes(type.id)
                          }
                          onChange={(checked) =>
                            handleCheckboxChange(field, type.id, checked)
                          }
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* 適合對象 */}
            <FormSection
              title="適合"
              onClear={() => handleClear("targetAudience")}
            >
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {targetAudienceTypes.map((type) => (
                        <CheckboxItem
                          key={type.id}
                          label={type.label}
                          isChecked={
                            !!field.value?.split(",").includes(type.id)
                          }
                          onChange={(checked) =>
                            handleCheckboxChange(field, type.id, checked)
                          }
                          hasTooltip
                          tooltipContent={getTargetAudienceDescription(type.id)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* 所需學習時間 */}
            <FormSection
              title="所需學習時間"
              onClear={() => handleClear("tags")}
            >
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {durationTypes.map((item) => (
                        <CheckboxItem
                          key={item.id}
                          label={item.label}
                          isChecked={
                            !!field.value?.split(",").includes(item.id)
                          }
                          onChange={(checked) =>
                            handleCheckboxChange(field, item.id, checked)
                          }
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
