import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Lock, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { ACTIVITIES, CHALLENGE_START, CHALLENGE_END, TEST_MODE } from '@/lib/constants';
import {
  getCheckinForDate,
  getCheckedDates,
  saveCheckin,
  calculateActivityScore,
  getStreak,
  recalculateStreak,
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
import { DateSelector } from '@/components/DateSelector';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function getChallengeStatus(today: string) {
  if (TEST_MODE) return 'active';
  if (today < CHALLENGE_START) return 'before';
  if (today > CHALLENGE_END) return 'after';
  return 'active';
}

export default function Dashboard() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // State
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [checkedDates, setCheckedDates] = useState<string[]>([]);
  const [checkedActivities, setCheckedActivities] = useState<string[]>([]);
  const [activityNotes, setActivityNotes] = useState<Record<string, string>>({});
  const [selectedScore, setSelectedScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState({ currentStreak: 0, earnedBonuses: [] as number[] });
  const [badges, setBadges] = useState<ReturnType<typeof getBadges>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ questionId: string; selectedIndex: number | null }[]>([]);
  const [hasCheckedInSelected, setHasCheckedInSelected] = useState(false);
  const [canEditSelected, setCanEditSelected] = useState(true);

  const isToday = selectedDate === getTodayDate();
  const challengeStatus = getChallengeStatus(getTodayDate());
  const isReadOnly = challengeStatus !== 'active';

  // Load data for a specific date
  const loadDateData = useCallback((date: string) => {
    if (!user) return;

    const checkin = getCheckinForDate(user.id, date);
    if (checkin) {
      setCheckedActivities(checkin.activitiesChecked);
      setActivityNotes(checkin.activityNotes || {});
      setSelectedScore(checkin.dailyScore);
      setHasCheckedInSelected(true);
    } else {
      setCheckedActivities([]);
      setActivityNotes({});
      setSelectedScore(0);
      setHasCheckedInSelected(false);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    if (!user) return;

    loadDateData(selectedDate);
    setCheckedDates(getCheckedDates(user.id));

    // Calculate if the selected date can be edited
    const today = getTodayDate();
    const todayDate = new Date(today + 'T00:00:00');
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const daysDifference = Math.floor((todayDate.getTime() - selectedDateObj.getTime()) / (1000 * 60 * 60 * 24));
    setCanEditSelected(daysDifference <= 2);

    const todayQuiz = getTodayQuiz(user.id);
    if (todayQuiz) {
      setQuizCompleted(true);
      setQuizAnswers(todayQuiz.answers);
    }

    const streakData = getStreak(user.id);
    setStreak({ currentStreak: streakData.currentStreak, earnedBonuses: streakData.earnedBonuses });

    setTotalPoints(getTotalScore(user.id));
    setBadges(getBadges(user.id));
  }, [user, loadDateData, selectedDate]);

  // Handle date change
  const handleDateChange = (date: string, canEdit: boolean) => {
    setSelectedDate(date);
    setCanEditSelected(canEdit);
    loadDateData(date);
  };

  // Handle activity toggle
  const handleActivityToggle = (activityId: string) => {
    if (!user || (hasCheckedInSelected && !canEditSelected) || isReadOnly) return;

    setCheckedActivities((prev) => {
      return prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId];
    });
  };

  // Handle check-in submission
  const handleCheckin = () => {
    if (!user || checkedActivities.length === 0 || isReadOnly) return;

    const activityScore = calculateActivityScore(checkedActivities);

    saveCheckin({
      userId: user.id,
      date: selectedDate,
      activitiesChecked: checkedActivities,
      activityNotes,
      dailyScore: activityScore,
      createdAt: new Date().toISOString(),
    });

    const { newStreak, bonusEarned } = recalculateStreak(user.id);
    const updatedStreakData = getStreak(user.id);
    setStreak({ currentStreak: newStreak, earnedBonuses: updatedStreakData.earnedBonuses });

    setSelectedScore(activityScore);
    setHasCheckedInSelected(true);
    setCheckedDates(getCheckedDates(user.id));

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

  // Format selected date label
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const dateLabel = isToday
    ? 'Aktivitas Hari Ini'
    : `Aktivitas - ${selectedDateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })}`;

  const scoreLabel = isToday
    ? 'Poin Hari Ini'
    : `Poin ${selectedDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;

  // Challenge period info
  const challengeStartDate = new Date(CHALLENGE_START + 'T00:00:00');
  const challengeEndDate = new Date(CHALLENGE_END + 'T00:00:00');

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
              <p className="text-xs text-muted-foreground">{user.communityCode}</p>
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
        {/* Challenge Status Banner */}
        {challengeStatus === 'before' && (
          <div className="card-elevated p-4 text-center border-primary/30 bg-primary/5 animate-fade-in">
            <Clock className="w-8 h-8 mx-auto text-primary mb-2" />
            <h2 className="font-semibold text-foreground mb-1">Challenge Belum Dimulai</h2>
            <p className="text-sm text-muted-foreground">
              Challenge dimulai pada{' '}
              {challengeStartDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {challengeStatus === 'after' && (
          <div className="card-elevated p-4 text-center border-primary/30 bg-primary/5 animate-fade-in">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <h2 className="font-semibold text-foreground mb-1">Challenge Telah Selesai</h2>
            <p className="text-sm text-muted-foreground">
              Challenge berakhir pada{' '}
              {challengeEndDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              . Data Anda tetap dapat dilihat.
            </p>
          </div>
        )}

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
            <p className="text-2xl font-bold text-primary">{hasCheckedInSelected ? selectedScore : activityScore}</p>
            <p className="text-xs text-muted-foreground mt-1">{scoreLabel}</p>
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

        {/* Date Selector */}
        <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
            checkedDates={checkedDates}
          />
        </div>

        {/* Daily Checklist */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">{dateLabel}</h2>
            {!hasCheckedInSelected && !isReadOnly && checkedActivities.length > 0 && (
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
                disabled={(hasCheckedInSelected && !canEditSelected) || isReadOnly}
                onToggle={handleActivityToggle}
                showNote={activity.id === 'kebaikan'}
                noteValue={activityNotes[activity.id] || ''}
                onNoteChange={(id, value) =>
                  setActivityNotes((prev) => ({ ...prev, [id]: value }))
                }
                notePlaceholder="Contoh: membuang batu yang menghalangi di jalan"
              />
            ))}
          </div>

          {/* Submit Button */}
          {(!hasCheckedInSelected || canEditSelected) && !isReadOnly && (
            <Button
              onClick={handleCheckin}
              disabled={checkedActivities.length === 0}
              className="w-full btn-primary mt-4"
            >
              {hasCheckedInSelected ? 'Update Check-in' : `Simpan Check-in (${checkedActivities.length} aktivitas)`}
            </Button>
          )}

          {hasCheckedInSelected && !canEditSelected && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-center">
              <p className="text-sm font-medium text-muted-foreground">
                ✓ Sudah check-in {isToday ? 'hari ini' : 'untuk tanggal ini'} (tidak bisa diedit, lebih dari 2 hari)
              </p>
            </div>
          )}

          {hasCheckedInSelected && canEditSelected && (
            <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                💡 Anda masih bisa mengubah check-in ini (dalam 2 hari)
              </p>
            </div>
          )}
        </div>

        {/* Daily Quiz - only show for today and during active challenge */}
        {isToday && !isReadOnly && (
          <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <DailyQuiz
              completed={quizCompleted}
              savedAnswers={quizAnswers}
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {/* Badge Collection */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
