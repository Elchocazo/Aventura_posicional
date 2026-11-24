// Gestión de cupo semanal gratis y créditos de Talleres (Fichas imprimibles)

const WEEKLY_USED_KEY = 'math_weekly_sheets_used';
const WEEKLY_RESET_KEY = 'math_weekly_sheets_reset';
const WORKSHOP_CREDITS_KEY = 'math_workshop_credits';
const WORKSHOP_UNLIMITED_KEY = 'math_workshop_unlimited';

export const WEEKLY_FREE_WORKSHOPS = 2; // 2 talleres gratis por semana
export const SINGLE_WORKSHOP_STAR_COST = 150; // 1 taller extra con estrellas

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface WorkshopQuotaState {
  freeRemaining: number;
  freeUsed: number;
  credits: number;
  unlimited: boolean;
}

export function getWorkshopQuota(): WorkshopQuotaState {
  if (typeof window === 'undefined') {
    return { freeRemaining: WEEKLY_FREE_WORKSHOPS, freeUsed: 0, credits: 0, unlimited: false };
  }

  const now = Date.now();
  const lastReset = parseInt(localStorage.getItem(WEEKLY_RESET_KEY) || '0', 10);
  let used = parseInt(localStorage.getItem(WEEKLY_USED_KEY) || '0', 10);

  if (!lastReset || now - lastReset >= ONE_WEEK_MS) {
    used = 0;
    localStorage.setItem(WEEKLY_USED_KEY, '0');
    localStorage.setItem(WEEKLY_RESET_KEY, now.toString());
  }

  const credits = parseInt(localStorage.getItem(WORKSHOP_CREDITS_KEY) || '0', 10) || 0;
  const unlimited = localStorage.getItem(WORKSHOP_UNLIMITED_KEY) === 'true';

  return {
    freeUsed: used,
    freeRemaining: Math.max(0, WEEKLY_FREE_WORKSHOPS - used),
    credits,
    unlimited,
  };
}

export function consumeWorkshopAccess(): { usedType: 'unlimited' | 'free' | 'credit' | 'stars' } {
  const quota = getWorkshopQuota();
  if (quota.unlimited) return { usedType: 'unlimited' };

  if (quota.freeRemaining > 0) {
    localStorage.setItem(WEEKLY_USED_KEY, (quota.freeUsed + 1).toString());
    return { usedType: 'free' };
  }

  if (quota.credits > 0) {
    localStorage.setItem(WORKSHOP_CREDITS_KEY, (quota.credits - 1).toString());
    return { usedType: 'credit' };
  }

  return { usedType: 'stars' };
}

export function addWorkshopCredits(amount: number): number {
  const current = parseInt(localStorage.getItem(WORKSHOP_CREDITS_KEY) || '0', 10) || 0;
  const next = current + amount;
  localStorage.setItem(WORKSHOP_CREDITS_KEY, next.toString());
  return next;
}
