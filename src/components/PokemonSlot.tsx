"use client";

import { useState } from "react";
import Image from "next/image";
import { ChampionsPokemon } from "@/data/championsRoster";
import { PokemonInfo } from "@/lib/pokeapi";
import { calcSpeed } from "@/lib/speedCalc";
import PokemonPicker from "./PokemonPicker";

interface Props {
  label: string;
  team: "mine" | "opp";
  onChange: (info: PokemonInfo | null) => void;
}

export default function PokemonSlot({ label, team, onChange }: Props) {
  const [selected, setSelected] = useState<ChampionsPokemon | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (p: ChampionsPokemon) => {
    setSelected(p);
    onChange(p as PokemonInfo);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // スロットクリック（ピッカー起動）を防ぐ
    setSelected(null);
    onChange(null);
  };

  const isMine = team === "mine";
  const border = isMine ? "border-blue-400" : "border-red-400";
  const bg = isMine ? "bg-blue-50" : "bg-red-50";
  const labelColor = isMine ? "text-blue-700" : "text-red-700";
  const badge = isMine
    ? "bg-blue-100 text-blue-700"
    : "bg-red-100 text-red-700";
  const emptyBg = isMine ? "bg-blue-100/60" : "bg-red-100/60";

  const minSpeed = selected ? calcSpeed(selected.baseSpeed, "min") : null;
  const maxSpeed = selected ? calcSpeed(selected.baseSpeed, "max") : null;

  return (
    <>
      <div
        onClick={() => setPickerOpen(true)}
        className={`border-2 rounded-2xl p-4 cursor-pointer transition-opacity hover:opacity-90 ${border} ${bg}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
            {label}
          </span>
          {selected && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-sm leading-none"
              aria-label="クリア"
            >
              ✕
            </button>
          )}
        </div>

        {selected ? (
          /* 選択済み */
          <div className="flex items-center gap-3">
            <Image
              src={selected.spriteUrl}
              alt={selected.jaName}
              width={64}
              height={64}
              className="[image-rendering:pixelated] flex-shrink-0"
              unoptimized
            />
            <div>
              <p className="font-bold text-base">{selected.jaName}</p>
              <p className="text-xs text-gray-400 mb-1">
                基礎素早さ {selected.baseSpeed}
              </p>
              <div className="flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-semibold ${badge}`}>
                  無振り {minSpeed}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${badge}`}>
                  最速 {maxSpeed}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* 未選択 */
          <div className={`flex items-center justify-center gap-2 h-16 rounded-xl ${emptyBg}`}>
            <span className="text-2xl opacity-40">＋</span>
            <span className={`text-sm font-medium opacity-60 ${labelColor}`}>
              タップして選択
            </span>
          </div>
        )}
      </div>

      {pickerOpen && (
        <PokemonPicker
          selectedName={selected?.name}
          onSelect={handleSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
