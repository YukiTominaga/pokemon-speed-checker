'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChampionsPokemon } from '@/data/championsRoster';
import { calcSpeed, SpeedPattern, NatureModifier, PATTERN_LABEL } from '@/lib/speedCalc';
import PartyPicker from './PartyPicker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  index: number;
  team: 'mine' | 'opp';
  pokemon: ChampionsPokemon | null;
  partyIndex: number | null;
  pattern: SpeedPattern;
  nature: NatureModifier;
  party: (ChampionsPokemon | null)[];
  otherSelectedIndices: number[];
  onSelect: (partyIndex: number) => void;
  onClear: () => void;
  onPatternChange: (p: SpeedPattern) => void;
  onNatureChange: (n: NatureModifier) => void;
}

export default function BattleSlot({
  index,
  team,
  pokemon,
  partyIndex,
  pattern,
  nature,
  party,
  otherSelectedIndices,
  onSelect,
  onClear,
  onPatternChange,
  onNatureChange,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const isMine = team === 'mine';
  const border = isMine ? 'border-blue-400' : 'border-red-400';
  const bg = isMine ? 'bg-blue-50' : 'bg-red-50';
  const labelColor = isMine ? 'text-blue-600' : 'text-red-600';
  const emptyBg = isMine ? 'bg-blue-100/60' : 'bg-red-100/60';
  const activeColor = isMine
    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white'
    : 'bg-red-500 text-white hover:bg-red-600 hover:text-white';

  const effectiveSpeed = pokemon ? calcSpeed(pokemon.baseSpeed, pattern, nature) : null;

  const handleNatureClick = (clicked: 'plus' | 'minus') => {
    onNatureChange(nature === clicked ? 'neutral' : clicked);
  };

  const hasParty = party.some(Boolean);

  return (
    <>
      <Card className={`border-2 ${border} ${bg}`}>
        <CardContent className="p-2">
          {/* ヘッダー行 */}
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-[11px] font-bold ${labelColor}`}>選出 {index + 1}</span>
            {pokemon && (
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[9px] text-gray-500 hover:bg-gray-300"
                aria-label="クリア"
              >
                ✕
              </button>
            )}
          </div>

          {/* スプライト＋名前エリア */}
          <div
            onClick={() => hasParty && setPickerOpen(true)}
            className={`transition-opacity ${hasParty ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-50'}`}
          >
            {pokemon ? (
              <div className="flex flex-col items-center gap-0.5">
                <Image
                  src={pokemon.spriteUrl}
                  alt={pokemon.jaName}
                  width={56}
                  height={56}
                  className="[image-rendering:pixelated]"
                  unoptimized
                />
                <p className="w-full text-center text-[11px] font-semibold leading-tight line-clamp-2">
                  {pokemon.jaName}
                </p>
                <p className="text-[10px] text-gray-400">基礎 {pokemon.baseSpeed}</p>
              </div>
            ) : (
              <div className={`flex h-20 flex-col items-center justify-center rounded-lg ${emptyBg}`}>
                <span className="text-xl opacity-40">＋</span>
                <span className={`text-[10px] font-medium opacity-60 ${labelColor}`}>
                  {hasParty ? '選ぶ' : 'パーティ先に'}
                </span>
              </div>
            )}
          </div>

          {/* EV / 性格補正 / 実数値 */}
          {pokemon && (
            <div className="mt-2 space-y-1.5">
              {/* 無振 / 全振 */}
              <div className="flex overflow-hidden rounded-md border border-gray-200">
                {(['min', 'max'] as SpeedPattern[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPatternChange(p)}
                    className={`flex-1 py-1 text-[11px] font-semibold transition-colors ${
                      pattern === p ? activeColor : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {PATTERN_LABEL[p]}
                  </button>
                ))}
              </div>

              {/* 性格 + 実数値 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNatureClick('plus')}
                  className={`flex h-6 w-6 items-center justify-center rounded border text-[11px] font-bold transition-colors ${
                    nature === 'plus'
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-500'
                  }`}
                  title="性格補正＋"
                >
                  ＋
                </button>
                <button
                  onClick={() => handleNatureClick('minus')}
                  className={`flex h-6 w-6 items-center justify-center rounded border text-[11px] font-bold transition-colors ${
                    nature === 'minus'
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-sky-300 hover:text-sky-500'
                  }`}
                  title="性格補正－"
                >
                  －
                </button>
                <span className={`ml-auto text-xs font-bold ${isMine ? 'text-blue-700' : 'text-red-700'}`}>
                  {effectiveSpeed}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {pickerOpen && (
        <PartyPicker
          party={party}
          currentIndex={partyIndex}
          disabledIndices={otherSelectedIndices}
          onSelect={onSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
