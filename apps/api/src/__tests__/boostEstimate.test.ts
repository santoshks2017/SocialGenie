import { describe, it, expect } from 'vitest';

// Reach estimate heuristic extracted from boost.ts for unit testing
function reachEstimate(dailyBudget: number) {
  return {
    minReach: Math.round(dailyBudget * 12),
    maxReach: Math.round(dailyBudget * 20),
    estimatedOnly: true,
  };
}

describe('boost reach estimate', () => {
  it('returns estimatedOnly: true', () => {
    expect(reachEstimate(1000).estimatedOnly).toBe(true);
  });

  it('min is always less than max', () => {
    for (const budget of [100, 500, 1000, 5000]) {
      const { minReach, maxReach } = reachEstimate(budget);
      expect(minReach).toBeLessThan(maxReach);
    }
  });

  it('scales linearly with budget', () => {
    const a = reachEstimate(1000);
    const b = reachEstimate(2000);
    expect(b.minReach).toBe(a.minReach * 2);
    expect(b.maxReach).toBe(a.maxReach * 2);
  });

  it('handles zero budget without crashing', () => {
    const r = reachEstimate(0);
    expect(r.minReach).toBe(0);
    expect(r.maxReach).toBe(0);
  });
});
