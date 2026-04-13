"use client";

import { useState } from "react";
import Image from "next/image";
import { ChampionsPokemon } from "@/data/championsRoster";
import { PokemonInfo } from "@/lib/pokeapi";
import { calcSpeed, SpeedPattern, NatureModifier, PATTERN_LABEL } from "@/lib/speedCalc";
import PokemonPicker from "./PokemonPicker";

interface Props {
  label: string;
  team: "mine" | "opp";
  pattern: SpeedPattern;
  nature: NatureModifier;
  onPatternChange: (p: SpeedPattern) => void;
  onNatureChange: (n: NatureModifier) => void;
  onChange: (info: PokemonInfo | null) => void;
}

export default function PokemonSlot({
  label,
  team,
  pattern,
  nature,
  onPatternChange,
  onNatureChange,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<ChampionsPokemon | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (p: ChampionsPokemon) => {
    setSelected(p);
    onChange(p as PokemonInfo);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange(null);
  };

  const isMine = team === "mine";
  const border = isMine ? "border-blue-400" : "border-red-400";
  const bg = isMine ? "bg-blue-50" : "bg-red-50";
  const labelColor = isMine ? "text-blue-700" : "text-red-700";
  const emptyBg = isMine ? "bg-blue-100/60" : "bg-red-100/60";
  const activeEv = isMine ? "bg-blue-500 text-white" : "bg-red-500 text-white";

  const effectiveSpeed = selected ? calcSpeed(selected.baseSpeed, pattern, nature) : null;

  const handleNatureClick = (clicked: "plus" | "minus") => {
    onNatureChange(nature === clicked ? "neutral" : clicked);
  };

  return (
    <>
      <div className={`border-2 rounded-2xl p-4 ${border} ${bg}`}>
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

        {/* ポケモン選択エリア */}
        <div
          onClick={() => setPickerOpen(true)}
          className="cursor-pointer transition-opacity hover:opacity-90"
        >
          {selected ? (
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
                <p className="text-xs text-gray-400">基礎素早さ {selected.baseSpeed}</p>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-2 h-16 rounded-xl ${emptyBg}`}>
              <span className="text-2xl opacity-40">＋</span>
              <span className={`text-sm font-medium opacity-60 ${labelColor}`}>
                タップして選択
              </span>
            </div>
          )}
        </div>

        {/* 努力値・性格補正トグル＋実数値（選択後に表示） */}
        {selected && (
          <div className="mt-3 flex items-center gap-2">
            {/* 無振り / 全振り トグル */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
              {(["min", "max"] as SpeedPattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onPatternChange(p)}
                  className={`px-3 py-1.5 transition-colors ${
                    pattern === p ? activeEv : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {PATTERN_LABEL[p]}
                </button>
              ))}
            </div>

            {/* 性格補正 +/- ボタン */}
            <button
              onClick={() => handleNatureClick("plus")}
              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                nature === "plus"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"
              }`}
              title="性格補正＋（×1.1）"
            >
              ＋
            </button>
            <button
              onClick={() => handleNatureClick("minus")}
              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                nature === "minus"
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-gray-500 border-gray-200 hover:border-sky-300 hover:text-sky-500"
              }`}
              title="性格補正－（×0.9）"
            >
              －
            </button>

            {/* 実数値 */}
            <span className={`ml-auto text-sm font-bold ${isMine ? "text-blue-700" : "text-red-700"}`}>
              実数値 {effectiveSpeed}
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
