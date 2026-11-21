"use client";

import { useState } from "react";
import { SalonAntes, SalonReformado } from "./Escenas";

/** Comparador antes / después que se arrastra. */
export function AntesDespues() {
  const [pos, setPos] = useState(55);
  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
      <SalonReformado className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <SalonAntes className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow" />
        <div className="absolute top-1/2 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-lg">⟷</div>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">Antes</span>
      <span className="absolute right-3 top-3 rounded-full bg-teal-700 px-3 py-1 text-xs font-medium text-white">Después</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Mover para comparar antes y después"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
