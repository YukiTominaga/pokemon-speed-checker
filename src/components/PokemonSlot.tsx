"use client";

import { useState } from "react";
import Image from "next/image";
import { ChampionsPokemon } from "@/data/championsRoster";
import { PokemonInfo } from "@/lib/pokeapi";
import { calcSpeed, SpeedPattern, NatureModifier, PATTERN_LABEL } from "@/lib/speedCalc";
import PokemonPicker from "./PokemonPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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
  const cardBorder = isMine ? "border-blue-400" : "border-red-400";
  const cardBg = isMine ? "bg-blue-50" : "bg-red-50";
  const labelColor = isMine ? "text-blue-700" : "text-red-700";
  const emptyBg = isMine ? "bg-blue-100/60" : "bg-red-100/60";

  const effectiveSpeed = selected ? calcSpeed(selected.baseSpeed, pattern, nature) : null;

  const handleNatureClick = (clicked: "plus" | "minus") => {
    onNatureChange(nature === clicked ? "neutral" : clicked);
  };

  return (
    <>
      <Card className={cn("border-2", cardBorder, cardBg)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
              {label}
            </span>
            {selected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                aria-label="クリア"
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
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
              <ToggleGroup
                type="single"
                value={pattern}
                onValueChange={(v) => v && onPatternChange(v as SpeedPattern)}
                className="rounded-lg overflow-hidden border border-gray-200 gap-0"
              >
                {(["min", "max"] as SpeedPattern[]).map((p) => (
                  <ToggleGroupItem
                    key={p}
                    value={p}
                    className={cn(
                      "rounded-none px-3 py-1.5 text-xs font-semibold h-auto",
                      "data-[state=on]:text-white",
                      isMine
                        ? "data-[state=on]:bg-blue-500"
                        : "data-[state=on]:bg-red-500"
                    )}
                  >
                    {PATTERN_LABEL[p]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              {/* 性格補正 +/- ボタン */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNatureClick("plus")}
                title="性格補正＋（×1.1）"
                className={cn(
                  "w-7 h-7 p-0 text-xs font-bold",
                  nature === "plus"
                    ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-500 hover:text-white"
                    : "hover:border-orange-300 hover:text-orange-500"
                )}
              >
                ＋
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNatureClick("minus")}
                title="性格補正－（×0.9）"
                className={cn(
                  "w-7 h-7 p-0 text-xs font-bold",
                  nature === "minus"
                    ? "bg-sky-500 text-white border-sky-500 hover:bg-sky-500 hover:text-white"
                    : "hover:border-sky-300 hover:text-sky-500"
                )}
              >
                －
              </Button>

              {/* 実数値 */}
              <span className={`ml-auto text-sm font-bold ${isMine ? "text-blue-700" : "text-red-700"}`}>
                実数値 {effectiveSpeed}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <PokemonPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedName={selected?.name}
        onSelect={handleSelect}
      />
    </>
  );
}
