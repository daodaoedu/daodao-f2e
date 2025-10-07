import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import {
  ArrowRight, Check, SendHorizonal, X, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DateRange } from 'react-day-picker';
import { format, toDate, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import { Button } from '@/shared/ui/button';
import { Form } from '@/shared/ui/form';
import { useDialog } from '@/contexts/Dialog';
import {
  useProject,
  ProjectMilestoneSchema,
  ProjectMilestoneFormSchema,
  projectMilestoneFormSchema,
} from '@/services/projects';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateRangePicker } from '@/shared/ui/date-picker';
import { getDefaultMilestone } from './Shared';

interface MilestoneCardProps {
  projectId: string;
  minDate?: Date;
  maxDate?: Date;
  milestone?: ProjectMilestoneSchema;
  milestones?: ProjectMilestoneSchema[];
  disabledChangeDate?: boolean;
  isEditable?: boolean;
  defaultEditing?: boolean;
  onCancel?: () => void;
  onCreate?: (request: ProjectMilestoneFormSchema) => void | Promise<unknown>;
  onUpdate?: (request: ProjectMilestoneFormSchema) => void | Promise<unknown>;
}

export interface MilestoneFormRef {
  focus: () => void;
}

function MilestoneCard(
  {
    projectId,
    minDate,
    maxDate,
    milestone,
    milestones = [],
    disabledChangeDate,
    isEditable = false,
    defaultEditing = false,
    onCancel,
    onCreate,
    onUpdate,
  }: MilestoneCardProps,
  ref: React.Ref<MilestoneFormRef>
) {
  const elementId = useId();
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [isLoading, setIsLoading] = useState(false);
  const { openDialog } = useDialog();
  const { data: project } = useProject(projectId);

  const tasksInfo = useMemo(() => {
    if (!Array.isArray(milestone?.tasks) || !milestone?.tasks.length) {
      return {
        isCompleteAll: true,
        progress: 100,
      };
    }
    const totalCount = milestone.tasks.length;
    const completeCount = milestone.tasks.filter(
      (task) => task.isCompleted
    ).length;
    const isCompleteAll = completeCount === totalCount;
    const progress = Math.round((completeCount / totalCount) * 100);

    return {
      isCompleteAll,
      progress,
    };
  }, [milestone?.tasks]);

  const index = useMemo(
    () => (Array.isArray(milestones)
      ? milestones.findIndex((m) => m.id === milestone?.id)
      : -1),
    [milestones, milestone?.id]
  );

  const values = useMemo(
    () => (milestone ? { ...milestone, projectId } : undefined),
    [milestone, projectId]
  );

  const methods = useForm({
    resolver: zodResolver(projectMilestoneFormSchema),
    values,
    defaultValues: getDefaultMilestone({
      projectId,
      milestones: Array.isArray(milestones) ? milestones : [],
      minDate: minDate || new Date(),
      maxDate: maxDate || new Date(),
    }),
  });

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  const isCompleted = methods.watch('isCompleted') ?? milestone?.isCompleted;

  const checkDiff = (data: ProjectMilestoneFormSchema) => {
    const checkKeys = ['startDate', 'endDate', 'name'] as const;

    return checkKeys.some((key) => data[key] !== milestone?.[key]);
  };

  const handleSubmit = async (data: ProjectMilestoneFormSchema) => {
    const requestDate = projectMilestoneFormSchema.safeParse(data);

    if (isLoading) return;

    try {
      if (requestDate.success) {
        if (!checkDiff(requestDate.data)) {
          handleCancel();
          return;
        }

        setIsLoading(true);

        if (milestone?.id) {
          await onUpdate?.(requestDate.data);
        } else {
          await onCreate?.(requestDate.data);
        }
      }
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError: SubmitErrorHandler<ProjectMilestoneFormSchema> = (
    error
  ) => {
    toast.error(Object.values(error)[0]?.message || '發生錯誤');
  };

  const handleComplete = async () => {
    const targetIsCompleted = !milestone?.isCompleted;

    if (isLoading || !isEditable) return;

    if (!tasksInfo.isCompleteAll && targetIsCompleted) {
      toast.error('請先完成所有子任務');
      return;
    }

    if (targetIsCompleted && project?.version === 1) {
      const result = await openDialog({
        content:
          '勾選後，計畫就視為開始，屆時將無法修改計畫的開始時間，是否繼續？',
        onConfirm: () => {
          methods.setValue('isCompleted', targetIsCompleted);
        },
      });

      if (!result) {
        return;
      }
    }

    if (!targetIsCompleted) {
      const result = await openDialog({
        content: '取消勾選後，里程碑將會被視為未完成，是否繼續？',
        onConfirm: () => {
          methods.setValue('isCompleted', targetIsCompleted);
        },
      });

      if (!result) {
        return;
      }
    }

    methods.setValue('isCompleted', targetIsCompleted);

    const updateRequest = projectMilestoneFormSchema.safeParse(
      methods.getValues()
    );

    try {
      if (updateRequest.success) {
        setIsLoading(true);
        await onUpdate?.(updateRequest.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const date = useMemo<DateRange>(() => {
    const formatValue = (d?: string) => {
      if (!d) return undefined;
      const parsed = toDate(d);
      return isValid(parsed) ? parsed : undefined;
    };

    if (isEditing) {
      return {
        from: formatValue(methods.watch('startDate')),
        to: formatValue(methods.watch('endDate')),
      };
    }
    return {
      from: formatValue(milestone?.startDate),
      to: formatValue(milestone?.endDate),
    };
  }, [
    isEditing,
    methods.watch('startDate'),
    methods.watch('endDate'),
    milestone?.startDate,
    milestone?.endDate,
  ]);

  const handleFocus = useCallback(() => {
    methods.setFocus('name');
  }, [methods]);

  useImperativeHandle(ref, () => ({
    focus: handleFocus,
  }));

  useEffect(() => {
    if (isEditing) handleFocus();
  }, [isEditing, handleFocus]);

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit, handleError)}>
        <div
          className={cn(
            'p-2.5 md:py-3 md:px-4 rounded-lg bg-white',
            isLoading && 'opacity-80'
          )}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center">
              <div className="body-sm text-primary-base">
                里程碑
                {' '}
                {index > -1 && index + 1}
              </div>
              {index > -1 && (
                <span className="body-sm ml-3 hidden text-basic-300 md:block">
                  {tasksInfo.progress}
                  %
                </span>
              )}
            </div>
            <DateRangePicker
              value={date}
              fromDate={minDate}
              toDate={maxDate}
              className={cn(
                'p-1 min-w-40 h-6 gap-1.5 body-sm text-basic-300 rounded',
                !isEditing && 'disabled:text-basic-300'
              )}
              disabled={disabledChangeDate || !isEditing}
              separator={<ArrowRight className="text-basic-300" />}
              onChange={(d) => {
                methods.setValue(
                  'startDate',
                  d?.from ? format(d.from, 'yyyy/MM/dd') : undefined,
                  {
                    shouldDirty: true,
                  }
                );
                methods.setValue(
                  'endDate',
                  d?.to ? format(d.to, 'yyyy/MM/dd') : undefined,
                  {
                    shouldDirty: true,
                  }
                );
              }}
            />
          </div>
          <div className="flex w-full items-center gap-1 md:justify-between">
            {isEditing ? (
              <input
                type="text"
                className={cn(
                  '-m-px font-sans body-sm text-basic-400',
                  'w-full rounded-md px-6 py-2 border border-solid border-basic-200',
                  'focus:outline-none focus:ring-0 focus:border-primary-base'
                )}
                {...methods.register('name')}
              />
            ) : (
              <>
                <label
                  htmlFor={`${elementId}-${milestone?.id}`}
                  className={cn(
                    'flex flex-row justify-center items-center gap-1.5 hover:cursor-pointer w-full basis-0',
                    !isEditable && 'pointer-events-none'
                  )}
                >
                  <input
                    type="checkbox"
                    id={`${elementId}-${milestone?.id}`}
                    className="peer hidden"
                    checked={isCompleted}
                    onChange={handleComplete}
                  />
                  <p
                    className={cn(
                      'w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]',
                      'flex items-center justify-center',
                      'bg-white text-basic-400 border-2 border-solid border-basic-400',
                      'peer-checked:bg-primary-base',
                      'peer-checked:text-white',
                      'peer-checked:border-primary-base',
                      !isEditable && 'opacity-80'
                    )}
                  >
                    {isCompleted && <Check />}
                  </p>
                </label>
                <p className="body-sm truncate py-2 font-sans text-basic-400">
                  {milestone?.name}
                </p>
              </>
            )}
            <div className="ml-auto flex flex-row gap-1">
              {isEditing && (
                <>
                  <Button
                    className="rounded-sm text-lg"
                    variant="gray"
                    size="icon"
                    onClick={handleCancel}
                  >
                    <X />
                  </Button>
                  <Button
                    className="rounded-sm text-lg"
                    variant="gray"
                    size="icon"
                    type="submit"
                  >
                    <SendHorizonal />
                  </Button>
                </>
              )}
              {!isEditing && isEditable && (
                <Button
                  className="rounded-sm text-lg"
                  variant="gray"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default forwardRef(MilestoneCard);
