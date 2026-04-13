"use client";

import Image from "next/image";
import { PokemonInfo } from "@/lib/pokeapi";
import {
  SpeedPattern,
  NatureModifier,
  PATTERN_LABEL,
  calcEffectiveSpeed,
  compareEffective,
  Verdict,
} from "@/lib/speedCalc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Props {
  myPokemon: (PokemonInfo | null)[];
  oppPokemon: (PokemonInfo | null)[];
  myPatterns: SpeedPattern[];
  oppPatterns: SpeedPattern[];
  myNatures: NatureModifier[];
  oppNatures: NatureModifier[];
  trickroom: boolean;
  myTailwind: boolean;
  oppTailwind: boolean;
}

interface SlotEntry {
  info: PokemonInfo;
  team: "mine" | "opp";
  pattern: SpeedPattern;
  nature: NatureModifier;
  rawSpeed: number;
  effectiveSpeed: number;
}

const VERDICT_LABEL: Record<Verdict, { text: string; className: string }> = {
  faster: { text: "先攻 ▲", className: "text-blue-600 font-bold" },
  slower: { text: "後攻 ▼", className: "text-red-600 font-bold" },
  tie:    { text: "同速 ＝", className: "text-yellow-600 font-bold" },
};

const NATURE_BADGE: Record<NatureModifier, { label: string; className: string } | null> = {
  plus:    { label: "性格＋", className: "bg-orange-100 text-orange-600 border-orange-200" },
  minus:   { label: "性格－", className: "bg-sky-100 text-sky-600 border-sky-200" },
  neutral: null,
};

export default function SpeedRanking({
  myPokemon,
  oppPokemon,
  myPatterns,
  oppPatterns,
  myNatures,
  oppNatures,
  trickroom,
  myTailwind,
  oppTailwind,
}: Props) {
  // フラット化・null 除去
  const entries: SlotEntry[] = [
    ...myPokemon.map((p, i) => ({
      info: p,
      team: "mine" as const,
      pattern: myPatterns[i],
      nature: myNatures[i],
    })),
    ...oppPokemon.map((p, i) => ({
      info: p,
      team: "opp" as const,
      pattern: oppPatterns[i],
      nature: oppNatures[i],
    })),
  ]
    .filter(
      (e): e is { info: PokemonInfo; team: "mine" | "opp"; pattern: SpeedPattern; nature: NatureModifier } =>
        e.info !== null
    )
    .map(({ info, team, pattern, nature }) => {
      const tailwind = team === "mine" ? myTailwind : oppTailwind;
      const rawSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, nature, false);
      const effectiveSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, nature, tailwind);
      return { info, team, pattern, nature, rawSpeed, effectiveSpeed };
    });

  if (entries.length === 0) return null;

  // トリックルーム: 遅い順、通常: 速い順
  const sorted = [...entries].sort((a, b) =>
    trickroom
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-gray-700">素早さランキング</CardTitle>
            {trickroom && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                トリックルーム
              </Badge>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {trickroom ? "遅い順" : "速い順"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((e, i) => {
              const isMine = e.team === "mine";
              const hasTailwind = isMine ? myTailwind : oppTailwind;
              const barPct = (e.effectiveSpeed / globalMax) * 100;
              const natureBadge = NATURE_BADGE[e.nature];

              return (
                <div key={`${e.info.id}-${e.team}-${i}`} className="flex items-center gap-3">
                  {/* 順位 */}
                  <span className="w-5 text-center text-sm font-bold text-gray-400 flex-shrink-0">
                    {i + 1}
                  </span>

                  {/* チームカラーバー */}
                  <span
                    className={cn(
                      "w-2 h-8 rounded-full flex-shrink-0",
                      isMine ? "bg-blue-400" : "bg-red-400"
                    )}
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
                      <span className={cn("text-[11px]", isMine ? "text-blue-500" : "text-red-500")}>
                        {isMine ? "自分" : "相手"}
                      </span>
                      {/* 努力値バッジ */}
                      <Badge variant="secondary" className="text-[11px] px-1.5 py-0.5 h-auto rounded">
                        {PATTERN_LABEL[e.pattern]}
                      </Badge>
                      {/* 性格補正バッジ */}
                      {natureBadge && (
                        <Badge
                          variant="outline"
                          className={cn("text-[11px] px-1.5 py-0.5 h-auto rounded font-semibold", natureBadge.className)}
                        >
                          {natureBadge.label}
                        </Badge>
                      )}
                      {/* 追い風バッジ */}
                      {hasTailwind && (
                        <Badge
                          variant="outline"
                          className="text-[11px] px-1.5 py-0.5 h-auto rounded font-semibold bg-sky-100 text-sky-600 border-sky-200"
                        >
                          追い風
                        </Badge>
                      )}
                    </div>

                    {/* スピードバー */}
                    <div className="relative h-2.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn(
                          "absolute top-0 left-0 h-full rounded-full",
                          isMine ? "bg-blue-400" : "bg-red-400"
                        )}
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
        </CardContent>
      </Card>

      {/* ── 対面比較 ── */}
      {hasMatchup && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-gray-700">対面比較</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pb-2 text-xs text-gray-400 font-normal h-auto">
                    自分 ╲ 相手
                  </TableHead>
                  {oppEntries.map((o, j) => (
                    <TableHead key={j} className="pb-2 text-center text-xs font-semibold text-red-600 h-auto">
                      {o.info.jaName}
                      <br />
                      <span className="text-gray-400 font-normal">{o.effectiveSpeed}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {myEntries.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2 text-xs font-semibold text-blue-600 whitespace-nowrap">
                      {m.info.jaName}
                      <br />
                      <span className="text-gray-400 font-normal">{m.effectiveSpeed}</span>
                    </TableCell>
                    {oppEntries.map((o, j) => {
                      const verdict = compareEffective(
                        m.effectiveSpeed,
                        o.effectiveSpeed,
                        trickroom
                      );
                      const { text, className } = VERDICT_LABEL[verdict];
                      return (
                        <TableCell key={j} className={cn("py-2 text-center text-xs", className)}>
                          {text}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
