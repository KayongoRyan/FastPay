export type GoalType = "short" | "long";

export interface SavingsGoal {
  id: string;
  name: string;
  type: GoalType;
  targetRwf: number;
  savedRwf: number;
  createdAt: string;
}

export interface GoalStatus {
  goalId: string;
  progress: number;
  remainingRwf: number;
  isComplete: boolean;
}

export function createGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function evaluateGoal(goal: SavingsGoal): GoalStatus {
  const target = Math.max(goal.targetRwf, 0);
  const saved = Math.max(goal.savedRwf, 0);
  const progress = target > 0 ? Math.min(saved / target, 1) : 0;
  const remainingRwf = Math.max(target - saved, 0);

  return {
    goalId: goal.id,
    progress,
    remainingRwf,
    isComplete: target > 0 && saved >= target,
  };
}

export function evaluateGoals(goals: SavingsGoal[]): GoalStatus[] {
  return goals.map(evaluateGoal);
}

export function totalGoalSaved(goals: SavingsGoal[]): number {
  return goals.reduce((sum, goal) => sum + Math.max(goal.savedRwf, 0), 0);
}

export function totalGoalTarget(goals: SavingsGoal[]): number {
  return goals.reduce((sum, goal) => sum + Math.max(goal.targetRwf, 0), 0);
}

export function suggestContribution(
  netRwf: number,
  goals: SavingsGoal[],
): string | null {
  if (netRwf <= 0 || goals.length === 0) {
    return null;
  }

  const incomplete = goals.filter(
    (goal) => goal.targetRwf > 0 && goal.savedRwf < goal.targetRwf,
  );
  if (incomplete.length === 0) {
    return null;
  }

  const top = incomplete[0];
  return `You saved ${formatRwf(netRwf)} this period. Consider contributing toward "${top.name}".`;
}

function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString()} RWF`;
}
