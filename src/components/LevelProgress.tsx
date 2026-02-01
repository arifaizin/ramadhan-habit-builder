import { LEVELS } from '@/lib/constants';
import { getCurrentLevel, getNextLevel } from '@/lib/storage';

interface LevelProgressProps {
  totalPoints: number;
}

export function LevelProgress({ totalPoints }: LevelProgressProps) {
  const currentLevel = getCurrentLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);

  // Calculate progress
  const currentLevelPoints = currentLevel?.points || 0;
  const nextLevelPoints = nextLevel?.points || LEVELS[LEVELS.length - 1].points;
  const progressInLevel = totalPoints - currentLevelPoints;
  const levelRange = nextLevelPoints - currentLevelPoints;
  const progressPercent = nextLevel
    ? Math.min((progressInLevel / levelRange) * 100, 100)
    : 100;

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Current Badge */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-2xl shadow-soft">
            {currentLevel?.badge || '🌱'}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {currentLevel?.name || 'Belum Mulai'}
            </p>
            <p className="text-sm text-muted-foreground">
              {totalPoints.toLocaleString()} poin
            </p>
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevel && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Selanjutnya</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg">{nextLevel.badge}</span>
              <span className="text-sm font-medium text-foreground">
                {nextLevel.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextLevel && (
        <div className="space-y-1.5">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentLevelPoints.toLocaleString()}</span>
            <span>{nextLevelPoints.toLocaleString()}</span>
          </div>
        </div>
      )}

      {!nextLevel && currentLevel && (
        <p className="text-sm text-success font-medium text-center mt-2">
          ✨ Level tertinggi tercapai!
        </p>
      )}
    </div>
  );
}
