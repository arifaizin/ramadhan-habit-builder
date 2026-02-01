import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  id: string;
  label: string;
  points: number;
  icon: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}

export function ActivityCard({
  id,
  label,
  points,
  icon,
  checked,
  disabled,
  onToggle,
}: ActivityCardProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled}
      className={cn(
        'activity-card w-full flex items-center gap-4 text-left',
        checked && 'checked',
        disabled && !checked && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200',
          checked
            ? 'bg-success/10'
            : 'bg-secondary'
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-sm leading-tight',
            checked ? 'text-success' : 'text-foreground'
          )}
        >
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          +{points} poin
        </p>
      </div>

      {/* Checkbox */}
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          checked
            ? 'bg-success border-success'
            : 'border-border'
        )}
      >
        {checked && <Check className="w-4 h-4 text-success-foreground" />}
      </div>
    </button>
  );
}
