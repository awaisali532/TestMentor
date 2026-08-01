/**
 * SeedRandom — Mulberry32 Seeded Pseudo-Random Number Generator
 *
 * Benefits:
 *  - Same seed → same paper (reproducible, debuggable)
 *  - Different seed → different paper (variety)
 *  - Extremely fast (5 arithmetic ops per call)
 *  - No external dependencies
 */
export class SeedRandom {
  constructor(seed) {
    const s =
      seed !== undefined && seed !== null
        ? seed
        : ((Math.random() * 0xffffffff) >>> 0);
    this._seed = s >>> 0;
    this._initial = this._seed;
  }

  /** Returns float in [0, 1) */
  next() {
    let t = (this._seed += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns integer in [0, max) */
  nextInt(max) {
    return Math.floor(this.next() * max);
  }

  /** Fisher-Yates shuffle — returns new shuffled array, original untouched */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Reset to initial seed (useful for retries with same seed + relaxed params) */
  reset() {
    this._seed = this._initial;
  }

  get seed() {
    return this._initial;
  }
}

/** Generate a fresh random seed */
export const createSeed = () => ((Math.random() * 0xffffffff) >>> 0);
