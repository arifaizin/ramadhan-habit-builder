// Storage utilities using Supabase
import { supabase } from '@/integrations/supabase/client';
import { ACTIVITIES, STREAK_BONUSES, LEVELS, CHALLENGE_START } from './constants';
import type { Database, Json } from '@/integrations/supabase/types';

export type User = {
  id: string;
  name: string;
  email: string | null;
  communityCode: string | null;
  createdAt: string;
};

export type DailyCheckin = {
  id?: string;
  userId: string;
  date: string;
  activitiesChecked: string[];
  activityNotes?: Record<string, string>;
  dailyScore: number;
  createdAt?: string;
};

export type QuizAnswer = {
  id?: string;
  userId: string;
  date: string;
  answers: { questionId: string; selectedIndex: number | null }[];
  quizScore: number;
  createdAt?: string;
};

export type StreakData = {
  userId: string;
  currentStreak: number;
  lastCheckinDate: string | null;
  earnedBonuses: number[];
};

export type Badge = {
  userId: string;
  badgeName: string;
  unlockedAt: string;
};

// User functions
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    communityCode: profile.community_code,
    createdAt: profile.created_at,
  };
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  // Using local time for daily activities is usually what users expect
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

// Checkin functions
export async function getCheckins(userId: string): Promise<DailyCheckin[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching checkins:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    date: item.date,
    activitiesChecked: item.activities_checked,
    activityNotes: item.activity_notes as Record<string, string>,
    dailyScore: item.daily_score,
    createdAt: item.created_at,
  }));
}

export async function getTodayCheckin(userId: string): Promise<DailyCheckin | null> {
  return getCheckinForDate(userId, getTodayDate());
}

export async function getCheckinForDate(userId: string, date: string): Promise<DailyCheckin | null> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('Error fetching checkin for date:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    activitiesChecked: data.activities_checked,
    activityNotes: data.activity_notes as Record<string, string>,
    dailyScore: data.daily_score,
    createdAt: data.created_at,
  };
}

export async function getCheckedDates(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('date')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching checked dates:', error);
    return [];
  }

  return data.map(item => item.date);
}

export async function saveCheckin(checkin: DailyCheckin): Promise<void> {
  const { error } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: checkin.userId,
      date: checkin.date,
      activities_checked: checkin.activitiesChecked,
      activity_notes: checkin.activityNotes as Json,
      daily_score: checkin.dailyScore,
    }, { onConflict: 'user_id,date' });

  if (error) {
    console.error('Error saving checkin:', error);
    throw error;
  }
}

// Calculate score for activities
export function calculateActivityScore(activityIds: string[]): number {
  return activityIds.reduce((total, id) => {
    const activity = ACTIVITIES.find(a => a.id === id);
    return total + (activity?.points || 0);
  }, 0);
}

// Quiz functions
export async function getQuizAnswers(userId: string): Promise<QuizAnswer[]> {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching quiz answers:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    date: item.date,
    answers: item.answers as any[],
    quizScore: item.quiz_score,
    createdAt: item.created_at,
  }));
}

export async function getTodayQuiz(userId: string): Promise<QuizAnswer | null> {
  const today = getTodayDate();
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today quiz:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    answers: data.answers as any[],
    quizScore: data.quiz_score,
    createdAt: data.created_at,
  };
}

export async function saveQuizAnswer(answer: QuizAnswer): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      user_id: answer.userId,
      date: answer.date,
      answers: answer.answers as Json,
      quiz_score: answer.quizScore,
    }, { onConflict: 'user_id,date' });

  if (error) {
    console.error('Error saving quiz answer:', error);
    throw error;
  }
}

// Streak functions
export async function getStreak(userId: string): Promise<StreakData> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching streak:', error);
  }

  return data ? {
    userId: data.user_id,
    currentStreak: data.current_streak,
    lastCheckinDate: data.last_checkin_date,
    earnedBonuses: data.earned_bonuses || [],
  } : {
    userId,
    currentStreak: 0,
    lastCheckinDate: null,
    earnedBonuses: [],
  };
}

export async function recalculateStreak(userId: string): Promise<{ newStreak: number; bonusEarned: number }> {
  const checkedDates = await getCheckedDates(userId);
  if (checkedDates.length === 0) {
    return { newStreak: 0, bonusEarned: 0 };
  }

  // Sort dates descending
  const sortedDates = [...checkedDates].sort((a, b) => b.localeCompare(a));

  // Count consecutive days backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let newStreak = 0;

  for (let i = 0; ; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toLocaleDateString('en-CA');

    if (sortedDates.includes(dateStr)) {
      newStreak++;
    } else {
      break;
    }
  }

  // Get previous streak to compare earned bonuses
  const oldStreak = await getStreak(userId);
  let earnedBonuses = newStreak > 0 ? [...(oldStreak.earnedBonuses || [])] : [];

  // If streak was broken, reset bonuses if needed (MVP logic)
  if (newStreak < (oldStreak.currentStreak || 0) && newStreak < Math.min(...(earnedBonuses.length > 0 ? earnedBonuses : [Infinity]))) {
    earnedBonuses = [];
  }

  // Check for new bonuses
  let bonusEarned = 0;
  for (const bonus of STREAK_BONUSES) {
    if (newStreak >= bonus.days && !earnedBonuses.includes(bonus.days)) {
      bonusEarned += bonus.points;
      earnedBonuses.push(bonus.days);
    }
  }

  // Save updated streak
  const { error } = await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_streak: newStreak,
      last_checkin_date: sortedDates[0],
      earned_bonuses: earnedBonuses,
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving streak:', error);
  }

  return { newStreak, bonusEarned };
}

// Badge functions
export async function getBadges(userId: string): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data.map(item => ({
    userId: item.user_id,
    badgeName: item.badge_name,
    unlockedAt: item.unlocked_at,
  }));
}

export async function checkAndUnlockBadges(userId: string, totalPoints: number): Promise<Badge[]> {
  const existingBadges = await getBadges(userId);
  const newBadges: Badge[] = [];

  for (const level of LEVELS) {
    if (totalPoints >= level.points) {
      const alreadyHas = existingBadges.some(b => b.badgeName === level.name);
      if (!alreadyHas) {
        const newBadge: Badge = {
          userId,
          badgeName: level.name,
          unlockedAt: new Date().toISOString(),
        };
        newBadges.push(newBadge);
      }
    }
  }

  if (newBadges.length > 0) {
    const { error } = await supabase
      .from('badges')
      .insert(newBadges.map(b => ({
        user_id: b.userId,
        badge_name: b.badgeName,
        unlocked_at: b.unlockedAt,
      })));

    if (error) {
      console.error('Error saving new badges:', error);
    }
  }

  return newBadges;
}

// Get total score for a user
export async function getTotalScore(userId: string): Promise<number> {
  const [checkins, quizzes, streak] = await Promise.all([
    getCheckins(userId),
    getQuizAnswers(userId),
    getStreak(userId)
  ]);

  const checkinPoints = checkins.reduce((sum, c) => sum + c.dailyScore, 0);
  const quizPoints = quizzes.reduce((sum, q) => sum + q.quizScore, 0);
  const streakBonus = streak.earnedBonuses.reduce((sum, days) => {
    const bonus = STREAK_BONUSES.find(b => b.days === days);
    return sum + (bonus?.points || 0);
  }, 0);

  return checkinPoints + quizPoints + streakBonus;
}

// Get current level based on points
export function getCurrentLevel(totalPoints: number): typeof LEVELS[number] | null {
  let currentLevel = null;

  for (const level of LEVELS) {
    if (totalPoints >= level.points) {
      currentLevel = level;
    }
  }

  return currentLevel;
}

// Get next level
export function getNextLevel(totalPoints: number): typeof LEVELS[number] | null {
  for (const level of LEVELS) {
    if (totalPoints < level.points) {
      return level;
    }
  }
  return null;
}

// Reset all data before challenge start
export async function resetPreChallengeData(userId: string): Promise<void> {
  console.log('Resetting pre-challenge data for user:', userId);

  // 1. Delete check-ins before challenge start
  const { error: checkinError } = await supabase
    .from('daily_checkins')
    .delete()
    .eq('user_id', userId)
    .lt('date', CHALLENGE_START);

  if (checkinError) console.error('Error resetting checkins:', checkinError);

  // 2. Delete quizes before challenge start
  const { error: quizError } = await supabase
    .from('quiz_answers')
    .delete()
    .eq('user_id', userId)
    .lt('date', CHALLENGE_START);

  if (quizError) console.error('Error resetting quizzes:', quizError);

  // 3. Reset streak if the last checkin was before challenge start
  const streak = await getStreak(userId);
  if (streak.lastCheckinDate && streak.lastCheckinDate < CHALLENGE_START) {
    const { error: streakError } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: 0,
        last_checkin_date: null,
        earned_bonuses: [],
      }, { onConflict: 'user_id' });

    if (streakError) console.error('Error resetting streak:', streakError);
  }

  // 4. Reset badges (since they are calculated from total score which is now reset)
  const { error: badgeError } = await supabase
    .from('badges')
    .delete()
    .eq('user_id', userId);

  if (badgeError) console.error('Error resetting badges:', badgeError);
}

