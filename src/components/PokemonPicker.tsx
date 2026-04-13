"use client";

import Image from "next/image";
import { CHAMPIONS_ROSTER, ChampionsPokemon } from "@/data/championsRoster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (p: ChampionsPokemon) => void;
  /** 既に選択済みのポケモン名（ハイライト表示用） */
  selectedName?: string;
}

export default function PokemonPicker({ open, onOpenChange, onSelect, selectedName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
        {/* ヘッダー */}
        <DialogHeader className="px-5 py-4 border-b border-gray-100">
          <DialogTitle className="font-bold text-gray-800">ポケモンを選ぶ</DialogTitle>
        </DialogHeader>

        {/* ポケモングリッド */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {CHAMPIONS_ROSTER.map((p) => {
              const isSelected = p.name === selectedName;
              return (
                <button
                  key={p.name}
                  onClick={() => { onSelect(p); onOpenChange(false); }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                    "hover:bg-blue-50 hover:border-blue-300 hover:scale-105",
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <Image
                    src={p.spriteUrl}
                    alt={p.jaName}
                    width={64}
                    height={64}
                    className="[image-rendering:pixelated]"
                    unoptimized
                  />
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {p.jaName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    素早さ {p.baseSpeed}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
