/**
 * Generates a deterministic integer seed from a team name.
 * Same team name will ALWAYS generate the exact same seed number.
 */
export function createGroupSeed(teamName: string): number {
  if (!teamName) return 42;
  const clean = teamName.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 101;
}

/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 */
export class DeterministicRandom {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /**
   * Returns a float in [0, 1)
   */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Picks an element from an array deterministically
   */
  pick<T>(array: T[]): T {
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}
