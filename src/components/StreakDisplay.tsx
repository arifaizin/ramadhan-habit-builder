import { Flame } from 'lucide-react';
import { STREAK_BONUSES } from '@/lib/constants';

interface StreakDisplayProps {
  currentStreak: number;
  earnedBonuses: number[];
}

export function StreakDisplay({ currentStreak, earnedBonuses }: StreakDisplayProps) {
  const nextBonus = STREAK_BONUSES.find(b => !earnedBonuses.includes(b.days));
  const daysToNext = nextBonus ? nextBonus.days - currentStreak : 0;

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-4">
        {/* Streak Fire */}
        <div className="relative">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              currentStreak > 0
                ? 'bg-gradient-to-br from-streak to-accent'
                : 'bg-secondary'
            }`}
          >
            <Flame
              className={`w-7 h-7 ${
                currentStreak > 0 ? 'text-white streak-fire' : 'text-muted-foreground'
              }`}
            />
          </div>
          {currentStreak > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
              {currentStreak}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {currentStreak === 0
              ? 'Mulai streak-mu!'
              : `${currentStreak} hari berturut-turut`}
          </p>
          {nextBonus && currentStreak > 0 && (
            <p className="text-sm text-muted-foreground">
              {daysToNext} hari lagi untuk bonus +{nextBonus.points} poin
            </p>
          )}
          {currentStreak === 0 && (
            <p className="text-sm text-muted-foreground">
              Check-in hari ini untuk memulai
            </p>
          )}
        </div>
      </div>

      {/* Bonus Milestones */}
      {currentStreak > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {STREAK_BONUSES.map((bonus) => {
            const earned = earnedBonuses.includes(bonus.days);
            const upcoming = currentStreak < bonus.days;

            return (
              <div
                key={bonus.days}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  earned
                    ? 'badge-streak'
                    : upcoming
                    ? 'bg-secondary text-muted-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {bonus.days}d {earned && '✓'}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
