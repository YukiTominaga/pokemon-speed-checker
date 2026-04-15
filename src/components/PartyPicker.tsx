'use client';

import Image from 'next/image';
import { ChampionsPokemon } from '@/data/championsRoster';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  party: (ChampionsPokemon | null)[];
  /** このバトル枠が現在選んでいるパーティインデックス */
  currentIndex: number | null;
  /** 他のバトル枠が使用中のパーティインデックス（選択不可） */
  disabledIndices: number[];
  onSelect: (partyIndex: number) => void;
  onClose: () => void;
}

export default function PartyPicker({
  party,
  currentIndex,
  disabledIndices,
  onSelect,
  onClose,
}: Props) {
  const available = party.filter(Boolean);
  if (available.length === 0) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>パーティから選ぶ</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {party.map((p, i) => {
              if (!p) return null;
              const isSelected = i === currentIndex;
              const isDisabled = disabledIndices.includes(i);

              return (
                <Button
                  key={i}
                  variant={isSelected ? 'default' : 'outline'}
                  disabled={isDisabled}
                  onClick={() => {
                    onSelect(i);
                    onClose();
                  }}
                  className={`flex h-auto flex-col items-center gap-1 p-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300 hover:bg-blue-100'
                      : isDisabled
                        ? 'cursor-not-allowed opacity-40'
                        : 'border-gray-200 bg-white hover:scale-105 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Image
                    src={p.spriteUrl}
                    alt={p.jaName}
                    width={56}
                    height={56}
                    className="[image-rendering:pixelated]"
                    unoptimized
                  />
                  <span className="text-center text-xs leading-tight font-medium text-gray-700">
                    {p.jaName}
                  </span>
                  <span className="text-[10px] text-gray-400">素早さ {p.baseSpeed}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
