'use client';

import { useReducer, useState } from 'react';
import PartySlotMini from '@/components/PartySlotMini';
import BattleSlot from '@/components/BattleSlot';
import SpeedRanking from '@/components/SpeedRanking';
import { ChampionsPokemon } from '@/data/championsRoster';
import { PokemonInfo } from '@/lib/pokeapi';
import { SpeedPattern, NatureModifier } from '@/lib/speedCalc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Phase = 'party' | 'battle';

type TeamState = {
  party: (ChampionsPokemon | null)[];
  battle: (number | null)[];
};

type TeamAction =
  | { type: 'set_party_slot'; index: number; pokemon: ChampionsPokemon | null }
  | { type: 'select_battle'; slotIdx: number; partyIdx: number }
  | { type: 'clear_battle'; slotIdx: number };

function sanitizeBattle(battle: (number | null)[], party: (ChampionsPokemon | null)[]) {
  return battle.map((i) => (i !== null && party[i] === null ? null : i));
}

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'set_party_slot': {
      const party = [...state.party];
      party[action.index] = action.pokemon;
      return { party, battle: sanitizeBattle(state.battle, party) };
    }
    case 'select_battle': {
      const battle = [...state.battle];
      battle[action.slotIdx] = action.partyIdx;
      return { ...state, battle };
    }
    case 'clear_battle': {
      const battle = [...state.battle];
      battle[action.slotIdx] = null;
      return { ...state, battle };
    }
  }
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('party');

  const [my, dispatchMy] = useReducer(teamReducer, {
    party: Array(6).fill(null),
    battle: [null, null],
  } satisfies TeamState);
  const [opp, dispatchOpp] = useReducer(teamReducer, {
    party: Array(6).fill(null),
    battle: [null, null],
  } satisfies TeamState);

  // EV/性格補正（パーティ単位、6要素）
  const [myPatterns, setMyPatterns] = useState<SpeedPattern[]>(Array(6).fill('min'));
  const [oppPatterns, setOppPatterns] = useState<SpeedPattern[]>(Array(6).fill('min'));
  const [myNatures, setMyNatures] = useState<NatureModifier[]>(Array(6).fill('neutral'));
  const [oppNatures, setOppNatures] = useState<NatureModifier[]>(Array(6).fill('neutral'));

  // フィールド状態
  const [trickRoom, setTrickRoom] = useState(false);
  const [myTailwind, setMyTailwind] = useState(false);
  const [oppTailwind, setOppTailwind] = useState(false);

  // ── パーティ更新ヘルパー ───────────────────────────────────────
  const updateMyParty = (i: number) => (p: ChampionsPokemon | null) => {
    dispatchMy({ type: 'set_party_slot', index: i, pokemon: p });
  };
  const updateOppParty = (i: number) => (p: ChampionsPokemon | null) => {
    dispatchOpp({ type: 'set_party_slot', index: i, pokemon: p });
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

  // ── バトル選出更新ヘルパー ────────────────────────────────────
  const selectMyBattle = (slotIdx: number) => (partyIdx: number) => {
    dispatchMy({ type: 'select_battle', slotIdx, partyIdx });
  };
  const clearMyBattle = (slotIdx: number) => () => {
    dispatchMy({ type: 'clear_battle', slotIdx });
  };
  const selectOppBattle = (slotIdx: number) => (partyIdx: number) => {
    dispatchOpp({ type: 'select_battle', slotIdx, partyIdx });
  };
  const clearOppBattle = (slotIdx: number) => () => {
    dispatchOpp({ type: 'clear_battle', slotIdx });
  };

  // ── SpeedRanking 用データ変換 ─────────────────────────────────
  const myBattlePokemon = my.battle.map((i) =>
    i !== null ? (my.party[i] as PokemonInfo) : null
  );
  const oppBattlePokemon = opp.battle.map((i) =>
    i !== null ? (opp.party[i] as PokemonInfo) : null
  );
  const myBattlePatterns = my.battle.map((i) => (i !== null ? myPatterns[i] : ('min' as SpeedPattern)));
  const oppBattlePatterns = opp.battle.map((i) => (i !== null ? oppPatterns[i] : ('min' as SpeedPattern)));
  const myBattleNatures = my.battle.map((i) => (i !== null ? myNatures[i] : ('neutral' as NatureModifier)));
  const oppBattleNatures = opp.battle.map((i) => (i !== null ? oppNatures[i] : ('neutral' as NatureModifier)));

  const hasAnyBattle = myBattlePokemon.some(Boolean) || oppBattlePokemon.some(Boolean);
  const hasAnyParty = my.party.some(Boolean) || opp.party.some(Boolean);

  // パーティの選出カウント
  const myPartyCount = my.party.filter(Boolean).length;
  const oppPartyCount = opp.party.filter(Boolean).length;
  const myBattleCount = my.battle.filter((i) => i !== null).length;
  const oppBattleCount = opp.battle.filter((i) => i !== null).length;

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* ヘッダー */}
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            ポケモン素早さチェッカー
          </h1>
          <p className="text-sm text-slate-500">ダブルバトル向け ｜ Lv.50・個体値31固定</p>
        </header>

        {/* フェーズ切替タブ */}
        <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setPhase('party')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              phase === 'party'
                ? 'bg-slate-800 text-white'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <span>パーティ選出</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                phase === 'party'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {myPartyCount + oppPartyCount} / 12
            </span>
          </button>
          <div className="w-px bg-gray-200" />
          <button
            onClick={() => hasAnyParty && setPhase('battle')}
            disabled={!hasAnyParty}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
              phase === 'battle'
                ? 'bg-slate-800 text-white'
                : hasAnyParty
                  ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  : 'cursor-not-allowed text-gray-300'
            }`}
          >
            <span>バトル選出</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                phase === 'battle'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {myBattleCount + oppBattleCount} / 4
            </span>
          </button>
        </div>

        {/* ── Phase 1: パーティ選出 ── */}
        {phase === 'party' && (
          <>
            <div className="space-y-4">
              {/* 自分のパーティ */}
              <div>
                <h2 className="mb-2 text-center text-sm font-bold tracking-wide text-blue-700 uppercase">
                  自分のパーティ ({myPartyCount}/6)
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <PartySlotMini
                      key={`my-party-${i}`}
                      team="mine"
                      selected={my.party[i]}
                      onChange={updateMyParty(i)}
                    />
                  ))}
                </div>
              </div>

              {/* 相手のパーティ */}
              <div>
                <h2 className="mb-2 text-center text-sm font-bold tracking-wide text-red-700 uppercase">
                  相手のパーティ ({oppPartyCount}/6)
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <PartySlotMini
                      key={`opp-party-${i}`}
                      team="opp"
                      selected={opp.party[i]}
                      onChange={updateOppParty(i)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 次へボタン */}
            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={!hasAnyParty}
                onClick={() => setPhase('battle')}
                className="bg-slate-800 px-10 hover:bg-slate-700 disabled:opacity-40"
              >
                バトル選出へ →
              </Button>
            </div>
          </>
        )}

        {/* ── Phase 2: バトル選出 ── */}
        {phase === 'battle' && (
          <>
            <div className="space-y-3">
              {/* 自分のバトル: 2体を1行 */}
              <div>
                <h2 className="mb-2 text-center text-sm font-bold tracking-wide text-blue-700 uppercase">
                  自分のバトル ({myBattleCount}/2)
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((slotIdx) => {
                    const partyIdx = my.battle[slotIdx];
                    const pokemon = partyIdx !== null ? my.party[partyIdx] : null;
                    const otherIndices = my.battle
                      .filter((_, i) => i !== slotIdx)
                      .filter((i): i is number => i !== null);
                    return (
                      <BattleSlot
                        key={`my-battle-${slotIdx}`}
                        index={slotIdx}
                        team="mine"
                        pokemon={pokemon}
                        partyIndex={partyIdx}
                        pattern={partyIdx !== null ? myPatterns[partyIdx] : 'min'}
                        nature={partyIdx !== null ? myNatures[partyIdx] : 'neutral'}
                        party={my.party}
                        otherSelectedIndices={otherIndices}
                        onSelect={selectMyBattle(slotIdx)}
                        onClear={clearMyBattle(slotIdx)}
                        onPatternChange={partyIdx !== null ? updateMyPattern(partyIdx) : () => {}}
                        onNatureChange={partyIdx !== null ? updateMyNature(partyIdx) : () => {}}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 相手のバトル: 2体を1行 */}
              <div>
                <h2 className="mb-2 text-center text-sm font-bold tracking-wide text-red-700 uppercase">
                  相手のバトル ({oppBattleCount}/2)
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((slotIdx) => {
                    const partyIdx = opp.battle[slotIdx];
                    const pokemon = partyIdx !== null ? opp.party[partyIdx] : null;
                    const otherIndices = opp.battle
                      .filter((_, i) => i !== slotIdx)
                      .filter((i): i is number => i !== null);
                    return (
                      <BattleSlot
                        key={`opp-battle-${slotIdx}`}
                        index={slotIdx}
                        team="opp"
                        pokemon={pokemon}
                        partyIndex={partyIdx}
                        pattern={partyIdx !== null ? oppPatterns[partyIdx] : 'min'}
                        nature={partyIdx !== null ? oppNatures[partyIdx] : 'neutral'}
                        party={opp.party}
                        otherSelectedIndices={otherIndices}
                        onSelect={selectOppBattle(slotIdx)}
                        onClear={clearOppBattle(slotIdx)}
                        onPatternChange={partyIdx !== null ? updateOppPattern(partyIdx) : () => {}}
                        onNatureChange={partyIdx !== null ? updateOppNature(partyIdx) : () => {}}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* フィールド状態 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">フィールド状態</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={trickRoom ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrickRoom((v) => !v)}
                    className={trickRoom ? 'bg-purple-600 hover:bg-purple-700' : ''}
                  >
                    <span className="mr-1.5 text-base">🔮</span> トリックルーム
                  </Button>

                  <Button
                    variant={myTailwind ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMyTailwind((v) => !v)}
                    className={myTailwind ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <span
                      className={`mr-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        myTailwind ? 'bg-white' : 'bg-blue-400'
                      }`}
                    />
                    自分の追い風
                  </Button>

                  <Button
                    variant={oppTailwind ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOppTailwind((v) => !v)}
                    className={oppTailwind ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    <span
                      className={`mr-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        oppTailwind ? 'bg-white' : 'bg-red-400'
                      }`}
                    />
                    相手の追い風
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 結果 */}
            {hasAnyBattle ? (
              <SpeedRanking
                myPokemon={myBattlePokemon}
                oppPokemon={oppBattlePokemon}
                myPatterns={myBattlePatterns}
                oppPatterns={oppBattlePatterns}
                myNatures={myBattleNatures}
                oppNatures={oppBattleNatures}
                trickRoom={trickRoom}
                myTailwind={myTailwind}
                oppTailwind={oppTailwind}
              />
            ) : (
              <p className="text-center text-sm text-slate-400">
                バトル選出を行うと結果が表示されます
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
