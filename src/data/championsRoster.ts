/**
 * Pokémon Champions 使用可能ポケモン静的データ
 * ※ 現在は仮の4体。順次拡充予定。
 *
 * baseSpeed: 通常フォームの種族値（メガシンカ前）
 * spriteUrl: PokéAPI スプライト
 */

export interface ChampionsPokemon {
  id: number;
  name: string;      // PokéAPI スラッグ（スプライトURL生成用）
  jaName: string;    // 日本語名（検索・表示用）
  baseSpeed: number;
  spriteUrl: string;
}

const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const CHAMPIONS_ROSTER: ChampionsPokemon[] = [
  {
    id: 6,
    name: "charizard",
    jaName: "リザードン",
    baseSpeed: 100,
    spriteUrl: SPRITE(6),
  },
  {
    id: 903,
    name: "sneasler",
    jaName: "オオニューラ",
    baseSpeed: 120,
    spriteUrl: SPRITE(903),
  },
  {
    id: 727,
    name: "incineroar",
    jaName: "ガオガエン",
    baseSpeed: 60,
    spriteUrl: SPRITE(727),
  },
  {
    id: 670,
    name: "floette-eternal",
    jaName: "メガフラエッテ",
    baseSpeed: 92,
    spriteUrl: SPRITE(670),
  },
];
