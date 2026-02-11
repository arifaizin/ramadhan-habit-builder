import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTodayDate } from '@/lib/storage';
import { CHALLENGE_START, CHALLENGE_END, TEST_MODE } from '@/lib/constants';
import { useState, useRef, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  checkedDates: string[];
}

const MAX_BACKFILL_DAYS = 2;

function getAllChallengeDates(): { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean; canEdit: boolean }[] {
  const today = getTodayDate();
  
  if (TEST_MODE) {
    // In test mode, just show today and backfill days regardless of challenge period
    const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean; canEdit: boolean }[] = [];
    const backfillDate = new Date(today + 'T00:00:00');
    backfillDate.setDate(backfillDate.getDate() - MAX_BACKFILL_DAYS);
    const current = new Date(backfillDate);
    const endDate = new Date(today + 'T00:00:00');
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      dates.push({
        dateStr,
        dayName: current.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: current.getDate(),
        monthName: current.toLocaleDateString('id-ID', { month: 'short' }),
        isToday: dateStr === today,
        canEdit: true,
      });
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  const end = today < CHALLENGE_END ? today : CHALLENGE_END;

  // Only show from (today - MAX_BACKFILL_DAYS) to today, clamped to challenge period
  const backfillDate = new Date(today + 'T00:00:00');
  backfillDate.setDate(backfillDate.getDate() - MAX_BACKFILL_DAYS);
  const backfillStr = backfillDate.toISOString().split('T')[0];
  const start = backfillStr > CHALLENGE_START ? backfillStr : CHALLENGE_START;

  if (start > end) return [];

  const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean; canEdit: boolean }[] = [];
  const current = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    dates.push({
      dateStr,
      dayName: current.toLocaleDateString('id-ID', { weekday: 'short' }),
      dayNum: current.getDate(),
      monthName: current.toLocaleDateString('id-ID', { month: 'short' }),
      isToday: dateStr === today,
      canEdit: true,
    });
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function DateSelector({ selectedDate, onSelectDate, checkedDates }: DateSelectorProps) {
  const dates = getAllChallengeDates();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }
  }, []);

  if (dates.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border shadow flex items-center justify-center hover:bg-muted"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-1">
        {dates.map(({ dateStr, dayName, dayNum, monthName, isToday }) => {
          const isChecked = checkedDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              data-date={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex-shrink-0 w-16 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-soft'
                  : 'border-border bg-card hover:border-primary/30',
                isChecked && !isSelected && 'border-success/40'
              )}
            >
              <span className="text-[10px] text-muted-foreground font-medium">
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
              <span className="text-[10px] text-muted-foreground">{monthName}</span>
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
      <button
        type="button"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-background/90 border border-border shadow flex items-center justify-center hover:bg-muted"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
