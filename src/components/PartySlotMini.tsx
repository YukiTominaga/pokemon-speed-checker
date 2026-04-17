'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChampionsPokemon, CHAMPIONS_ROSTER } from '@/data/championsRoster';
import { MEGA_MAP, MEGA_BASE_MAP } from '@/data/megaEvolutions';
import PokemonPicker from './PokemonPicker';

interface Props {
  team: 'mine' | 'opp';
  selected: ChampionsPokemon | null;
  onChange: (p: ChampionsPokemon | null) => void;
}

export default function PartySlotMini({ team, selected, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const isMine = team === 'mine';
  const border = isMine ? 'border-blue-300' : 'border-red-300';
  const emptyBg = isMine ? 'bg-blue-50' : 'bg-red-50';
  const emptyText = isMine ? 'text-blue-400' : 'text-red-400';

  // メガ進化オプション（ロスター内に存在するもの）
  const megaOptions = selected
    ? (MEGA_MAP[selected.name] ?? []).flatMap(({ name, label }) => {
        const pokemon = CHAMPIONS_ROSTER.find((p) => p.name === name);
        return pokemon ? [{ pokemon, label }] : [];
      })
    : [];

  // もとにもどすボタン（メガフォーム選択時）
  const baseName = selected ? MEGA_BASE_MAP[selected.name] : undefined;
  const basePokemon = baseName ? (CHAMPIONS_ROSTER.find((p) => p.name === baseName) ?? null) : null;

  return (
    <>
      <div className="flex flex-col gap-1">
        {/* スロット本体 */}
        <div
          onClick={() => setPickerOpen(true)}
          className={`relative cursor-pointer rounded-xl border-2 ${border} transition-all hover:scale-105 hover:shadow-sm active:scale-95`}
        >
          {selected ? (
            <div className="flex flex-col items-center gap-0.5 px-1 py-2">
              <Image
                src={selected.spriteUrl}
                alt={selected.jaName}
                width={56}
                height={56}
                className="[image-rendering:pixelated]"
                unoptimized
              />
              <span className="line-clamp-2 w-full text-center text-[11px] leading-tight font-medium text-gray-700">
                {selected.jaName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500 hover:bg-gray-300"
                aria-label="クリア"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className={`flex h-24 flex-col items-center justify-center gap-1 rounded-[10px] ${emptyBg}`}
            >
              <span className={`text-2xl leading-none ${emptyText} opacity-50`}>＋</span>
            </div>
          )}
        </div>

        {/* メガシンカボタン */}
        {megaOptions.length > 0 && (
          <div className="flex gap-1">
            {megaOptions.map(({ pokemon, label }) => (
              <button
                key={pokemon.name}
                onClick={() => onChange(pokemon)}
                className="flex-1 rounded-lg border border-yellow-400 bg-yellow-50 py-1 text-[10px] font-bold text-yellow-700 transition-colors hover:bg-yellow-100 active:bg-yellow-200"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* もとにもどすボタン */}
        {basePokemon && (
          <button
            onClick={() => onChange(basePokemon)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-1 text-[10px] font-bold text-gray-600 transition-colors hover:bg-gray-100"
          >
            ↩ もどす
          </button>
        )}
      </div>

      {pickerOpen && (
        <PokemonPicker
          selectedName={selected?.name}
          onSelect={(p) => onChange(p)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
