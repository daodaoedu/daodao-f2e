import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { PathInfo } from '@/services/practice/schema';
import { cn } from '@/shared/lib/cn';
import { formatDateISO } from '@/services/practice/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';

interface StepTwoProps {
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: string | number) => void;
  handleNextStep: () => void;
  handlePreviousStep?: () => void;
  validationErrors?: Record<string, string>;
  // 新增：目標設定相關
  dailyGoalType: string;
  setDailyGoalType: (type: string) => void;
  dailyGoalTime: number;
  setDailyGoalTime: (time: number) => void;
  dailyGoalPages: number;
  setDailyGoalPages: (pages: number) => void;
  customUnit: string;
  setCustomUnit: (unit: string) => void;
  // 實踐行動
  practiceAction: string;
  setPracticeAction: (action: string) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  handlePreviousStep,
  validationErrors = {},
  dailyGoalType,
  setDailyGoalType,
  dailyGoalTime,
  setDailyGoalTime,
  dailyGoalPages,
  setDailyGoalPages,
  customUnit,
  setCustomUnit,
  practiceAction,
  setPracticeAction,
}) => {
  const practiceDays = parseInt(pathInfo.totalAmount, 10) || 7;
  const [frequencyRange, setFrequencyRange] = useState<[number, number]>([3, 4]);
  const [draggedThumb, setDraggedThumb] = useState<'min' | 'max' | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(
    pathInfo.targetDate ? new Date(pathInfo.targetDate) : undefined
  );

  const setPracticeDays = (days: number) => {
    handlePathInfoChange('totalAmount', days.toString());
  };

  // Handle range slider changes
  const handleRangeChange = (newRange: [number, number]) => {
    setFrequencyRange(newRange);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-basic-200 bg-white shadow-sm">
      {/* Header */}
      <div className="p-6">
        <div className="mb-4 flex items-center">
          <div className="mr-2 size-2 rounded-full bg-primary-base" />
          <span className="text-sm text-basic-400">主題實踐</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-basic-600">實踐時間和目標</h2>
        <p className="mb-8 text-sm text-basic-400">
          設定你的學習時間和每日目標
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 pt-0">
        <div className="space-y-8">
          {/* Practice Duration Slider */}
          <div>
            <Label className="mb-4 block text-sm font-medium text-basic-600">
              實踐時間
              {' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-bold text-primary-base">
                  {practiceDays}
                  {' '}
                  天
                </span>
              </div>

              <div className="relative">
                <div className="relative h-2 w-full rounded-lg bg-basic-100">
                  <div
                    className="h-2 rounded-lg bg-primary-base transition-all duration-300"
                    style={{ width: `${((practiceDays - 7) / (30 - 7)) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="7"
                  max="30"
                  value={practiceDays}
                  onChange={(e) => setPracticeDays(parseInt(e.target.value, 10))}
                  className="absolute top-0 h-2 w-full cursor-pointer appearance-none rounded-lg bg-transparent [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-base [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="relative mt-2 h-4 w-full text-xs text-basic-400">
                  <span className="absolute left-0 -translate-x-1/2">7天</span>
                  <span className="absolute -translate-x-1/2" style={{ left: `${((14 - 7) / (30 - 7)) * 100}%` }}>14天</span>
                  <span className="absolute -translate-x-1/2" style={{ left: `${((21 - 7) / (30 - 7)) * 100}%` }}>21天</span>
                  <span className="absolute right-0 translate-x-1/2">30天</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Inputs */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium text-basic-600">
                  開始日期
                  {' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full px-4 py-3 border-2 rounded-lg justify-start text-left font-normal h-auto bg-white hover:bg-basic-50',
                        startDate ? 'text-basic-600 hover:text-basic-600 [&_svg]:text-basic-600 [&_svg]:hover:text-basic-600' : 'text-basic-400 hover:text-basic-400 [&_svg]:text-basic-400 [&_svg]:hover:text-basic-400',
                        validationErrors.targetDate
                          ? 'border-destructive focus:border-destructive focus:ring-destructive'
                          : 'border-basic-200 hover:border-primary-base focus:border-primary-base'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {startDate ? (
                        format(startDate, 'yyyy / M / d ', { locale: zhTW })
                      ) : (
                        <span>選擇開始日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto bg-white p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date) {
                          handlePathInfoChange('targetDate', formatDateISO(date));
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {validationErrors.targetDate && (
                  <p className="mt-1 text-sm text-destructive">{validationErrors.targetDate}</p>
                )}
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-basic-600">
                  結束日期
                </Label>
                <div className="flex w-full items-center rounded-lg border-2 border-basic-200 bg-basic-50 px-4 py-3 text-basic-400">
                  <CalendarIcon className="mr-2 size-4" />
                  {(() => {
                    if (!startDate) return '請先選擇開始日期';
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + practiceDays);
                    return format(endDate, 'yyyy / M / d', { locale: zhTW });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Practice Action Section */}
          <div>
            <Label className="mb-4 block text-sm font-medium text-basic-600">
              實踐行動
              {' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="mb-4 text-sm text-basic-400">
              設定你想要實踐的具體行動
            </div>

            <Textarea
              value={practiceAction}
              onChange={(e) => setPracticeAction(e.target.value)}
              placeholder="例如：每天閱讀30分鐘，並記錄學習筆記"
              className={cn(
                'min-h-[80px] resize-none text-basic-600 placeholder:text-basic-400',
                validationErrors.practiceAction && 'border-destructive focus:ring-destructive'
              )}
              maxLength={200}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-basic-400">
                {practiceAction.length}
                /200
              </span>
            </div>
            {validationErrors.practiceAction && (
              <p className="mt-1 text-sm text-destructive">{validationErrors.practiceAction}</p>
            )}
          </div>

          {/* Weekly Frequency Section */}
          <div>
            <Label className="mb-4 block text-sm font-medium text-basic-600">
              每週節奏
              {' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="space-y-6">
              {/* Description at top */}
              <div className="text-center">
                <p className="mb-2 text-sm text-basic-400">拖曳設定彈性實踐</p>
              </div>

              {/* Dual Range Slider */}
              <div className="px-4">
                <div className="mb-2 flex justify-between text-xs text-basic-400">
                  <span>輕鬆</span>
                  <span className="font-medium text-primary-base">平衡</span>
                  <span>積極</span>
                </div>

                <div className="relative mb-6">
                  {/* Slider track */}
                  <div className="relative h-2 rounded-full bg-basic-100">
                    {/* Active range track */}
                    <div
                      className="absolute h-2 rounded-full bg-primary-base transition-all duration-300"
                      style={{
                        left: `${((frequencyRange[0] - 2) / (6 - 2)) * 100}%`,
                        width: `${((frequencyRange[1] - frequencyRange[0]) / (6 - 2)) * 100}%`,
                      }}
                    />

                    {/* Minimum thumb */}
                    <div
                      className={`absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-primary-base bg-white shadow-lg transition-all duration-300 hover:scale-110 ${
                        draggedThumb === 'min' ? 'scale-110 ring-4 ring-primary-base/30' : ''
                      }`}
                      style={{ left: `${((frequencyRange[0] - 2) / (6 - 2)) * 100}%` }}
                      role="button"
                      aria-label="minimum thumb"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDraggedThumb('min');
                        }
                      }}
                      onMouseDown={(e) => {
                        setDraggedThumb('min');
                        const startX = e.clientX;
                        const startValue = frequencyRange[0];

                        const handleMouseMove = (event: MouseEvent) => {
                          const deltaX = event.clientX - startX;
                          const deltaValue = Math.round((deltaX / 200) * 4);
                          const newMin = Math.max(2, Math.min(startValue + deltaValue, frequencyRange[1]));
                          handleRangeChange([newMin, frequencyRange[1]]);
                        };

                        const handleMouseUp = () => {
                          setDraggedThumb(null);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />

                    {/* Maximum thumb */}
                    <div
                      className={`absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-primary-base bg-white shadow-lg transition-all duration-300 hover:scale-110 ${
                        draggedThumb === 'max' ? 'scale-110 ring-4 ring-primary-base/30' : ''
                      }`}
                      style={{ left: `${((frequencyRange[1] - 2) / (6 - 2)) * 100}%` }}
                      role="button"
                      aria-label="maximum thumb"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDraggedThumb('max');
                        }
                      }}
                      onMouseDown={(e) => {
                        setDraggedThumb('max');
                        const startX = e.clientX;
                        const startValue = frequencyRange[1];

                        const handleMouseMove = (event: MouseEvent) => {
                          const deltaX = event.clientX - startX;
                          const deltaValue = Math.round((deltaX / 200) * 4);
                          const newMax = Math.max(frequencyRange[0], Math.min(6, startValue + deltaValue));
                          handleRangeChange([frequencyRange[0], newMax]);
                        };

                        const handleMouseUp = () => {
                          setDraggedThumb(null);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>

                  {/* Frequency markers */}
                  <div className="mt-6 flex justify-between">
                    {[2, 3, 4, 5, 6].map((freq) => {
                      const isSelected = freq >= frequencyRange[0] && freq <= frequencyRange[1];
                      return (
                        <Button
                          key={freq}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (freq <= frequencyRange[0]) {
                              handleRangeChange([freq, Math.max(freq, frequencyRange[1])]);
                            } else if (freq >= frequencyRange[1]) {
                              handleRangeChange([Math.min(freq, frequencyRange[0]), freq]);
                            } else {
                              handleRangeChange([freq, freq]);
                            }
                          }}
                          className={cn(
                            'size-8 p-0 text-xs font-medium',
                            isSelected
                              ? 'bg-primary-base text-white border-primary-base hover:bg-primary-base/90'
                              : 'bg-white border-basic-200 text-basic-600 hover:bg-white hover:border-primary-base hover:text-basic-600'
                          )}
                        >
                          {freq}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-center">
                <div className="text-sm font-medium text-basic-600">
                  {frequencyRange[0] === frequencyRange[1]
                    ? `每週固定 ${frequencyRange[0]} 次`
                    : `每週至少 ${frequencyRange[0]} 次，最多 ${frequencyRange[1]} 次`}
                </div>
                <div className="text-xs font-medium text-basic-400">
                  {frequencyRange[1] - frequencyRange[0] === 0
                    ? '無彈性，但規律穩定'
                    : frequencyRange[1] - frequencyRange[0] === 1
                      ? '小幅彈性，易於調整'
                      : frequencyRange[1] - frequencyRange[0] === 2
                        ? '中等彈性，易於調整'
                        : '高度彈性，最大自由度'}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <Label className="mb-4 block text-sm font-medium text-basic-600">
              每次實踐目標
              {' '}
              <span className="text-destructive">*</span>
            </Label>

            <div className="space-y-4">
              {/* Goal Type Selection */}
              <RadioGroup
                value={dailyGoalType}
                onValueChange={setDailyGoalType}
                className="flex items-center space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="time" id="time" />
                  <Label htmlFor="time" className="text-sm font-medium text-basic-600">按時間</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completion" id="completion" />
                  <Label htmlFor="completion" className="text-sm font-medium text-basic-600">按完成量</Label>
                </div>
              </RadioGroup>

              {/* Time-based option */}
              {dailyGoalType === 'time' && (
                <div className="mt-6">
                  <div className="mb-4 flex items-center text-lg text-basic-600">
                    <span>每次進行</span>
                    <Select value={dailyGoalTime.toString()} onValueChange={(value) => setDailyGoalTime(parseInt(value, 10))}>
                      <SelectTrigger className="mx-3 w-32 border-2 border-basic-200 text-basic-600 focus:border-primary-base focus:ring-2 focus:ring-primary-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 分鐘</SelectItem>
                        <SelectItem value="30">30 分鐘</SelectItem>
                        <SelectItem value="45">45 分鐘</SelectItem>
                        <SelectItem value="60">60 分鐘</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Completion-based option */}
              {dailyGoalType === 'completion' && (
                <div className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-lg text-basic-600">
                      <span className="whitespace-nowrap">每次完成</span>
                      <Input
                        type="number"
                        value={dailyGoalPages}
                        onChange={(e) => setDailyGoalPages(parseInt(e.target.value, 10) || 0)}
                        className="w-24 rounded-lg border-0 px-3 py-2 text-center text-basic-600 focus:border-0 focus:ring-0"
                        min="1"
                        max="999"
                      />
                      <Input
                        type="text"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="自訂單位"
                        className="flex-1 max-w-[200px] rounded-lg border-0 px-3 py-2 text-basic-600 placeholder:text-basic-400 focus:border-0 focus:ring-0"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-basic-400">
                      設定每次的完成量（1-999）和單位（最多10字）
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between p-6 pt-0">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          className="bg-white text-basic-600 border-basic-200 hover:bg-white hover:border-primary-base hover:text-basic-600"
        >
          上一步
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={!startDate || !practiceDays || !practiceAction.trim() || !frequencyRange || !dailyGoalType ||
            (dailyGoalType === 'time' && !dailyGoalTime) ||
            (dailyGoalType === 'completion' && (!dailyGoalPages || !customUnit))}
          className="bg-primary-base text-white hover:bg-primary-base/90"
        >
          下一步
        </Button>
      </div>

    </div>
  );
};

export default StepTwo;
