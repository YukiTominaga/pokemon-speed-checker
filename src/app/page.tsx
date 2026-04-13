"use client";

import { useState } from "react";
import PokemonSlot from "@/components/PokemonSlot";
import SpeedRanking from "@/components/SpeedRanking";
import { PokemonInfo } from "@/lib/pokeapi";

export default function Home() {
  const [mine, setMine] = useState<(PokemonInfo | null)[]>([null, null]);
  const [opp, setOpp] = useState<(PokemonInfo | null)[]>([null, null]);

  const updateMine = (i: number) => (info: PokemonInfo | null) => {
    setMine((prev) => {
      const next = [...prev];
      next[i] = info;
      return next;
    });
  };

  const updateOpp = (i: number) => (info: PokemonInfo | null) => {
    setOpp((prev) => {
      const next = [...prev];
      next[i] = info;
      return next;
    });
  };

  const hasAny = mine.some(Boolean) || opp.some(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            ポケモン素早さチェッカー
          </h1>
          <p className="text-sm text-slate-500">
            ダブルバトル向け ｜ 無振り / 最速（Lv.50・個体値31固定）
          </p>
        </header>

        {/* Input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* My team */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-blue-700 text-center uppercase tracking-wide">
              自分のポケモン
            </h2>
            {[0, 1].map((i) => (
              <PokemonSlot
                key={`mine-${i}`}
                label={`ポケモン ${i + 1}`}
                team="mine"
                onChange={updateMine(i)}
              />
            ))}
          </div>

          {/* Opponent team */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-red-700 text-center uppercase tracking-wide">
              相手のポケモン
            </h2>
            {[0, 1].map((i) => (
              <PokemonSlot
                key={`opp-${i}`}
                label={`ポケモン ${i + 1}`}
                team="opp"
                onChange={updateOpp(i)}
              />
            ))}
          </div>
        </div>

        {/* Results */}
        {hasAny && <SpeedRanking myPokemon={mine} oppPokemon={opp} />}

        {!hasAny && (
          <p className="text-center text-slate-400 text-sm">
            ポケモンを1体以上入力すると結果が表示されます
          </p>
        )}
      </div>
    </main>
  );
}
