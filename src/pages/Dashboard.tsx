import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ACTIVITIES } from '@/lib/constants';
import {
  getTodayCheckin,
  saveCheckin,
  calculateActivityScore,
  getStreak,
  updateStreak,
  getTotalScore,
  getBadges,
  checkAndUnlockBadges,
  getTodayQuiz,
  saveQuizAnswer,
  getTodayDate,
} from '@/lib/storage';
import { ActivityCard } from '@/components/ActivityCard';
import { StreakDisplay } from '@/components/StreakDisplay';
import { LevelProgress } from '@/components/LevelProgress';
import { BadgeCollection } from '@/components/BadgeCollection';
import { DailyQuiz } from '@/components/DailyQuiz';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // State
  const [checkedActivities, setCheckedActivities] = useState<string[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState({ currentStreak: 0, earnedBonuses: [] as number[] });
  const [badges, setBadges] = useState<ReturnType<typeof getBadges>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ questionId: string; selectedIndex: number | null }[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (!user) return;

    const todayCheckin = getTodayCheckin(user.id);
    if (todayCheckin) {
      setCheckedActivities(todayCheckin.activitiesChecked);
      setTodayScore(todayCheckin.dailyScore);
      setHasCheckedInToday(true);
    }

    const todayQuiz = getTodayQuiz(user.id);
    if (todayQuiz) {
      setQuizCompleted(true);
      setQuizAnswers(todayQuiz.answers);
      setTodayScore((prev) => prev + todayQuiz.quizScore);
    }

    const streakData = getStreak(user.id);
    setStreak({ currentStreak: streakData.currentStreak, earnedBonuses: streakData.earnedBonuses });

    setTotalPoints(getTotalScore(user.id));
    setBadges(getBadges(user.id));
  }, [user]);

  // Handle activity toggle
  const handleActivityToggle = (activityId: string) => {
    if (!user || hasCheckedInToday) return;

    setCheckedActivities((prev) => {
      const newActivities = prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId];

      return newActivities;
    });
  };

  // Handle check-in submission
  const handleCheckin = () => {
    if (!user || checkedActivities.length === 0) return;

    const activityScore = calculateActivityScore(checkedActivities);

    // Save checkin
    saveCheckin({
      userId: user.id,
      date: getTodayDate(),
      activitiesChecked: checkedActivities,
      dailyScore: activityScore,
      createdAt: new Date().toISOString(),
    });

    // Update streak
    const { newStreak, bonusEarned } = updateStreak(user.id);
    const updatedStreakData = getStreak(user.id);
    setStreak({ currentStreak: newStreak, earnedBonuses: updatedStreakData.earnedBonuses });

    // Update today's score
    const quizScore = getTodayQuiz(user.id)?.quizScore || 0;
    setTodayScore(activityScore + quizScore);
    setHasCheckedInToday(true);

    // Update total and check badges
    const newTotal = getTotalScore(user.id);
    setTotalPoints(newTotal);

    const newBadges = checkAndUnlockBadges(user.id, newTotal);
    if (newBadges.length > 0) {
      setBadges(getBadges(user.id));
      toast.success(`🎉 Badge baru: ${newBadges.map((b) => b.badgeName).join(', ')}!`);
    }

    if (bonusEarned > 0) {
      toast.success(`🔥 Bonus streak: +${bonusEarned} poin!`);
    }

    toast.success('Check-in berhasil! Jazakallahu khairan.');
  };

  // Handle quiz completion
  const handleQuizComplete = (answers: { questionId: string; selectedIndex: number | null }[], score: number) => {
    if (!user) return;

    saveQuizAnswer({
      userId: user.id,
      date: getTodayDate(),
      answers,
      quizScore: score,
    });

    setQuizCompleted(true);
    setQuizAnswers(answers);
    setTodayScore((prev) => prev + score);

    const newTotal = getTotalScore(user.id);
    setTotalPoints(newTotal);

    const newBadges = checkAndUnlockBadges(user.id, newTotal);
    if (newBadges.length > 0) {
      setBadges(getBadges(user.id));
      toast.success(`🎉 Badge baru: ${newBadges.map((b) => b.badgeName).join(', ')}!`);
    }

    toast.success(`Quiz selesai! +${score} poin`);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const activityScore = calculateActivityScore(checkedActivities);

  return (
    <div className="min-h-screen bg-background geometric-pattern pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🌙</span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Ahlan, {user.name}!</p>
              <p className="text-xs text-muted-foreground">{user.division}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Today's Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-primary">{todayScore}</p>
            <p className="text-xs text-muted-foreground mt-1">Poin Hari Ini</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Poin</p>
          </div>
        </div>

        {/* Streak */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <StreakDisplay
            currentStreak={streak.currentStreak}
            earnedBonuses={streak.earnedBonuses}
          />
        </div>

        {/* Level Progress */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <LevelProgress totalPoints={totalPoints} />
        </div>

        {/* Daily Checklist */}
        <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Aktivitas Hari Ini</h2>
            {!hasCheckedInToday && checkedActivities.length > 0 && (
              <span className="text-sm text-primary font-medium">
                +{activityScore} poin
              </span>
            )}
          </div>

          <div className="space-y-3">
            {ACTIVITIES.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                label={activity.label}
                points={activity.points}
                icon={activity.icon}
                checked={checkedActivities.includes(activity.id)}
                disabled={hasCheckedInToday}
                onToggle={handleActivityToggle}
              />
            ))}
          </div>

          {/* Submit Button */}
          {!hasCheckedInToday && (
            <Button
              onClick={handleCheckin}
              disabled={checkedActivities.length === 0}
              className="w-full btn-primary mt-4"
            >
              Simpan Check-in ({checkedActivities.length} aktivitas)
            </Button>
          )}

          {hasCheckedInToday && (
            <div className="mt-4 p-3 rounded-lg bg-success/10 text-center">
              <p className="text-sm font-medium text-success">
                ✓ Sudah check-in hari ini
              </p>
            </div>
          )}
        </div>

        {/* Daily Quiz */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <DailyQuiz
            completed={quizCompleted}
            savedAnswers={quizAnswers}
            onComplete={handleQuizComplete}
          />
        </div>

        {/* Badge Collection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <BadgeCollection earnedBadges={badges} />
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            Fokus pada konsistensi, bukan perbandingan.
          </p>
        </div>
      </main>
    </div>
  );
}
