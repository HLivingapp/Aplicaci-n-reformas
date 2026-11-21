/**
 * Ilustraciones de la portada (vectoriales, sin fotos reales: el repositorio es público).
 * Salón reformado y la misma estancia antes de la reforma, con la misma composición.
 */
export function SalonReformado({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label="Ilustración de un salón reformado con suelo de madera, gran ventanal y luz cálida">
      <defs>
        <linearGradient id="sr-pared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6efe6" /><stop offset="1" stopColor="#ece2d4" /></linearGradient>
        <linearGradient id="sr-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c99a6b" /><stop offset="1" stopColor="#a87648" /></linearGradient>
        <linearGradient id="sr-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe3e6" /><stop offset="1" stopColor="#f3e3c4" /></linearGradient>
        <radialGradient id="sr-luz" cx="0.5" cy="0" r="0.8"><stop offset="0" stopColor="#fff5d6" stopOpacity="0.9" /><stop offset="1" stopColor="#fff5d6" stopOpacity="0" /></radialGradient>
        <linearGradient id="sr-sofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6f6a" /><stop offset="1" stopColor="#2c524e" /></linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#sr-pared)" />
      {/* Falso techo con focos */}
      <rect width="640" height="34" fill="#faf6f0" />
      {[110, 250, 390, 530].map((x) => <circle key={x} cx={x} cy="24" r="5" fill="#fff2c2" />)}
      {/* Ventanal */}
      <rect x="380" y="70" width="210" height="250" rx="4" fill="#3b3b3b" />
      <rect x="388" y="78" width="94" height="234" fill="url(#sr-cielo)" />
      <rect x="488" y="78" width="94" height="234" fill="url(#sr-cielo)" />
      <path d="M388 250 Q430 220 482 240 L482 312 L388 312Z" fill="#9cc7a4" opacity="0.7" />
      <path d="M488 245 Q530 215 582 235 L582 312 L488 312Z" fill="#8bbb95" opacity="0.7" />
      <rect x="388" y="78" width="194" height="234" fill="url(#sr-luz)" />
      {/* Cuadro */}
      <rect x="120" y="110" width="150" height="96" rx="3" fill="#fff" stroke="#d6c6b0" strokeWidth="6" />
      <path d="M135 190 L175 150 L205 175 L230 155 L255 190Z" fill="#e2a46d" />
      <circle cx="235" cy="135" r="12" fill="#f2c879" />
      {/* Lámpara colgante */}
      <line x1="300" y1="34" x2="300" y2="118" stroke="#3b3b3b" strokeWidth="2" />
      <path d="M272 140 Q300 104 328 140Z" fill="#1f2937" />
      <ellipse cx="300" cy="146" rx="70" ry="22" fill="#fff5d6" opacity="0.35" />
      {/* Suelo de tarima */}
      <path d="M0 330 L640 330 L640 480 L0 480Z" fill="url(#sr-suelo)" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 80 - 40} y1="480" x2={i * 72 + 10} y2="330" stroke="#9a6a3f" strokeOpacity="0.35" strokeWidth="2" />)}
      <rect x="0" y="326" width="640" height="6" fill="#fff" />
      {/* Alfombra */}
      <ellipse cx="250" cy="420" rx="190" ry="40" fill="#e8dccb" />
      {/* Sofá */}
      <rect x="90" y="300" width="300" height="80" rx="22" fill="url(#sr-sofa)" />
      <rect x="80" y="270" width="320" height="56" rx="24" fill="#3f6f6a" />
      <rect x="120" y="262" width="80" height="50" rx="14" fill="#e9b872" />
      <rect x="270" y="262" width="80" height="50" rx="14" fill="#f3ede4" />
      <rect x="100" y="378" width="10" height="20" fill="#2d2d2d" />
      <rect x="370" y="378" width="10" height="20" fill="#2d2d2d" />
      {/* Mesa baja */}
      <ellipse cx="250" cy="425" rx="70" ry="14" fill="#7a5233" />
      <rect x="240" y="425" width="20" height="26" fill="#5c3b22" />
      <circle cx="232" cy="414" r="8" fill="#f3ede4" />
      {/* Planta */}
      <rect x="540" y="372" width="54" height="56" rx="8" fill="#e6d3bd" />
      <path d="M567 372 C540 330 520 320 525 290 C550 300 560 330 567 372Z" fill="#4b8a5a" />
      <path d="M567 372 C580 320 600 300 615 290 C618 320 595 350 567 372Z" fill="#5fa06c" />
      <path d="M567 372 C565 320 560 290 570 260 C585 290 580 330 567 372Z" fill="#3f7b4e" />
    </svg>
  );
}

export function SalonAntes({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label="Ilustración de la misma estancia antes de la reforma: terrazo, pared desconchada y ventana antigua">
      <rect width="640" height="480" fill="#d9d2b6" />
      {/* Gotelé */}
      {Array.from({ length: 140 }, (_, i) => <circle key={i} cx={(i * 47) % 640} cy={40 + ((i * 29) % 280)} r="1.6" fill="#bfb796" />)}
      {/* Fluorescente */}
      <rect x="250" y="16" width="120" height="10" rx="3" fill="#f5f5f5" stroke="#bdbdbd" />
      {/* Ventana antigua */}
      <rect x="380" y="90" width="210" height="200" fill="#8a6b4a" />
      <rect x="392" y="102" width="88" height="176" fill="#b9c4c6" />
      <rect x="490" y="102" width="88" height="176" fill="#b9c4c6" />
      <rect x="380" y="90" width="210" height="50" fill="#a89a7a" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1="380" y1={96 + i * 8} x2="590" y2={96 + i * 8} stroke="#8c7f62" />)}
      {/* Mancha de humedad y grieta */}
      <path d="M60 60 C90 50 130 70 120 100 C110 130 70 120 60 100Z" fill="#a99f7c" opacity="0.6" />
      <path d="M300 60 L310 90 L298 120 L312 160" stroke="#8f8668" strokeWidth="2" fill="none" />
      {/* Enchufe antiguo y cable */}
      <rect x="40" y="290" width="18" height="18" rx="3" fill="#efe9d8" stroke="#9c9478" />
      <path d="M49 308 C60 330 120 320 140 300" stroke="#444" strokeWidth="2" fill="none" />
      {/* Terrazo */}
      <path d="M0 330 L640 330 L640 480 L0 480Z" fill="#c2b8a3" />
      {Array.from({ length: 220 }, (_, i) => <circle key={i} cx={(i * 37) % 640} cy={335 + ((i * 53) % 140)} r={1 + (i % 3)} fill={["#8f8571", "#e8e1d0", "#a1937a"][i % 3]} />)}
      <rect x="0" y="322" width="640" height="10" fill="#9b8f72" />
      {/* Mueble viejo */}
      <rect x="110" y="230" width="230" height="110" fill="#7a5a3a" />
      <rect x="120" y="240" width="100" height="90" fill="#6b4e32" />
      <rect x="230" y="240" width="100" height="90" fill="#6b4e32" />
      <circle cx="212" cy="285" r="3" fill="#c9b27a" />
      <circle cx="238" cy="285" r="3" fill="#c9b27a" />
      <rect x="150" y="200" width="60" height="30" fill="#5d5d5d" />
    </svg>
  );
}
