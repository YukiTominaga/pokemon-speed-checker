'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChampionsPokemon, CHAMPIONS_ROSTER } from '@/data/championsRoster';
import { MEGA_MAP, MEGA_BASE_MAP } from '@/data/megaEvolutions';
import { calcSpeed, SpeedPattern, NatureModifier, PATTERN_LABEL } from '@/lib/speedCalc';
import PartyPicker from './PartyPicker';
import { Card, CardContent } from '@/components/ui/card';

export interface BattleSlotProps {
  team: 'mine' | 'opp';
  pokemon: ChampionsPokemon | null;
  partyIndex: number | null;
  pattern: SpeedPattern;
  nature: NatureModifier;
  party: (ChampionsPokemon | null)[];
  otherSelectedIndices: number[];
  onSelect: (partyIndex: number) => void;
  onClear: () => void;
  /** パーティスロットのポケモンを直接更新（メガシンカ用） */
  onPartyChange: (partyIdx: number, pokemon: ChampionsPokemon) => void;
  onPatternChange: (p: SpeedPattern) => void;
  onNatureChange: (n: NatureModifier) => void;
}

export default function BattleSlot({
  team,
  pokemon,
  partyIndex,
  pattern,
  nature,
  party,
  otherSelectedIndices,
  onSelect,
  onClear,
  onPartyChange,
  onPatternChange,
  onNatureChange,
}: BattleSlotProps) {
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

  // メガ進化オプション
  const megaOptions = pokemon
    ? (MEGA_MAP[pokemon.name] ?? []).flatMap(({ name, label }) => {
        const p = CHAMPIONS_ROSTER.find((r) => r.name === name);
        return p ? [{ pokemon: p, label }] : [];
      })
    : [];

  // もとにもどすボタン
  const baseName = pokemon ? MEGA_BASE_MAP[pokemon.name] : undefined;
  const basePokemon = baseName
    ? (CHAMPIONS_ROSTER.find((p) => p.name === baseName) ?? null)
    : null;

  const handleNatureClick = (clicked: 'plus' | 'minus') => {
    onNatureChange(nature === clicked ? 'neutral' : clicked);
  };

  // メガ/もどすボタン: パーティスロットを置き換えて battle は同インデックスを維持
  const handleMegaSwitch = (target: ChampionsPokemon) => {
    if (partyIndex === null) return;
    onPartyChange(partyIndex, target);
  };

  const hasParty = party.some(Boolean);

  return (
    <>
      <Card className={`border-2 ${border} ${bg}`}>
        <CardContent className="p-1.5">
          {pokemon ? (
            <div className="flex items-center gap-1.5">
              {/* スプライト（クリックで選択変更） */}
              <div
                onClick={() => hasParty && setPickerOpen(true)}
                className={`relative flex-shrink-0 transition-opacity ${hasParty ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
              >
                <Image
                  src={pokemon.spriteUrl}
                  alt={pokemon.jaName}
                  width={48}
                  height={48}
                  className="[image-rendering:pixelated]"
                  unoptimized
                />
                <button
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-300 text-[8px] text-gray-600 hover:bg-gray-400"
                  aria-label="クリア"
                >
                  ✕
                </button>
              </div>

              {/* 右側：名前・コントロール */}
              <div className="min-w-0 flex-1 space-y-1">
                {/* 名前 + 実数値 */}
                <div className="flex items-baseline justify-between gap-1">
                  <p className="truncate text-[11px] font-semibold leading-tight">{pokemon.jaName}</p>
                  <span className={`flex-shrink-0 text-xs font-bold ${isMine ? 'text-blue-700' : 'text-red-700'}`}>
                    {effectiveSpeed}
                  </span>
                </div>

                {/* 無振り/全振り + 性格 */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 overflow-hidden rounded border border-gray-200">
                    {(['min', 'max'] as SpeedPattern[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => onPatternChange(p)}
                        className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors ${
                          pattern === p ? activeColor : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {PATTERN_LABEL[p]}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleNatureClick('plus')}
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border text-[11px] font-bold transition-colors ${
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
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border text-[11px] font-bold transition-colors ${
                      nature === 'minus'
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-sky-300 hover:text-sky-500'
                    }`}
                    title="性格補正－"
                  >
                    －
                  </button>
                </div>

                {/* メガシンカ / もどすボタン */}
                {megaOptions.length > 0 && (
                  <div className="flex gap-1.5">
                    {megaOptions.map(({ pokemon: mega, label }) => (
                      <button
                        key={mega.name}
                        onClick={() => handleMegaSwitch(mega)}
                        className="flex-1 rounded border border-yellow-400 bg-yellow-50 py-1.5 text-[11px] font-bold text-yellow-700 transition-colors hover:bg-yellow-100 active:bg-yellow-200"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {basePokemon && (
                  <button
                    onClick={() => handleMegaSwitch(basePokemon)}
                    className="w-full rounded border border-gray-300 bg-gray-50 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    ↩ もどす
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* 空スロット */
            <div
              onClick={() => hasParty && setPickerOpen(true)}
              className={`flex items-center justify-center rounded-lg py-3 transition-opacity ${emptyBg} ${hasParty ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
            >
              <span className="text-lg opacity-40">＋</span>
              <span className={`ml-1 text-[10px] font-medium opacity-60 ${labelColor}`}>
                {hasParty ? '選ぶ' : 'パーティ先に'}
              </span>
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
