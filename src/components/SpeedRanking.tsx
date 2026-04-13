"use client";

import Image from "next/image";
import { PokemonInfo } from "@/lib/pokeapi";
import {
  SpeedPattern,
  PATTERN_LABEL,
  calcEffectiveSpeed,
  compareEffective,
  Verdict,
} from "@/lib/speedCalc";

interface Props {
  myPokemon: (PokemonInfo | null)[];
  oppPokemon: (PokemonInfo | null)[];
  myPatterns: SpeedPattern[];
  oppPatterns: SpeedPattern[];
  trickRoom: boolean;
  myTailwind: boolean;
  oppTailwind: boolean;
}

interface SlotEntry {
  info: PokemonInfo;
  team: "mine" | "opp";
  pattern: SpeedPattern;
  rawSpeed: number;
  effectiveSpeed: number;
}

const VERDICT_LABEL: Record<Verdict, { text: string; color: string }> = {
  faster: { text: "先攻 ▲", color: "text-blue-600 font-bold" },
  slower: { text: "後攻 ▼", color: "text-red-600 font-bold" },
  tie:    { text: "同速 ＝", color: "text-yellow-600 font-bold" },
};

export default function SpeedRanking({
  myPokemon,
  oppPokemon,
  myPatterns,
  oppPatterns,
  trickRoom,
  myTailwind,
  oppTailwind,
}: Props) {
  // フラット化・null 除去
  const entries: SlotEntry[] = [
    ...myPokemon.map((p, i) => ({ info: p, team: "mine" as const, pattern: myPatterns[i] })),
    ...oppPokemon.map((p, i) => ({ info: p, team: "opp" as const, pattern: oppPatterns[i] })),
  ]
    .filter((e): e is { info: PokemonInfo; team: "mine" | "opp"; pattern: SpeedPattern } =>
      e.info !== null
    )
    .map(({ info, team, pattern }) => {
      const tailwind = team === "mine" ? myTailwind : oppTailwind;
      const rawSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, false);
      const effectiveSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, tailwind);
      return { info, team, pattern, rawSpeed, effectiveSpeed };
    });

  if (entries.length === 0) return null;

  // トリックルーム: 遅い順、通常: 速い順
  const sorted = [...entries].sort((a, b) =>
    trickRoom
      ? a.effectiveSpeed - b.effectiveSpeed
      : b.effectiveSpeed - a.effectiveSpeed
  );

  const globalMax = Math.max(...entries.map((e) => e.effectiveSpeed));

  const myEntries  = entries.filter((e) => e.team === "mine");
  const oppEntries = entries.filter((e) => e.team === "opp");
  const hasMatchup = myEntries.length > 0 && oppEntries.length > 0;

  return (
    <div className="space-y-6">

      {/* ── 速さランキング ── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-gray-700">素早さランキング</h2>
          {trickRoom && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              トリックルーム
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {trickRoom ? "遅い順" : "速い順"}
          </span>
        </div>

        <div className="space-y-3">
          {sorted.map((e, i) => {
            const isMine = e.team === "mine";
            const hasTailwind = isMine ? myTailwind : oppTailwind;
            const barPct = (e.effectiveSpeed / globalMax) * 100;

            return (
              <div key={`${e.info.id}-${e.team}-${i}`} className="flex items-center gap-3">
                {/* 順位 */}
                <span className="w-5 text-center text-sm font-bold text-gray-400 flex-shrink-0">
                  {i + 1}
                </span>

                {/* チームカラーバー */}
                <span
                  className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    isMine ? "bg-blue-400" : "bg-red-400"
                  }`}
                />

                {/* スプライト */}
                <Image
                  src={e.info.spriteUrl ?? ""}
                  alt={e.info.jaName}
                  width={40}
                  height={40}
                  className="[image-rendering:pixelated] flex-shrink-0"
                  unoptimized
                />

                {/* 名前・速度 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm truncate">{e.info.jaName}</span>
                    <span className={`text-[11px] ${isMine ? "text-blue-500" : "text-red-500"}`}>
                      {isMine ? "自分" : "相手"}
                    </span>
                    {/* 努力値バッジ */}
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {PATTERN_LABEL[e.pattern]}
                    </span>
                    {/* 追い風バッジ */}
                    {hasTailwind && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 font-semibold">
                        追い風
                      </span>
                    )}
                  </div>

                  {/* スピードバー */}
                  <div className="relative h-2.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full ${
                        isMine ? "bg-blue-400" : "bg-red-400"
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  {/* 実数値 */}
                  <p className="text-xs text-gray-500 mt-0.5">
                    実数値{" "}
                    <strong className="text-gray-700">{e.effectiveSpeed}</strong>
                    {hasTailwind && (
                      <span className="text-gray-400 ml-1">
                        （素 {e.rawSpeed} × 2）
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="flex gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> 自分
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> 相手
          </span>
        </div>
      </section>

      {/* ── 対面比較 ── */}
      {hasMatchup && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-700 mb-4">対面比較</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="pb-2 pr-4 text-left text-xs text-gray-400 font-normal">
                    自分 ╲ 相手
                  </th>
                  {oppEntries.map((o, j) => (
                    <th key={j} className="pb-2 px-3 text-center text-xs font-semibold text-red-600">
                      {o.info.jaName}
                      <br />
                      <span className="text-gray-400 font-normal">{o.effectiveSpeed}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myEntries.map((m, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-xs font-semibold text-blue-600 whitespace-nowrap">
                      {m.info.jaName}
                      <br />
                      <span className="text-gray-400 font-normal">{m.effectiveSpeed}</span>
                    </td>
                    {oppEntries.map((o, j) => {
                      const verdict = compareEffective(
                        m.effectiveSpeed,
                        o.effectiveSpeed,
                        trickRoom
                      );
                      const { text, color } = VERDICT_LABEL[verdict];
                      return (
                        <td key={j} className={`py-2 px-3 text-center text-xs ${color}`}>
                          {text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
