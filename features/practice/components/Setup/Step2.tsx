import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { PathInfo } from '@/services/practice/schema';
import { cn } from '@/utils/cn';
import { formatDateISO } from '@/services/practice/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
  setCustomUnit
}) => {
  const practiceDays = parseInt(pathInfo.totalAmount, 10) || 7;
  const [practiceGoal, setPracticeGoal] = useState<string>('');
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
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-2 h-2 rounded-full bg-primary mr-2" />
          <span className="text-sm text-muted-foreground">主題實踐</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">實踐時間和目標</h2>
        <p className="text-sm text-muted-foreground mb-8">
          設定你的學習時間和每日目標
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 pt-0">
        <div className="space-y-8">
          {/* Practice Duration Slider */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-4">
              實踐時間 <span className="text-destructive">*</span>
            </Label>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary">{practiceDays} 天</span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="7"
                  max="30"
                  value={practiceDays}
                  onChange={(e) => setPracticeDays(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-basic-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((practiceDays - 7) / (30 - 7)) * 100}%, hsl(var(--muted)) ${((practiceDays - 7) / (30 - 7)) * 100}%, hsl(var(--muted)) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>7天</span>
                  <span>14天</span>
                  <span>21天</span>
                  <span>30天</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Inputs */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  開始日期 <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-lg justify-start text-left font-normal h-auto",
                        !startDate && "text-muted-foreground",
                        validationErrors.targetDate
                          ? "border-destructive focus:border-destructive focus:ring-destructive"
                          : "border-border hover:border-primary focus:border-primary"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "yyyy 年 M 月 d 日", { locale: zhTW })
                      ) : (
                        <span>選擇開始日期</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
                <Label className="block text-sm font-medium text-foreground mb-2">
                  結束日期
                </Label>
                <div className="w-full px-4 py-3 bg-muted border-2 border-border rounded-lg text-muted-foreground flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(() => {
                    if (!startDate) return '請先選擇開始日期';
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + practiceDays);
                    return format(endDate, "yyyy 年 M 月 d 日", { locale: zhTW });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Practice Action Section */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-4">
              實踐行動 <span className="text-destructive">*</span>
            </Label>

            <div className="relative">
              <div className="text-lg text-foreground mb-4 leading-relaxed">
                我要在這
                <span className="inline-flex items-center bg-primary/5 text-primary px-1.5 py-0.5 rounded font-semibold mx-1">
                  {practiceDays}天
                </span>
                要進行實踐是
              </div>

              <div className="relative">
                <Textarea
                  value={practiceGoal}
                  onChange={(e) => setPracticeGoal(e.target.value)}
                  placeholder="例如：每週至少看書2小時"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground bg-background placeholder-muted-foreground"
                  rows={2}
                  maxLength={50}
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}
                />

                {/* Character counter */}
                <div className="absolute bottom-3 right-3 text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                  {practiceGoal.length}/50
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Frequency Section */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-4">
              每週節奏 <span className="text-destructive">*</span>
            </Label>

            <div className="space-y-6">
              {/* Description at top */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">拖曳設定彈性實踐</p>
              </div>

              {/* Dual Range Slider */}
              <div className="px-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>輕鬆</span>
                  <span className="text-primary font-medium">平衡</span>
                  <span>積極</span>
                </div>

                <div className="relative mb-6">
                  {/* Slider track */}
                  <div className="h-2 bg-muted rounded-full relative">
                    {/* Active range track */}
                    <div
                      className="h-2 rounded-full transition-all duration-300 absolute"
                      style={{
                        backgroundColor: 'hsl(var(--primary))',
                        left: `${((frequencyRange[0] - 2) / 4) * 100}%`,
                        width: `${((frequencyRange[1] - frequencyRange[0]) / 4) * 100}%`
                      }}
                    />

                    {/* Minimum thumb */}
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 ${
                        draggedThumb === 'min' ? 'scale-110' : ''
                      }`}
                      style={{
                        borderColor: 'hsl(var(--primary))',
                        left: `${((frequencyRange[0] - 2) / 4) * 100}%`,
                        boxShadow: draggedThumb === 'min' ? '0 0 0 4px hsl(var(--primary) / 0.3)' : undefined
                      }}
                      role="button"
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
                      className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 ${
                        draggedThumb === 'max' ? 'scale-110' : ''
                      }`}
                      style={{
                        borderColor: 'hsl(var(--primary))',
                        left: `${((frequencyRange[1] - 2) / 4) * 100}%`,
                        boxShadow: draggedThumb === 'max' ? '0 0 0 4px hsl(var(--primary) / 0.3)' : undefined
                      }}
                      role="button"
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
                  <div className="flex justify-between mt-6">
                    {[2, 3, 4, 5, 6].map((freq) => (
                      <Button
                        key={freq}
                        variant={freq >= frequencyRange[0] && freq <= frequencyRange[1] ? "default" : "outline"}
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
                        className="w-8 h-8 p-0 text-xs font-medium"
                      >
                        {freq}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-center space-y-2">
                <div className="text-sm text-foreground font-medium">
                  {frequencyRange[0] === frequencyRange[1]
                    ? `每週固定 ${frequencyRange[0]} 次`
                    : `每週至少 ${frequencyRange[0]} 次，最多 ${frequencyRange[1]} 次`}
                </div>
                <div className="text-xs font-medium text-primary">
                  {frequencyRange[1] - frequencyRange[0] === 0
                    ? "無彈性，但規律穩定"
                    : frequencyRange[1] - frequencyRange[0] === 1
                    ? "小幅彈性，易於調整"
                    : frequencyRange[1] - frequencyRange[0] === 2
                    ? "中等彈性，易於調整"
                    : "高度彈性，最大自由度"}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-4">
              每日實踐目標 <span className="text-destructive">*</span>
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
                  <Label htmlFor="time" className="text-sm font-medium text-foreground">按時間</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completion" id="completion" />
                  <Label htmlFor="completion" className="text-sm font-medium text-foreground">按完成量</Label>
                </div>
              </RadioGroup>

              {/* Time-based option */}
              {dailyGoalType === 'time' && (
                <div className="mt-6">
                  <div className="flex items-center text-lg text-foreground mb-4">
                    <span>每次進行</span>
                    <Select value={dailyGoalTime.toString()} onValueChange={(value) => setDailyGoalTime(parseInt(value, 10))}>
                      <SelectTrigger className="mx-3 w-32 border-2 border-border focus:ring-2 focus:ring-primary focus:border-primary">
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
                  <div className="flex items-center text-lg text-foreground mb-4">
                    <span>每次完成</span>
                    <Input
                      type="number"
                      value={dailyGoalPages}
                      onChange={(e) => setDailyGoalPages(parseInt(e.target.value, 10) || 0)}
                      className="mx-3 w-20 px-3 py-2 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center"
                      min="1"
                      max="999"
                    />
                    <Input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      placeholder="自訂單位"
                      className="px-3 py-2 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-32"
                      maxLength={10}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 pt-0 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
        >
          上一步
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={!startDate || !practiceDays || !practiceGoal.trim() || !frequencyRange || !dailyGoalType ||
            (dailyGoalType === 'time' && !dailyGoalTime) ||
            (dailyGoalType === 'completion' && (!dailyGoalPages || !customUnit))}
        >
          下一步
        </Button>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16B9B3;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #16B9B3;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}
      </style>
    </div>
  );
};

export default StepTwo;
