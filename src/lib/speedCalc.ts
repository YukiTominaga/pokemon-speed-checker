/**
 * Pokémon speed stat calculator (Level 50, 31 IVs fixed)
 *
 * 無振り (min): 0 EV, neutral nature
 * 最速  (max): 252 EV, +speed nature (×1.1)
 */
export type SpeedPattern = "min" | "max";

/**
 * Calculate speed stat at Level 50.
 * Formula: floor((floor((base×2 + IV + floor(EV/4)) × Lv/100) + 5) × nature)
 */
export function calcSpeed(base: number, pattern: SpeedPattern): number {
  const iv = 31;
  const lv = 50;

  if (pattern === "min") {
    return Math.floor((Math.floor((base * 2 + iv) * lv) / 100) + 5);
  } else {
    const evContrib = Math.floor(252 / 4); // 63
    const raw = Math.floor(((base * 2 + iv + evContrib) * lv) / 100) + 5;
    return Math.floor(raw * 1.1);
  }
}

export interface SpeedRange {
  min: number;
  max: number;
}

export function getSpeedRange(base: number): SpeedRange {
  return { min: calcSpeed(base, "min"), max: calcSpeed(base, "max") };
}

export type Verdict = "faster" | "slower" | "ambiguous";

/**
 * Compare two Pokémon's speed ranges.
 * Returns verdict from the perspective of Pokémon A:
 *   "faster"    → A's 無振り > B's 最速  (A always outspeeds)
 *   "slower"    → A's 最速  < B's 無振り (A always gets outsped)
 *   "ambiguous" → ranges overlap
 */
export function compareSpeed(a: SpeedRange, b: SpeedRange): Verdict {
  if (a.min > b.max) return "faster";
  if (a.max < b.min) return "slower";
  return "ambiguous";
}
