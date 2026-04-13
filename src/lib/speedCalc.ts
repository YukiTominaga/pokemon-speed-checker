/**
 * Pokémon speed stat calculator (Level 50, 31 IVs fixed)
 *
 * 無振り (min): 0 EV
 * 全振り (max): 252 EV
 * 性格補正 (nature): plus ×1.1 / neutral ×1.0 / minus ×0.9
 */
export type SpeedPattern = "min" | "max";
export type NatureModifier = "plus" | "neutral" | "minus";

export const PATTERN_LABEL: Record<SpeedPattern, string> = {
  min: "無振り",
  max: "全振り",
};

export const NATURE_MULTIPLIER: Record<NatureModifier, number> = {
  plus: 1.1,
  neutral: 1.0,
  minus: 0.9,
};

/**
 * Calculate speed stat at Level 50.
 * Formula: floor((floor((base×2 + IV + floor(EV/4)) × Lv/100) + 5) × nature)
 */
export function calcSpeed(
  base: number,
  pattern: SpeedPattern,
  nature: NatureModifier = "neutral"
): number {
  const iv = 31;
  const lv = 50;
  const mult = NATURE_MULTIPLIER[nature];

  if (pattern === "min") {
    const raw = Math.floor(((base * 2 + iv) * lv) / 100) + 5;
    return Math.floor(raw * mult);
  } else {
    const evContrib = Math.floor(252 / 4); // 63
    const raw = Math.floor(((base * 2 + iv + evContrib) * lv) / 100) + 5;
    return Math.floor(raw * mult);
  }
}

/**
 * Apply field modifiers to a calculated speed stat.
 * 追い風: ×2
 */
export function calcEffectiveSpeed(
  base: number,
  pattern: SpeedPattern,
  nature: NatureModifier,
  tailwind: boolean
): number {
  const speed = calcSpeed(base, pattern, nature);
  return tailwind ? speed * 2 : speed;
}

export type Verdict = "faster" | "slower" | "tie";

/**
 * Compare two effective speeds considering Trick Room.
 * Returns verdict from perspective of Pokémon A (does A move first?).
 *   "faster" → A moves before B
 *   "slower" → B moves before A
 *   "tie"    → same speed (coin flip)
 */
export function compareEffective(
  speedA: number,
  speedB: number,
  trickRoom: boolean
): Verdict {
  if (speedA === speedB) return "tie";
  const aFirst = trickRoom ? speedA < speedB : speedA > speedB;
  return aFirst ? "faster" : "slower";
}
