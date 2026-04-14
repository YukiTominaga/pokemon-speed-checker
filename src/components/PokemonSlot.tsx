'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChampionsPokemon } from '@/data/championsRoster';
import { calcSpeed, SpeedPattern, NatureModifier, PATTERN_LABEL } from '@/lib/speedCalc';
import PokemonPicker from './PokemonPicker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  label: string;
  team: 'mine' | 'opp';
  selected: ChampionsPokemon | null;
  pattern: SpeedPattern;
  nature: NatureModifier;
  onPatternChange: (p: SpeedPattern) => void;
  onNatureChange: (n: NatureModifier) => void;
  onChange: (p: ChampionsPokemon | null) => void;
}

export default function PokemonSlot({
  label,
  team,
  selected,
  pattern,
  nature,
  onPatternChange,
  onNatureChange,
  onChange,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (p: ChampionsPokemon) => {
    onChange(p);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const isMine = team === 'mine';
  const border = isMine ? 'border-blue-400' : 'border-red-400';
  const bg = isMine ? 'bg-blue-50' : 'bg-red-50';
  const labelColor = isMine ? 'text-blue-700' : 'text-red-700';
  const emptyBg = isMine ? 'bg-blue-100/60' : 'bg-red-100/60';

  const effectiveSpeed = selected ? calcSpeed(selected.baseSpeed, pattern, nature) : null;

  const handleNatureClick = (clicked: 'plus' | 'minus') => {
    onNatureChange(nature === clicked ? 'neutral' : clicked);
  };

  return (
    <>
      <Card className={`border-2 ${border} ${bg}`}>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="outline" className={`uppercase ${labelColor} border-current`}>
              {label}
            </Badge>
            {selected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                aria-label="クリア"
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
                  className="flex-shrink-0 [image-rendering:pixelated]"
                  unoptimized
                />
                <div>
                  <p className="text-base font-bold">{selected.jaName}</p>
                  <p className="text-xs text-gray-400">基礎素早さ {selected.baseSpeed}</p>
                </div>
              </div>
            ) : (
              <div className={`flex h-16 items-center justify-center gap-2 rounded-xl ${emptyBg}`}>
                <span className="text-2xl opacity-40">＋</span>
                <span className={`text-sm font-medium opacity-60 ${labelColor}`}>
                  タップして選択
                </span>
              </div>
            )}
          </div>

          {/* 努力値・性格補正トグル＋実数値（選択後に表示） */}
          {selected && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* 無振り / 全振り トグル */}
              <div className="flex overflow-hidden rounded-lg border border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPatternChange('min')}
                  className={`h-8 rounded-none px-4 text-xs font-semibold ${
                    pattern === 'min'
                      ? isMine
                        ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white'
                        : 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {PATTERN_LABEL['min']}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPatternChange('max')}
                  className={`h-8 rounded-none border-l px-4 text-xs font-semibold ${
                    pattern === 'max'
                      ? isMine
                        ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white'
                        : 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {PATTERN_LABEL['max']}
                </Button>
              </div>

              {/* 性格補正 +/- ボタン */}
              <Button
                variant={nature === 'plus' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleNatureClick('plus')}
                className={`h-7 w-7 p-0 text-xs font-bold ${
                  nature === 'plus'
                    ? 'border-orange-500 bg-orange-500 hover:bg-orange-600'
                    : 'hover:border-orange-300 hover:text-orange-500'
                }`}
                title="性格補正＋（×1.1）"
              >
                ＋
              </Button>
              <Button
                variant={nature === 'minus' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleNatureClick('minus')}
                className={`h-7 w-7 p-0 text-xs font-bold ${
                  nature === 'minus'
                    ? 'border-sky-500 bg-sky-500 hover:bg-sky-600'
                    : 'hover:border-sky-300 hover:text-sky-500'
                }`}
                title="性格補正－（×0.9）"
              >
                －
              </Button>

              {/* 実数値 */}
              <span
                className={`ml-auto text-sm font-bold ${isMine ? 'text-blue-700' : 'text-red-700'}`}
              >
                実数値 {effectiveSpeed}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

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
