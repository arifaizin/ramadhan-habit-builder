import { LEVELS } from '@/lib/constants';
import { Badge } from '@/lib/storage';
import { Lock } from 'lucide-react';

interface BadgeCollectionProps {
  earnedBadges: Badge[];
}

export function BadgeCollection({ earnedBadges }: BadgeCollectionProps) {
  const earnedNames = earnedBadges.map(b => b.badgeName);

  return (
    <div className="card-elevated p-4">
      <h3 className="font-semibold text-foreground mb-4">Koleksi Badge</h3>

      <div className="grid grid-cols-2 gap-3">
        {LEVELS.map((level) => {
          const isEarned = earnedNames.includes(level.name);

          return (
            <div
              key={level.level}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                isEarned
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-muted/50'
              }`}
            >
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${
                  isEarned ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                {isEarned ? level.badge : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <p
                className={`text-sm font-medium ${
                  isEarned ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {level.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {level.points.toLocaleString()} poin
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
