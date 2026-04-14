'use client';

import Image from 'next/image';
import { CHAMPIONS_ROSTER, ChampionsPokemon } from '@/data/championsRoster';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  onSelect: (p: ChampionsPokemon) => void;
  onClose: () => void;
  /** 既に選択済みのポケモン名（ハイライト表示用） */
  selectedName?: string;
}

export default function PokemonPicker({ onSelect, onClose, selectedName }: Props) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>ポケモンを選ぶ</DialogTitle>
        </DialogHeader>

        {/* ポケモングリッド */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {CHAMPIONS_ROSTER.map((p) => {
              const isSelected = p.name === selectedName;
              return (
                <Button
                  key={p.name}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className={`flex h-auto flex-col items-center gap-1 p-2 transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-50 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-gray-200 bg-white'
                  } `}
                >
                  <Image
                    src={p.spriteUrl}
                    alt={p.jaName}
                    width={64}
                    height={64}
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
