import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { FaArrowRight } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { cn } from '@/utils/cn';
import { MdSend, MdClose, MdEdit } from 'react-icons/md';
import Button from '@/shared/components/Button';
import DateRangePicker from '@/shared/components/DateRangePicker';
import Form from '@/shared/components/Form';
import { useDialog } from '@/contexts/Dialog';
import { useProject } from '@/hooks/api/project';
import {
  CreateProjectMilestoneRequest,
  createProjectMilestoneSchema,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneRequest,
  updateProjectMilestoneSchema,
} from '@/services/projects/milestones';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDefaultMilestone } from './Shared';

interface MilestoneCardProps {
  projectId: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  milestone?: Partial<ProjectMilestoneSchema>;
  milestones?: ProjectMilestoneSchema[];
  disabledChangeDate?: boolean;
  isEditable?: boolean;
  defaultEditing?: boolean;
  onCancel?: () => void;
  onCreate?: (request: CreateProjectMilestoneRequest) => Promise<void>;
  onUpdate?: (request: UpdateProjectMilestoneRequest) => Promise<void>;
}

export interface MilestoneFormRef {
  focus: () => void;
}

function MilestoneCard(
  {
    projectId,
    startDate,
    endDate,
    milestone = {},
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
  const preEditingStateRef = useRef(!isEditing);
  const tasksInfo = useMemo(() => {
    if (!Array.isArray(milestone.tasks) || !milestone.tasks.length) {
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
  }, [milestone.tasks]);
  const { data: project } = useProject({ id: projectId });

  const { openDialog } = useDialog();

  const index = useMemo(
    () =>
      Array.isArray(milestones)
        ? milestones.findIndex((m) => m.id === milestone.id)
        : -1,
    [milestones, milestone.id]
  );

  const schema = milestone.id
    ? updateProjectMilestoneSchema
    : createProjectMilestoneSchema;

  const methods = useForm<
    typeof milestone.id extends undefined
      ? CreateProjectMilestoneRequest
      : UpdateProjectMilestoneRequest
  >({ resolver: zodResolver(schema) });

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  const isCompleted = methods.watch('isCompleted') ?? milestone.isCompleted;

  const checkDiff = (data: UpdateProjectMilestoneRequest) => {
    const checkKeys = ['startDate', 'endDate', 'name'] as const;

    return checkKeys.some((key) => {
      return data[key] !== milestone[key];
    });
  };

  const handleSubmit = async (
    data: CreateProjectMilestoneRequest | UpdateProjectMilestoneRequest
  ) => {
    const updateRequest = updateProjectMilestoneSchema.safeParse(data);
    const createRequest = createProjectMilestoneSchema.safeParse(data);

    if (isLoading) return;

    try {
      if (updateRequest.success) {
        if (!checkDiff(updateRequest.data)) {
          handleCancel();
          return;
        }

        setIsLoading(true);
        await onUpdate?.(updateRequest.data);
      } else if (createRequest.success) {
        setIsLoading(true);
        await onCreate?.(createRequest.data);
      }
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleError: SubmitErrorHandler<
    CreateProjectMilestoneRequest | UpdateProjectMilestoneRequest
  > = (error) => {
    Object.values(error).forEach((value) => {
      toast.error(value.message || '發生錯誤');
    });
  };

  const handleComplete = async () => {
    const targetIsCompleted = !milestone.isCompleted;

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

    const updateRequest = updateProjectMilestoneSchema.safeParse(
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

  const handleFocus = useCallback(() => {
    methods.setFocus('name');
  }, [methods]);

  useImperativeHandle(ref, () => ({
    focus: handleFocus,
  }));

  useEffect(() => {
    if (isEditing !== preEditingStateRef.current) {
      const defaultValues = getDefaultMilestone({
        projectId,
        milestones: Array.isArray(milestones) ? milestones : [],
        startDate: startDate || dayjs(),
        endDate: endDate || dayjs(),
      });

      Object.entries({ ...defaultValues, ...milestone }).forEach(
        ([key, value]) => {
          const passKey = schema.keyof().safeParse(key).data;

          if (!passKey) return;

          const result = schema.shape[passKey].safeParse(value);

          if (result.success) {
            methods.setValue(passKey, result.data);
          }
        }
      );

      handleFocus();
      preEditingStateRef.current = isEditing;
    }
  }, [
    isEditing,
    milestone,
    projectId,
    startDate,
    endDate,
    milestones,
    methods,
    handleFocus,
  ]);

  return (
    <Form methods={methods} onSubmit={handleSubmit} onError={handleError}>
      <div
        className={cn(
          'p-2.5 md:py-3 md:px-4 rounded-lg bg-white',
          isLoading && 'opacity-80'
        )}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center">
            <div className="text-primary-base body-sm">
              里程碑 {index > -1 && index + 1}
            </div>
            {index > -1 && (
              <span className="hidden md:block ml-3 body-sm text-basic-300">
                {tasksInfo.progress}%
              </span>
            )}
          </div>
          <DateRangePicker
            startDate={
              isEditing
                ? dayjs(methods.watch('startDate'))
                : dayjs(milestone.startDate)
            }
            endDate={
              isEditing
                ? dayjs(methods.watch('endDate'))
                : dayjs(milestone.endDate)
            }
            minDate={startDate}
            maxDate={endDate}
            disabledStartDate={disabledChangeDate || !isEditing}
            disabledEndDate={disabledChangeDate || !isEditing}
            separator={<FaArrowRight className="text-basic-300" />}
            className={cn(
              '-mx-1 px-1 py-0 gap-1.5 body-sm text-basic-300 rounded',
              !isEditing && 'cursor-default border-transparent'
            )}
            onStartDateChange={(d) => {
              methods.setValue('startDate', d.format('YYYY/MM/DD'), {
                shouldDirty: true,
              });
            }}
            onEndDateChange={(d) => {
              methods.setValue('endDate', d.format('YYYY/MM/DD'), {
                shouldDirty: true,
              });
            }}
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="w-full flex items-center  md:justify-between gap-1">
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
                  htmlFor={`${elementId}-${milestone.id}`}
                  className={cn(
                    'flex flex-row justify-center items-center gap-1.5 hover:cursor-pointer w-full basis-0',
                    !isEditable && 'pointer-events-none'
                  )}
                >
                  <input
                    type="checkbox"
                    id={`${elementId}-${milestone.id}`}
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
                    {isCompleted && <FaCheck />}
                  </p>
                </label>
                <p className="font-sans py-2 body-sm text-basic-400 truncate">
                  {milestone.name}
                </p>
              </>
            )}
            <div className="flex flex-row gap-1 ml-auto">
              {isEditing && (
                <>
                  <Button
                    className="rounded-sm text-lg"
                    variant="solid"
                    color="gray"
                    size="icon"
                    onClick={handleCancel}
                  >
                    <MdClose />
                  </Button>
                  <Button
                    className="rounded-sm text-lg"
                    variant="solid"
                    color="gray"
                    size="icon"
                    isSubmit
                  >
                    <MdSend />
                  </Button>
                </>
              )}
              {!isEditing && isEditable && (
                <Button
                  className="rounded-sm text-lg"
                  variant="solid"
                  color="gray"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <MdEdit />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}

export default forwardRef(MilestoneCard);
