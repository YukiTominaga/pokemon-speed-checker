"use client";

import { useState } from "react";
import PokemonSlot from "@/components/PokemonSlot";
import SpeedRanking from "@/components/SpeedRanking";
import { PokemonInfo } from "@/lib/pokeapi";
import { SpeedPattern, NatureModifier } from "@/lib/speedCalc";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [mine, setMine] = useState<(PokemonInfo | null)[]>([null, null]);
  const [opp, setOpp] = useState<(PokemonInfo | null)[]>([null, null]);
  const [myPatterns, setMyPatterns] = useState<SpeedPattern[]>(["min", "min"]);
  const [oppPatterns, setOppPatterns] = useState<SpeedPattern[]>(["min", "min"]);
  const [myNatures, setMyNatures] = useState<NatureModifier[]>(["neutral", "neutral"]);
  const [oppNatures, setOppNatures] = useState<NatureModifier[]>(["neutral", "neutral"]);

  // フィールド状態
  const [trickroom, setTrickroom] = useState(false);
  const [myTailwind, setMyTailwind] = useState(false);
  const [oppTailwind, setOppTailwind] = useState(false);

  const updateMine = (i: number) => (info: PokemonInfo | null) => {
    setMine((prev) => { const n = [...prev]; n[i] = info; return n; });
  };
  const updateOpp = (i: number) => (info: PokemonInfo | null) => {
    setOpp((prev) => { const n = [...prev]; n[i] = info; return n; });
  };
  const updateMyPattern = (i: number) => (p: SpeedPattern) => {
    setMyPatterns((prev) => { const n = [...prev]; n[i] = p; return n; });
  };
  const updateOppPattern = (i: number) => (p: SpeedPattern) => {
    setOppPatterns((prev) => { const n = [...prev]; n[i] = p; return n; });
  };
  const updateMyNature = (i: number) => (nat: NatureModifier) => {
    setMyNatures((prev) => { const n = [...prev]; n[i] = nat; return n; });
  };
  const updateOppNature = (i: number) => (nat: NatureModifier) => {
    setOppNatures((prev) => { const n = [...prev]; n[i] = nat; return n; });
  };

  const hasAny = mine.some(Boolean) || opp.some(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ヘッダー */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            ポケモン素早さチェッカー
          </h1>
          <p className="text-sm text-slate-500">
            ダブルバトル向け ｜ Lv.50・個体値31固定
          </p>
        </header>

        {/* ポケモン選択グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-blue-700 text-center uppercase tracking-wide">
              自分のポケモン
            </h2>
            {[0, 1].map((i) => (
              <PokemonSlot
                key={`mine-${i}`}
                label={`ポケモン ${i + 1}`}
                team="mine"
                pattern={myPatterns[i]}
                nature={myNatures[i]}
                onPatternChange={updateMyPattern(i)}
                onNatureChange={updateMyNature(i)}
                onChange={updateMine(i)}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-red-700 text-center uppercase tracking-wide">
              相手のポケモン
            </h2>
            {[0, 1].map((i) => (
              <PokemonSlot
                key={`opp-${i}`}
                label={`ポケモン ${i + 1}`}
                team="opp"
                pattern={oppPatterns[i]}
                nature={oppNatures[i]}
                onPatternChange={updateOppPattern(i)}
                onNatureChange={updateOppNature(i)}
                onChange={updateOpp(i)}
              />
            ))}
          </div>
        </div>

        {/* フィールド状態 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-700">フィールド状態</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {/* トリックルーム */}
              <Toggle
                variant="outline"
                pressed={trickroom}
                onPressedChange={setTrickroom}
                className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-xl text-sm font-semibold data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=on]:border-purple-600"
              >
                <span className="text-base">🔮</span> トリックルーム
              </Toggle>

              {/* 自分の追い風 */}
              <Toggle
                variant="outline"
                pressed={myTailwind}
                onPressedChange={setMyTailwind}
                className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-xl text-sm font-semibold data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=on]:border-purple-600"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    myTailwind ? "bg-white" : "bg-blue-400"
                  }`}
                />
                自分の追い風
              </Toggle>

              {/* 相手の追い風 */}
              <Toggle
                variant="outline"
                pressed={oppTailwind}
                onPressedChange={setOppTailwind}
                className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-xl text-sm font-semibold data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=on]:border-purple-600"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    oppTailwind ? "bg-white" : "bg-red-400"
                  }`}
                />
                相手の追い風
              </Toggle>
            </div>
          </CardContent>
        </Card>

        {/* 結果 */}
        {hasAny ? (
          <SpeedRanking
            myPokemon={mine}
            oppPokemon={opp}
            myPatterns={myPatterns}
            oppPatterns={oppPatterns}
            myNatures={myNatures}
            oppNatures={oppNatures}
            trickroom={trickroom}
            myTailwind={myTailwind}
            oppTailwind={oppTailwind}
          />
        ) : (
          <p className="text-center text-slate-400 text-sm">
            ポケモンを1体以上選択すると結果が表示されます
          </p>
        )}
      </div>
    </main>
  );
}
