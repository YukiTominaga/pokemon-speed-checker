"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  formatEnName,
  getAllPokemon,
  getPokemonInfo,
  PokemonInfo,
  PokemonListItem,
} from "@/lib/pokeapi";
import { calcSpeed } from "@/lib/speedCalc";

interface Props {
  label: string;
  team: "mine" | "opp";
  onChange: (info: PokemonInfo | null) => void;
}

export default function PokemonSlot({ label, team, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [allList, setAllList] = useState<PokemonListItem[]>([]);
  const [suggestions, setSuggestions] = useState<PokemonListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PokemonInfo | null>(null);
  const [fetching, setFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load full Pokémon list once
  useEffect(() => {
    getAllPokemon().then(setAllList);
  }, []);

  // Filter suggestions on query change
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase().replace(/\s+/g, "-");
    const hits = allList.filter((p) => p.name.includes(q)).slice(0, 10);
    setSuggestions(hits);
    setOpen(hits.length > 0);
  }, [query, allList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (item: PokemonListItem) => {
    setQuery(formatEnName(item.name));
    setOpen(false);
    setFetching(true);
    try {
      const info = await getPokemonInfo(item.name);
      setSelected(info);
      onChange(info);
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    onChange(null);
  };

  const isMine = team === "mine";
  const border = isMine ? "border-blue-400" : "border-red-400";
  const bg = isMine ? "bg-blue-50" : "bg-red-50";
  const labelColor = isMine ? "text-blue-700" : "text-red-700";
  const badge = isMine
    ? "bg-blue-100 text-blue-700"
    : "bg-red-100 text-red-700";

  const minSpeed = selected ? calcSpeed(selected.baseSpeed, "min") : null;
  const maxSpeed = selected ? calcSpeed(selected.baseSpeed, "max") : null;

  return (
    <div className={`border-2 rounded-2xl p-4 ${border} ${bg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>
          {label}
        </span>
        {selected && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 text-sm leading-none"
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="ポケモン名（英語）を入力..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {open && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {suggestions.map((p) => (
              <li
                key={p.name}
                onMouseDown={() => handleSelect(p)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {formatEnName(p.name)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading */}
      {fetching && (
        <p className="text-center text-gray-400 text-xs mt-4 animate-pulse">
          読み込み中...
        </p>
      )}

      {/* Selected Pokémon */}
      {selected && !fetching && (
        <div className="mt-3 flex items-center gap-3">
          {selected.spriteUrl ? (
            <Image
              src={selected.spriteUrl}
              alt={selected.jaName}
              width={64}
              height={64}
              className="[image-rendering:pixelated]"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
          )}
          <div>
            <p className="font-bold text-base">{selected.jaName}</p>
            <p className="text-xs text-gray-400 mb-1">
              基礎素早さ {selected.baseSpeed}
            </p>
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-semibold ${badge}`}>
                無振り {minSpeed}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${badge}`}>
                最速 {maxSpeed}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
