// Local storage utilities for the MVP (will be replaced with Supabase later)

import { ACTIVITIES, STREAK_BONUSES, LEVELS } from './constants';

export interface User {
  id: string;
  name: string;
  email: string;
  communityCode: string;
  createdAt: string;
}

export interface DailyCheckin {
  userId: string;
  date: string;
  activitiesChecked: string[];
  activityNotes?: Record<string, string>;
  dailyScore: number;
  createdAt: string;
}

export interface QuizAnswer {
  userId: string;
  date: string;
  answers: { questionId: string; selectedIndex: number | null }[];
  quizScore: number;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  lastCheckinDate: string;
  earnedBonuses: number[];
}

export interface Badge {
  userId: string;
  badgeName: string;
  unlockedAt: string;
}

const STORAGE_KEYS = {
  user: 'mutabaah_user',
  checkins: 'mutabaah_checkins',
  quizAnswers: 'mutabaah_quiz',
  streaks: 'mutabaah_streaks',
  badges: 'mutabaah_badges',
};

// User functions
export function getUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.user);
  return data ? JSON.parse(data) : null;
}

export function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.user);
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Checkin functions
export function getCheckins(): DailyCheckin[] {
  const data = localStorage.getItem(STORAGE_KEYS.checkins);
  return data ? JSON.parse(data) : [];
}

export function getTodayCheckin(userId: string): DailyCheckin | null {
  return getCheckinForDate(userId, getTodayDate());
}

export function getCheckinForDate(userId: string, date: string): DailyCheckin | null {
  const checkins = getCheckins();
  return checkins.find(c => c.userId === userId && c.date === date) || null;
}

export function getCheckedDates(userId: string): string[] {
  const checkins = getCheckins().filter(c => c.userId === userId);
  return checkins.map(c => c.date);
}

export function saveCheckin(checkin: DailyCheckin): void {
  const checkins = getCheckins();
  const existingIndex = checkins.findIndex(
    c => c.userId === checkin.userId && c.date === checkin.date
  );
  
  if (existingIndex >= 0) {
    checkins[existingIndex] = checkin;
  } else {
    checkins.push(checkin);
  }
  
  localStorage.setItem(STORAGE_KEYS.checkins, JSON.stringify(checkins));
}

// Calculate score for activities
export function calculateActivityScore(activityIds: string[]): number {
  return activityIds.reduce((total, id) => {
    const activity = ACTIVITIES.find(a => a.id === id);
    return total + (activity?.points || 0);
  }, 0);
}

// Quiz functions
export function getQuizAnswers(): QuizAnswer[] {
  const data = localStorage.getItem(STORAGE_KEYS.quizAnswers);
  return data ? JSON.parse(data) : [];
}

export function getTodayQuiz(userId: string): QuizAnswer | null {
  const answers = getQuizAnswers();
  const today = getTodayDate();
  return answers.find(a => a.userId === userId && a.date === today) || null;
}

export function saveQuizAnswer(answer: QuizAnswer): void {
  const answers = getQuizAnswers();
  const existingIndex = answers.findIndex(
    a => a.userId === answer.userId && a.date === answer.date
  );
  
  if (existingIndex >= 0) {
    answers[existingIndex] = answer;
  } else {
    answers.push(answer);
  }
  
  localStorage.setItem(STORAGE_KEYS.quizAnswers, JSON.stringify(answers));
}

// Streak functions
export function getStreak(userId: string): StreakData {
  const data = localStorage.getItem(STORAGE_KEYS.streaks);
  const allStreaks: StreakData[] = data ? JSON.parse(data) : [];
  
  return allStreaks.find(s => s.userId === userId) || {
    userId,
    currentStreak: 0,
    lastCheckinDate: '',
    earnedBonuses: [],
  };
}

export function updateStreak(userId: string): { newStreak: number; bonusEarned: number } {
  return recalculateStreak(userId);
}

export function recalculateStreak(userId: string): { newStreak: number; bonusEarned: number } {
  const checkedDates = getCheckedDates(userId);
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
    const dateStr = checkDate.toISOString().split('T')[0];

    if (sortedDates.includes(dateStr)) {
      newStreak++;
    } else {
      break;
    }
  }

  // Get previous streak to compare earned bonuses
  const oldStreak = getStreak(userId);
  let earnedBonuses = newStreak > 0 ? [...(oldStreak.earnedBonuses || [])] : [];

  // If streak was broken (went to 0 at some point), reset bonuses
  // We detect this by checking if the old streak was 0 or if new streak < old earned bonus thresholds
  if (newStreak < (oldStreak.currentStreak || 0) && newStreak < Math.min(...(oldStreak.earnedBonuses.length > 0 ? oldStreak.earnedBonuses : [Infinity]))) {
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
  const updatedStreak: StreakData = {
    userId,
    currentStreak: newStreak,
    lastCheckinDate: sortedDates[0],
    earnedBonuses,
  };

  const data = localStorage.getItem(STORAGE_KEYS.streaks);
  const allStreaks: StreakData[] = data ? JSON.parse(data) : [];
  const existingIndex = allStreaks.findIndex(s => s.userId === userId);

  if (existingIndex >= 0) {
    allStreaks[existingIndex] = updatedStreak;
  } else {
    allStreaks.push(updatedStreak);
  }

  localStorage.setItem(STORAGE_KEYS.streaks, JSON.stringify(allStreaks));

  return { newStreak, bonusEarned };
}

// Badge functions
export function getBadges(userId: string): Badge[] {
  const data = localStorage.getItem(STORAGE_KEYS.badges);
  const allBadges: Badge[] = data ? JSON.parse(data) : [];
  return allBadges.filter(b => b.userId === userId);
}

export function checkAndUnlockBadges(userId: string, totalPoints: number): Badge[] {
  const existingBadges = getBadges(userId);
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
    const data = localStorage.getItem(STORAGE_KEYS.badges);
    const allBadges: Badge[] = data ? JSON.parse(data) : [];
    allBadges.push(...newBadges);
    localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(allBadges));
  }
  
  return newBadges;
}

// Get total score for a user
export function getTotalScore(userId: string): number {
  const checkins = getCheckins().filter(c => c.userId === userId);
  const quizzes = getQuizAnswers().filter(q => q.userId === userId);
  const streak = getStreak(userId);
  
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
