"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CHAMPIONS_ROSTER, ChampionsPokemon } from "@/data/championsRoster";

interface Props {
  onSelect: (p: ChampionsPokemon) => void;
  onClose: () => void;
  /** 既に選択済みのポケモン名（ハイライト表示用） */
  selectedName?: string;
}

export default function PokemonPicker({ onSelect, onClose, selectedName }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // オーバーレイクリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Escape キーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // モーダル表示中はスクロールを抑制
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">ポケモンを選ぶ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* ポケモングリッド */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {CHAMPIONS_ROSTER.map((p) => {
              const isSelected = p.name === selectedName;
              return (
                <button
                  key={p.name}
                  onClick={() => { onSelect(p); onClose(); }}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
                    hover:bg-blue-50 hover:border-blue-300 hover:scale-105
                    ${isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 bg-white"
                    }
                  `}
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
      </div>
    </div>
  );
}
