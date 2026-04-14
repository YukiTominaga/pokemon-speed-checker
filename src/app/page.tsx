'use client';

import { useState } from 'react';
import PokemonSlot from '@/components/PokemonSlot';
import SpeedRanking from '@/components/SpeedRanking';
import { PokemonInfo } from '@/lib/pokeapi';
import { SpeedPattern, NatureModifier } from '@/lib/speedCalc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [mine, setMine] = useState<(PokemonInfo | null)[]>([null, null]);
  const [opp, setOpp] = useState<(PokemonInfo | null)[]>([null, null]);
  const [myPatterns, setMyPatterns] = useState<SpeedPattern[]>(['min', 'min']);
  const [oppPatterns, setOppPatterns] = useState<SpeedPattern[]>(['min', 'min']);
  const [myNatures, setMyNatures] = useState<NatureModifier[]>(['neutral', 'neutral']);
  const [oppNatures, setOppNatures] = useState<NatureModifier[]>(['neutral', 'neutral']);

  // フィールド状態
  const [trickRoom, setTrickRoom] = useState(false);
  const [myTailwind, setMyTailwind] = useState(false);
  const [oppTailwind, setOppTailwind] = useState(false);

  const updateMine = (i: number) => (info: PokemonInfo | null) => {
    setMine((prev) => {
      const n = [...prev];
      n[i] = info;
      return n;
    });
  };
  const updateOpp = (i: number) => (info: PokemonInfo | null) => {
    setOpp((prev) => {
      const n = [...prev];
      n[i] = info;
      return n;
    });
  };
  const updateMyPattern = (i: number) => (p: SpeedPattern) => {
    setMyPatterns((prev) => {
      const n = [...prev];
      n[i] = p;
      return n;
    });
  };
  const updateOppPattern = (i: number) => (p: SpeedPattern) => {
    setOppPatterns((prev) => {
      const n = [...prev];
      n[i] = p;
      return n;
    });
  };
  const updateMyNature = (i: number) => (nat: NatureModifier) => {
    setMyNatures((prev) => {
      const n = [...prev];
      n[i] = nat;
      return n;
    });
  };
  const updateOppNature = (i: number) => (nat: NatureModifier) => {
    setOppNatures((prev) => {
      const n = [...prev];
      n[i] = nat;
      return n;
    });
  };

  const hasAny = mine.some(Boolean) || opp.some(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* ヘッダー */}
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            ポケモン素早さチェッカー
          </h1>
          <p className="text-sm text-slate-500">ダブルバトル向け ｜ Lv.50・個体値31固定</p>
        </header>

        {/* ポケモン選択グリッド */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-center text-sm font-bold tracking-wide text-blue-700 uppercase">
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
            <h2 className="text-center text-sm font-bold tracking-wide text-red-700 uppercase">
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
            <CardTitle className="text-sm">フィールド状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {/* トリックルーム */}
              <Button
                variant={trickRoom ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTrickRoom((v) => !v)}
                className={trickRoom ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <span className="mr-1.5 text-base">🔮</span> トリックルーム
              </Button>

              {/* 自分の追い風 */}
              <Button
                variant={myTailwind ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMyTailwind((v) => !v)}
                className={myTailwind ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <span
                  className={`mr-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    myTailwind ? 'bg-white' : 'bg-blue-400'
                  }`}
                />
                自分の追い風
              </Button>

              {/* 相手の追い風 */}
              <Button
                variant={oppTailwind ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOppTailwind((v) => !v)}
                className={oppTailwind ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <span
                  className={`mr-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    oppTailwind ? 'bg-white' : 'bg-red-400'
                  }`}
                />
                相手の追い風
              </Button>
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
            trickRoom={trickRoom}
            myTailwind={myTailwind}
            oppTailwind={oppTailwind}
          />
        ) : (
          <p className="text-center text-sm text-slate-400">
            ポケモンを1体以上選択すると結果が表示されます
          </p>
        )}
      </div>
    </main>
  );
}
