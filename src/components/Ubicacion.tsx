"use client";

import { useState } from "react";

interface Props {
  lat?: number;
  lng?: number;
  direccionTexto: string;
}

/** Parcela del Catastro sobre el mapa + enlaces a Google Street View y Maps. */
export function Ubicacion({ lat, lng, direccionTexto }: Props) {
  const [sinImagen, setSinImagen] = useState(false);
  const hayCoords = lat != null && lng != null;
  const d = 0.0012;
  const bbox = hayCoords ? [lng - d * 1.5, lat - d, lng + d * 1.5, lat + d].join(",") : "";
  const wms = hayCoords
    ? `https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=Catastro&STYLES=&SRS=EPSG:4326&BBOX=${bbox}&WIDTH=600&HEIGHT=400&FORMAT=image/png&TRANSPARENT=FALSE`
    : "";
  const streetView = hayCoords
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionTexto)}`;
  const mapa = hayCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionTexto)}`;

  return (
    <div>
      {hayCoords && !sinImagen && (
        <div className="relative mb-3 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wms} alt="Parcela en la cartografía del Catastro" className="h-auto w-full" onError={() => setSinImagen(true)} loading="lazy" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-2xl drop-shadow">📍</span>
          <span className="absolute bottom-1 right-2 text-[10px] text-stone-600">© Dirección General del Catastro</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={streetView} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50">
          🚶 Ver fachada en Street View
        </a>
        <a href={mapa} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50">
          🗺️ Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}
