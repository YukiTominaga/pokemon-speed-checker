"use client";

import Image from "next/image";
import { PokemonInfo } from "@/lib/pokeapi";
import { compareSpeed, getSpeedRange, Verdict } from "@/lib/speedCalc";

interface Props {
  myPokemon: (PokemonInfo | null)[];   // 2 slots
  oppPokemon: (PokemonInfo | null)[];  // 2 slots
}

interface SlotEntry {
  info: PokemonInfo;
  team: "mine" | "opp";
  min: number;
  max: number;
}

const VERDICT_LABEL: Record<Verdict, { text: string; color: string }> = {
  faster:    { text: "確実に速い ▲", color: "text-blue-600 font-bold" },
  slower:    { text: "確実に遅い ▼", color: "text-red-600 font-bold" },
  ambiguous: { text: "状況次第 ～",  color: "text-yellow-600 font-bold" },
};

export default function SpeedRanking({ myPokemon, oppPokemon }: Props) {
  // Build flattened, non-null list
  const entries: SlotEntry[] = [
    ...myPokemon.map((p) => ({ info: p, team: "mine" as const })),
    ...oppPokemon.map((p) => ({ info: p, team: "opp" as const })),
  ]
    .filter((e): e is { info: PokemonInfo; team: "mine" | "opp" } => e.info !== null)
    .map(({ info, team }) => {
      const { min, max } = getSpeedRange(info.baseSpeed);
      return { info, team, min, max };
    });

  if (entries.length === 0) return null;

  // Sort by 最速 descending (tie-break by 無振り descending)
  const sorted = [...entries].sort((a, b) =>
    b.max !== a.max ? b.max - a.max : b.min - a.min
  );

  const globalMax = sorted[0].max;

  const myEntries  = entries.filter((e) => e.team === "mine");
  const oppEntries = entries.filter((e) => e.team === "opp");
  const hasMatchup = myEntries.length > 0 && oppEntries.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Speed Ranking ── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-700 mb-4">
          素早さランキング
          <span className="text-xs font-normal text-gray-400 ml-2">
            （最速基準 / 降順）
          </span>
        </h2>

        <div className="space-y-3">
          {sorted.map((e, i) => {
            const isMine = e.team === "mine";
            const barMax = (e.max / globalMax) * 100;
            const barMin = (e.min / globalMax) * 100;

            return (
              <div key={`${e.info.id}-${e.team}-${i}`} className="flex items-center gap-3">
                {/* Rank */}
                <span className="w-6 text-center text-sm font-bold text-gray-400">
                  {i + 1}
                </span>

                {/* Team badge */}
                <span
                  className={`w-2 h-8 rounded-full flex-shrink-0 ${
                    isMine ? "bg-blue-400" : "bg-red-400"
                  }`}
                />

                {/* Sprite */}
                {e.info.spriteUrl ? (
                  <Image
                    src={e.info.spriteUrl}
                    alt={e.info.jaName}
                    width={40}
                    height={40}
                    className="[image-rendering:pixelated] flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
                )}

                {/* Name + speeds */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">
                      {e.info.jaName}
                    </span>
                    <span className={`text-xs ${isMine ? "text-blue-500" : "text-red-500"}`}>
                      {isMine ? "自分" : "相手"}
                    </span>
                  </div>

                  {/* Range bar */}
                  <div className="relative h-3 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    {/* 無振り → 最速 range */}
                    <div
                      className={`absolute top-0 h-full rounded-full ${
                        isMine ? "bg-blue-300" : "bg-red-300"
                      }`}
                      style={{ left: 0, width: `${barMax}%` }}
                    />
                    {/* 無振り marker */}
                    <div
                      className={`absolute top-0 h-full rounded-full ${
                        isMine ? "bg-blue-500" : "bg-red-500"
                      }`}
                      style={{ left: 0, width: `${barMin}%` }}
                    />
                  </div>

                  {/* Numbers */}
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                    <span>無振り <strong className="text-gray-700">{e.min}</strong></span>
                    <span>最速 <strong className="text-gray-700">{e.max}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 自分
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 相手
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> 無振り〜最速の範囲
          </span>
        </div>
      </section>

      {/* ── Matchup Table ── */}
      {hasMatchup && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-700 mb-4">
            対面素早さ比較
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-2 pr-4 text-gray-400 font-normal text-xs">
                    自分 ＼ 相手
                  </th>
                  {oppEntries.map((o, j) => (
                    <th
                      key={j}
                      className="pb-2 px-3 text-center text-xs font-semibold text-red-600"
                    >
                      {o.info.jaName}
                      <br />
                      <span className="text-gray-400 font-normal">
                        {o.min}〜{o.max}
                      </span>
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
                      <span className="text-gray-400 font-normal">
                        {m.min}〜{m.max}
                      </span>
                    </td>
                    {oppEntries.map((o, j) => {
                      const verdict = compareSpeed(
                        { min: m.min, max: m.max },
                        { min: o.min, max: o.max }
                      );
                      const { text, color } = VERDICT_LABEL[verdict];
                      return (
                        <td
                          key={j}
                          className={`py-2 px-3 text-center text-xs ${color}`}
                        >
                          {text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verdict legend */}
          <div className="mt-3 text-xs text-gray-400 space-y-0.5">
            <p>
              <span className="text-blue-600 font-bold">確実に速い</span>
              ：自分の無振り速度が相手の最速を上回る
            </p>
            <p>
              <span className="text-red-600 font-bold">確実に遅い</span>
              ：自分の最速が相手の無振りを下回る
            </p>
            <p>
              <span className="text-yellow-600 font-bold">状況次第</span>
              ：努力値・性格によって先後が変わる
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
