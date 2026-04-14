'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChampionsPokemon } from '@/data/championsRoster';
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

  return (
    <>
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
            <span className="w-full text-center text-[11px] font-medium leading-tight text-gray-700 line-clamp-2">
              {selected.jaName}
            </span>
            {/* ✕ ボタン */}
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
          <div className={`flex h-24 flex-col items-center justify-center gap-1 rounded-[10px] ${emptyBg}`}>
            <span className={`text-2xl leading-none ${emptyText} opacity-50`}>＋</span>
          </div>
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
