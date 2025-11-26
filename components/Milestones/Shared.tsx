import {
  addDays,
  isAfter,
  differenceInDays,
  subDays,
  format,
} from 'date-fns';
import z from 'zod';
import { cn } from '@/shared/lib/cn';
import {
  ProjectMilestoneFormSchema,
  ProjectMilestoneSchema,
} from '@/services/projects';

const idSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

export const validateIdWithZod = (id: string) => {
  try {
    const result = idSchema.parse(id);
    return {
      isValid: true,
      value: result,
    };
  } catch (error) {
    return {
      isValid: false,
      error,
    };
  }
};

export const numberToZh = (num: number): string => {
  const chineseNumbers = [
    '零',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
  ];

  if (num < 10) {
    return chineseNumbers[num] ?? '零';
  }

  const tens = Math.floor(num / 10);
  const units = num % 10;

  if (tens === 1) {
    return units === 0 ? '十' : `十${chineseNumbers[units] ?? ''}`;
  }

  if (units === 0) {
    return `${chineseNumbers[tens] ?? ''}十`;
  }

  return `${chineseNumbers[tens] ?? ''}十${chineseNumbers[units] ?? ''}`;
};

export const getMilestoneClassNames = ({
  isCompleted,
  isFocus,
  isEdit,
}: {
  isCompleted?: boolean;
  isFocus?: boolean;
  isEdit?: boolean;
}) =>
  cn(
    'w-full group cursor-pointer rounded-lg border bg-basic-white p-3 transition-all',
    {
      'shadow border-red-200 hover:shadow-md': !isCompleted,
      'shadow border-green-200 hover:shadow-md bg-green-50': isCompleted,
      'border-basic-600 shadow-lg': isFocus,
      'hover:shadow-none shadow border-basic-300': isEdit,
    }
  );

export const getMilestoneBadgeVariant = (isCompleted?: boolean) => {
  if (isCompleted) return 'success';
  return 'destructive';
};

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export const Panel = ({ children, className = '' }: PanelProps) => (
  <div
    className={cn(
      'w-full max-w-full sm:w-full mx-auto rounded-2xl p-3 md:p-10',
      className
    )}
  >
    {children}
  </div>
);

export const Title = ({
  title,
  className = '',
}: {
  title: string;
  className?: string;
}) => (
  <h3
    className={cn(
      'text-basic-500 body-md font-medium mb-2 font-sans',
      className
    )}
  >
    {title}
  </h3>
);

interface ProgressBarProps {
  progress: number; // 0 ~ 100
}

export const ProgressBar = ({ progress }: ProgressBarProps) => (
  <div className="flex w-full items-center">
    <div className="relative h-2 w-full overflow-hidden rounded-[100px]">
      <div
        className="h-full bg-primary-base transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="ml-3 font-sans text-sm text-basic-300">
      {progress}
      %
    </span>
  </div>
);

const calcEndDate = (
  startDate: Date,
  maxDate: Date,
  durationDays: number
): Date => {
  const endDate = addDays(startDate, durationDays - 1);
  return isAfter(endDate, maxDate) ? maxDate : endDate;
};

const calcEmptyDateRange = (
  minDate: Date,
  maxDate: Date,
  milestones: ProjectMilestoneSchema[]
): [Date, Date] => {
  if (milestones.length === 0) {
    const startDate = minDate;
    const endDate = isAfter(addDays(startDate, 6), maxDate)
      ? maxDate
      : addDays(startDate, 6);
    return [
      startDate,
      isAfter(endDate, startDate) ? endDate : addDays(startDate, 1),
    ];
  }

  let latestEndDate = addDays(new Date(milestones[0]?.endDate || new Date()), 1);

  for (let i = 1; i < milestones.length; i += 1) {
    const milestone = milestones[i];
    if (milestone) {
      const currentStartDate = new Date(milestone.startDate || new Date());
      const currentEndDate = addDays(new Date(milestone.endDate || new Date()), 1);

      if (
        isAfter(currentStartDate, latestEndDate) &&
        differenceInDays(currentStartDate, latestEndDate) > 1
      ) {
        break;
      }

      latestEndDate = isAfter(currentEndDate, latestEndDate)
        ? currentEndDate
        : latestEndDate;
    }
  }

  const startDate = isAfter(latestEndDate, maxDate)
    ? subDays(maxDate, 1)
    : latestEndDate;

  return [startDate, calcEndDate(startDate, maxDate, 7)];
};

interface GetDefaultMilestoneProps {
  projectId: string;
  milestones: ProjectMilestoneSchema[];
  minDate: Date;
  maxDate: Date;
}

export const getDefaultMilestone = ({
  projectId,
  milestones,
  minDate,
  maxDate,
}: GetDefaultMilestoneProps): ProjectMilestoneFormSchema => {
  const [startDate, endDate] = calcEmptyDateRange(minDate, maxDate, milestones);

  return {
    name: '',
    isCompleted: false,
    projectId,
    startDate: format(startDate, 'yyyy/MM/dd'),
    endDate: format(endDate, 'yyyy/MM/dd'),
    position: 1000,
  };
};
