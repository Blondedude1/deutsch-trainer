// Central knobs. Change the model or thresholds here, nowhere else.

export const MODEL = "claude-sonnet-5-5";

export const BATCH_SIZE = 20; // items per generated batch / drill session
export const QA_SIZE = 10; // Daily QA items

export const SEAL = {
  daysNeeded: 3, // separate days
  minLevel: 3, // only level >= 3 items count
  minItemsPerDay: 10, // a day needs at least this many counted items
  passRate: 0.9, // and at least this share correct
};

export const LEVEL_UP_RATE = 0.9; // suggest next level after a session at >= 90 %

export const ACTIVE = {
  idleMs: 60_000, // input or check within the last 60 s
  tickMs: 5_000,
};

export const LEARNER = {
  name: "Myag",
  levelLine: "Level 2 · A2 → B1 · target Goethe C1",
};
