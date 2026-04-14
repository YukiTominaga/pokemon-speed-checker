/**
 * PokéAPI utilities with localStorage caching.
 * - Pokémon list: cached for 7 days
 * - Individual Pokémon data: cached indefinitely (stats don't change)
 */

const API = 'https://pokeapi.co/api/v2';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonInfo {
  id: number;
  name: string; // English (hyphenated lowercase)
  jaName: string; // Japanese (カタカナ)
  baseSpeed: number;
  spriteUrl: string | null;
}

/** Format "flutter-mane" → "Flutter Mane" for display fallback */
export function formatEnName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── List of all Pokémon ──────────────────────────────────────────────────────

const LIST_KEY = 'pkmn_list_v1';
const LIST_TTL = 7 * 24 * 60 * 60 * 1000;

let listCache: PokemonListItem[] | null = null;

export async function getAllPokemon(): Promise<PokemonListItem[]> {
  if (listCache) return listCache;

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LIST_KEY);
    if (raw) {
      const { data, ts } = JSON.parse(raw) as { data: PokemonListItem[]; ts: number };
      if (Date.now() - ts < LIST_TTL) {
        listCache = data;
        return data;
      }
    }
  }

  const res = await fetch(`${API}/pokemon?limit=1025`);
  const json = await res.json();
  const data = json.results as PokemonListItem[];
  listCache = data;

  if (typeof window !== 'undefined') {
    localStorage.setItem(LIST_KEY, JSON.stringify({ data, ts: Date.now() }));
  }
  return data;
}

// ── Individual Pokémon data ──────────────────────────────────────────────────

const infoCache: Record<string, PokemonInfo> = {};

export async function getPokemonInfo(name: string): Promise<PokemonInfo> {
  if (infoCache[name]) return infoCache[name];

  const storageKey = `pkmn_info_${name}`;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const info = JSON.parse(raw) as PokemonInfo;
      infoCache[name] = info;
      return info;
    }
  }

  const [pkmRes, speciesRes] = await Promise.all([
    fetch(`${API}/pokemon/${name}`),
    // species URL is safe to derive; forms share species with base forme
    fetch(`${API}/pokemon/${name}`)
      .then((r) => r.json())
      .then((p) => fetch(p.species.url)),
  ]);

  const pkm = await pkmRes.json();
  const species = await speciesRes.json();

  const jaEntry = (species.names as { language: { name: string }; name: string }[]).find(
    (n) => n.language.name === 'ja-Hrkt' || n.language.name === 'ja'
  );

  const baseSpeed = (pkm.stats as { stat: { name: string }; base_stat: number }[]).find(
    (s) => s.stat.name === 'speed'
  )!.base_stat;

  const info: PokemonInfo = {
    id: pkm.id,
    name: pkm.name,
    jaName: jaEntry?.name ?? formatEnName(pkm.name),
    baseSpeed,
    spriteUrl: pkm.sprites?.front_default ?? null,
  };

  infoCache[name] = info;
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(info));
  }
  return info;
}
