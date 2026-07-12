export const LOCK_PERIOD_OPTIONS = [15, 20, 25, 30] as const;

export type LockPeriodYears = (typeof LOCK_PERIOD_OPTIONS)[number];

export interface FamilyChildPlan {
  id: string;
  name: string;
  targetRwf: number;
  savedRwf: number;
  lockYears: LockPeriodYears;
  createdAt: string;
}

export interface TimelineMilestone {
  year: number;
  yearOffset: number;
  label: string;
  amountRwf: number;
  isPast: boolean;
  isCurrent: boolean;
  isUnlock: boolean;
}

export interface FamilyChildPlanStatus {
  planId: string;
  progress: number;
  remainingRwf: number;
  unlockDate: Date;
  unlockLabel: string;
  yearsRemaining: number;
  isLocked: boolean;
  isUnlocked: boolean;
  timeline: TimelineMilestone[];
}

const CHILD_NAME_PRESETS = [
  "First child",
  "Second child",
  "Third child",
  "Fourth child",
  "Fifth child",
];

export function createFamilyPlanId(): string {
  return `family-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function suggestChildName(existingCount: number): string {
  return CHILD_NAME_PRESETS[existingCount] ?? `Child ${existingCount + 1}`;
}

export function getUnlockDate(
  createdAt: string,
  lockYears: LockPeriodYears,
): Date {
  const start = new Date(createdAt);
  const unlock = new Date(start);
  unlock.setFullYear(unlock.getFullYear() + lockYears);
  return unlock;
}

export function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

export function evaluateFamilyPlan(
  plan: FamilyChildPlan,
  today: Date = new Date(),
): FamilyChildPlanStatus {
  const target = Math.max(plan.targetRwf, 0);
  const saved = Math.max(plan.savedRwf, 0);
  const progress = target > 0 ? Math.min(saved / target, 1) : 0;
  const remainingRwf = Math.max(target - saved, 0);
  const unlockDate = getUnlockDate(plan.createdAt, plan.lockYears);
  const isUnlocked = today.getTime() >= unlockDate.getTime();
  const isLocked = !isUnlocked;

  const msRemaining = Math.max(unlockDate.getTime() - today.getTime(), 0);
  const yearsRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24 * 365.25));

  return {
    planId: plan.id,
    progress,
    remainingRwf,
    unlockDate,
    unlockLabel: formatUnlockDate(unlockDate),
    yearsRemaining: isUnlocked ? 0 : yearsRemaining,
    isLocked,
    isUnlocked,
    timeline: buildTimeline(plan, today),
  };
}

export function buildTimeline(
  plan: FamilyChildPlan,
  today: Date = new Date(),
): TimelineMilestone[] {
  const startYear = new Date(plan.createdAt).getFullYear();
  const currentYear = today.getFullYear();
  const target = Math.max(plan.targetRwf, 0);
  const saved = Math.max(plan.savedRwf, 0);

  const offsets = [0];
  for (let year = 5; year < plan.lockYears; year += 5) {
    offsets.push(year);
  }
  if (!offsets.includes(plan.lockYears)) {
    offsets.push(plan.lockYears);
  }

  return offsets.map((offset) => {
    const year = startYear + offset;
    const ratio = plan.lockYears > 0 ? offset / plan.lockYears : 0;
    const amountRwf = Math.round(saved + (target - saved) * ratio);
    const isPast = year < currentYear;
    const isCurrent = year === currentYear;
    const isUnlock = offset === plan.lockYears;

    let label = `${offset} years`;
    if (offset === 0) {
      label = "Start";
    } else if (isUnlock) {
      label = "Unlock";
    }

    return {
      year,
      yearOffset: offset,
      label,
      amountRwf,
      isPast,
      isCurrent,
      isUnlock,
    };
  });
}

export function totalFamilySaved(plans: FamilyChildPlan[]): number {
  return plans.reduce((sum, plan) => sum + Math.max(plan.savedRwf, 0), 0);
}

export function totalFamilyLocked(plans: FamilyChildPlan[]): number {
  const today = new Date();
  return plans
    .filter((plan) => !evaluateFamilyPlan(plan, today).isUnlocked)
    .reduce((sum, plan) => sum + Math.max(plan.savedRwf, 0), 0);
}
