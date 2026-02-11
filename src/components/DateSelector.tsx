import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTodayDate } from '@/lib/storage';
import { CHALLENGE_START, CHALLENGE_END } from '@/lib/constants';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  checkedDates: string[];
}

function getDateInfo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split('T')[0];
  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
  const dayNum = date.getDate();
  return { dateStr, dayName, dayNum };
}

export function DateSelector({ selectedDate, onSelectDate, checkedDates }: DateSelectorProps) {
  const dates = [2, 1, 0]
    .map(daysAgo => ({
      ...getDateInfo(daysAgo),
      isToday: daysAgo === 0,
      daysAgo,
    }))
    .filter(({ dateStr }) => dateStr >= CHALLENGE_START && dateStr <= CHALLENGE_END);

  if (dates.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {dates.map(({ dateStr, dayName, dayNum, isToday }) => {
        const isChecked = checkedDates.includes(dateStr);
        const isSelected = selectedDate === dateStr;

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onSelectDate(dateStr)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/10 shadow-soft'
                : 'border-border bg-card hover:border-primary/30',
              isChecked && !isSelected && 'border-success/40'
            )}
          >
            <span className="text-xs text-muted-foreground font-medium">
              {isToday ? 'Hari Ini' : dayName}
            </span>
            <span
              className={cn(
                'text-lg font-bold',
                isSelected ? 'text-primary' : 'text-foreground'
              )}
            >
              {dayNum}
            </span>
            {isChecked && (
              <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                <Check className="w-3 h-3 text-success-foreground" />
              </div>
            )}
            {!isChecked && (
              <div className="w-5 h-5 rounded-full border-2 border-border" />
            )}
          </button>
        );
      })}
    </div>
  );
}
