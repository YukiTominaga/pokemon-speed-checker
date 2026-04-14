'use client';

import Image from 'next/image';
import { PokemonInfo } from '@/lib/pokeapi';
import {
  SpeedPattern,
  NatureModifier,
  PATTERN_LABEL,
  calcEffectiveSpeed,
  compareEffective,
  Verdict,
} from '@/lib/speedCalc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  myPokemon: (PokemonInfo | null)[];
  oppPokemon: (PokemonInfo | null)[];
  myPatterns: SpeedPattern[];
  oppPatterns: SpeedPattern[];
  myNatures: NatureModifier[];
  oppNatures: NatureModifier[];
  trickRoom: boolean;
  myTailwind: boolean;
  oppTailwind: boolean;
}

interface SlotEntry {
  info: PokemonInfo;
  team: 'mine' | 'opp';
  pattern: SpeedPattern;
  nature: NatureModifier;
  rawSpeed: number;
  effectiveSpeed: number;
}

const VERDICT_LABEL: Record<Verdict, { text: string; color: string }> = {
  faster: { text: '先攻 ▲', color: 'text-blue-600 font-bold' },
  slower: { text: '後攻 ▼', color: 'text-red-600 font-bold' },
  tie: { text: '同速 ＝', color: 'text-yellow-600 font-bold' },
};

const NATURE_BADGE: Record<NatureModifier, { label: string; className: string } | null> = {
  plus: { label: '性格＋', className: 'bg-orange-100 text-orange-600' },
  minus: { label: '性格－', className: 'bg-sky-100 text-sky-600' },
  neutral: null,
};

export default function SpeedRanking({
  myPokemon,
  oppPokemon,
  myPatterns,
  oppPatterns,
  myNatures,
  oppNatures,
  trickRoom,
  myTailwind,
  oppTailwind,
}: Props) {
  // フラット化・null 除去
  const entries: SlotEntry[] = [
    ...myPokemon.map((p, i) => ({
      info: p,
      team: 'mine' as const,
      pattern: myPatterns[i],
      nature: myNatures[i],
    })),
    ...oppPokemon.map((p, i) => ({
      info: p,
      team: 'opp' as const,
      pattern: oppPatterns[i],
      nature: oppNatures[i],
    })),
  ]
    .filter(
      (
        e
      ): e is {
        info: PokemonInfo;
        team: 'mine' | 'opp';
        pattern: SpeedPattern;
        nature: NatureModifier;
      } => e.info !== null
    )
    .map(({ info, team, pattern, nature }) => {
      const tailwind = team === 'mine' ? myTailwind : oppTailwind;
      const rawSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, nature, false);
      const effectiveSpeed = calcEffectiveSpeed(info.baseSpeed, pattern, nature, tailwind);
      return { info, team, pattern, nature, rawSpeed, effectiveSpeed };
    });

  if (entries.length === 0) return null;

  // トリックルーム: 遅い順、通常: 速い順
  const sorted = [...entries].sort((a, b) =>
    trickRoom ? a.effectiveSpeed - b.effectiveSpeed : b.effectiveSpeed - a.effectiveSpeed
  );

  const globalMax = Math.max(...entries.map((e) => e.effectiveSpeed));

  const myEntries = entries.filter((e) => e.team === 'mine');
  const oppEntries = entries.filter((e) => e.team === 'opp');
  const hasMatchup = myEntries.length > 0 && oppEntries.length > 0;

  return (
    <div className="space-y-6">
      {/* ── 速さランキング ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">素早さランキング</CardTitle>
            {trickRoom && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                トリックルーム
              </Badge>
            )}
            <span className="ml-auto text-xs text-gray-400">{trickRoom ? '遅い順' : '速い順'}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((e, i) => {
              const isMine = e.team === 'mine';
              const hasTailwind = isMine ? myTailwind : oppTailwind;
              const barPct = (e.effectiveSpeed / globalMax) * 100;
              const natureBadge = NATURE_BADGE[e.nature];

              return (
                <div key={`${e.info.id}-${e.team}-${i}`} className="flex items-center gap-3">
                  {/* 順位 */}
                  <span className="w-5 flex-shrink-0 text-center text-sm font-bold text-gray-400">
                    {i + 1}
                  </span>

                  {/* チームカラーバー */}
                  <span
                    className={`h-8 w-2 flex-shrink-0 rounded-full ${
                      isMine ? 'bg-blue-400' : 'bg-red-400'
                    }`}
                  />

                  {/* スプライト */}
                  <Image
                    src={e.info.spriteUrl ?? ''}
                    alt={e.info.jaName}
                    width={40}
                    height={40}
                    className="flex-shrink-0 [image-rendering:pixelated]"
                    unoptimized
                  />

                  {/* 名前・速度 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="truncate text-sm font-semibold">{e.info.jaName}</span>
                      <span className={`text-[11px] ${isMine ? 'text-blue-500' : 'text-red-500'}`}>
                        {isMine ? '自分' : '相手'}
                      </span>
                      {/* 努力値バッジ */}
                      <Badge variant="secondary" className="h-5 text-[11px]">
                        {PATTERN_LABEL[e.pattern]}
                      </Badge>
                      {/* 性格補正バッジ */}
                      {natureBadge && (
                        <Badge
                          variant="secondary"
                          className={`h-5 text-[11px] font-semibold ${natureBadge.className}`}
                        >
                          {natureBadge.label}
                        </Badge>
                      )}
                      {/* 追い風バッジ */}
                      {hasTailwind && (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-sky-100 text-[11px] font-semibold text-sky-600 hover:bg-sky-200"
                        >
                          追い風
                        </Badge>
                      )}
                    </div>

                    {/* スピードバー */}
                    <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          isMine ? 'bg-blue-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>

                    {/* 実数値 */}
                    <p className="mt-0.5 text-xs text-gray-500">
                      実数値 <strong className="text-gray-700">{e.effectiveSpeed}</strong>
                      {hasTailwind && (
                        <span className="ml-1 text-gray-400">（素 {e.rawSpeed} × 2）</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="mt-4 flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" /> 自分
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" /> 相手
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── 対面比較 ── */}
      {hasMatchup && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">対面比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="pr-4 pb-2 text-left text-xs font-normal text-gray-400">
                      自分 ╲ 相手
                    </th>
                    {oppEntries.map((o, j) => (
                      <th
                        key={j}
                        className="px-3 pb-2 text-center text-xs font-semibold text-red-600"
                      >
                        {o.info.jaName}
                        <br />
                        <span className="font-normal text-gray-400">{o.effectiveSpeed}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myEntries.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 pr-4 text-xs font-semibold whitespace-nowrap text-blue-600">
                        {m.info.jaName}
                        <br />
                        <span className="font-normal text-gray-400">{m.effectiveSpeed}</span>
                      </td>
                      {oppEntries.map((o, j) => {
                        const verdict = compareEffective(
                          m.effectiveSpeed,
                          o.effectiveSpeed,
                          trickRoom
                        );
                        const { text, color } = VERDICT_LABEL[verdict];
                        return (
                          <td key={j} className={`px-3 py-2 text-center text-xs ${color}`}>
                            {text}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
