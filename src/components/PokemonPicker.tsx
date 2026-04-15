'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim();
  const filtered = q
    ? CHAMPIONS_ROSTER.filter(
        (p) =>
          p.jaName.includes(q) ||
          p.name.toLowerCase().includes(q.toLowerCase())
      )
    : CHAMPIONS_ROSTER;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>ポケモンを選ぶ</DialogTitle>
        </DialogHeader>

        {/* 検索input */}
        <div className="border-b px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前で検索（例: リザードン、charizard）"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ポケモングリッド */}
        <div className="overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              「{q}」に一致するポケモンが見つかりません
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((p) => {
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
