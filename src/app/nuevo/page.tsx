"use client";

import { FotosCalidad } from "@/components/FotosCalidad";
import { NIVEL_DE_CALIDAD } from "@/lib/fotos-calidad";
import { RequiereRegistro } from "@/components/Registro";
import { useMiembro } from "@/lib/miembro-cliente";
import { buscarCatastro } from "@/lib/catastro/cliente";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hoy } from "@/lib/calc";
import type { Estimacion } from "@/lib/estimacion";
import { enviarProyecto, pedirEstimacion } from "@/lib/publico-cliente";
import { aplicarInvitacionPro, leerInvitacionPro, olvidarInvitacionPro, type InvitacionPro } from "@/lib/invita-pro";
import { conBaseDeDatos } from "@/lib/modo";
import { leerLocal } from "@/lib/store";
import { TEXTO_CONSENTIMIENTO } from "@/lib/publico";
import { tarifasPorDefecto } from "@/lib/tarifas";
import { PROVINCIAS, PROVINCIAS_FORALES, TIPOS_VIA } from "@/lib/catastro/provincias";
import type { ResultadoBusqueda } from "@/lib/catastro/tipos";
import {
  ACS, CALIDADES, CLIMAS, ESTANCIAS, PLAZOS, plantaANumero, RANGOS_PRESUPUESTO, reformaVacia, SUELOS, TECHOS, textoDireccion, textoPlanta, viviendaVacia,
} from "@/lib/proyecto";
import { cambiosDistribucion } from "@/lib/estimacion";
import type { Acs, Clima, DatosReforma, Direccion, Instalacion, Vivienda } from "@/lib/types";
import { VistaEstimacion } from "@/components/Estimacion";
import { DetalleReformaForm } from "@/components/DetalleReforma";
import type { DetalleReforma } from "@/lib/detalle-reforma";
import { Moodboard } from "@/components/Moodboard";
import { FasesYParecidas } from "@/components/Galeria";
import { ElegirMateriales } from "@/components/Materiales";
import { SeleccionPlegable } from "@/components/SeleccionProductos";
import { Contador, Opciones } from "@/components/Opciones";
import { PreguntaInstalacion } from "@/components/PreguntaInstalacion";
import { PlanoBase } from "@/components/PlanoBase";
import { Resumen } from "@/components/ResumenProyecto";
import { Ubicacion } from "@/components/Ubicacion";
import { Boton, Campo, inputCls, Tarjeta } from "@/components/ui";
import { avisarCambio } from "@/lib/nube";

const PASOS = ["Dirección", "Tu vivienda", "Distribución", "Estado actual", "Instalaciones", "La reforma", "Tu presupuesto"];
const BORRADOR = "app-reformas:borrador-proyecto";

interface Contacto { nombre: string; telefono: string; email: string; acepto: boolean }

function NuevoProyectoContenido() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [v, setV] = useState<Vivienda>(viviendaVacia);
  const [r, setR] = useState<DatosReforma>(() => reformaVacia());
  const [c, setC] = useState<Contacto>({ nombre: "", telefono: "", email: "", acepto: false });
  const miembro = useMiembro();
  const [busqueda, setBusqueda] = useState<ResultadoBusqueda | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [estimacion, setEstimacion] = useState<Estimacion | null>(null);
  const [recalculando, setRecalculando] = useState(false);
  const elegirMaterial = (grupo: string, opcion: string) => {
    const nr = { ...r, materiales: { ...r.materiales, [grupo]: opcion } };
    setR(nr);
    setRecalculando(true);
    pedirEstimacion(v, nr).then(setEstimacion).catch(() => undefined).finally(() => setRecalculando(false));
    if (nr.detalle) pedirEstimacion(v, { ...nr, detalle: undefined }).then((e) => setRapida(e.base)).catch(() => undefined);
  };
  const [rapida, setRapida] = useState<number | undefined>();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cambiarDetalle = (detalle: DetalleReforma) => {
    const nr = { ...r, detalle };
    setR(nr);
    setRecalculando(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      pedirEstimacion(v, nr).then(setEstimacion).catch(() => undefined).finally(() => setRecalculando(false));
    }, 400);
  };
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [invitacion, setInvitacion] = useState<InvitacionPro | null>(null);
  useEffect(() => setInvitacion(leerInvitacionPro()), []);

  // Recupera el borrador si el cliente cerró la página a medias
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BORRADOR) ?? "null");
      if (b) { setV({ ...viviendaVacia(), ...b.v }); setR({ ...reformaVacia(), ...b.r }); setC(b.c); setPaso(Math.min(b.paso ?? 0, PASOS.length - 1)); }
    } catch { /* ignorar */ }
    setCargado(true);
  }, []);
  useEffect(() => {
    if (!cargado) return;
    try { localStorage.setItem(BORRADOR, JSON.stringify({ v, r, c, paso })); avisarCambio(BORRADOR); } catch { /* ignorar */ }
  }, [v, r, c, paso, cargado]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [paso]);

  // Estimación orientativa al llegar al último paso
  useEffect(() => {
    if (paso !== PASOS.length - 1) return;
    setEstimacion(null);
    pedirEstimacion(v, r).then(setEstimacion).catch(() => setEstimacion(null));
    pedirEstimacion(v, { ...r, detalle: undefined }).then((e) => setRapida(e.base)).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  const dir = v.direccion;
  const setDir = (campos: Partial<Direccion>) => setV((x) => ({ ...x, direccion: { ...x.direccion, ...campos } }));
  const foral = PROVINCIAS_FORALES.includes(dir.provincia);

  const aplicarDetalle = (res: ResultadoBusqueda) => {
    if (res.estado !== "ok" || !res.detalle) return;
    const d = res.detalle;
    setV((x) => ({
      ...x,
      m2: d.superficie ?? x.m2,
      anoConstruccion: d.anoConstruccion ?? x.anoConstruccion,
      catastro: { referencia: d.referencia, superficie: d.superficie, anoConstruccion: d.anoConstruccion, uso: d.uso, direccionCatastro: d.direccion, lat: d.lat, lng: d.lng, consultado: hoy() },
    }));
  };

  const llamar = async (body: object) => {
    setBuscando(true);
    try {
      const j = await buscarCatastro(body);
      setBusqueda(j);
      aplicarDetalle(j);
    } catch {
      setBusqueda({ estado: "error", mensaje: "No hemos podido conectar con el Catastro" });
    } finally {
      setBuscando(false);
    }
  };

  const buscar = () => llamar({ direccion: dir });
  const elegir = (referencia: string) => llamar({ referencia, provincia: dir.provincia });

  const siguiente = () => {
    if (paso === 0 && v.planta == null) setV((x) => ({ ...x, planta: plantaANumero(dir.planta) }));
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const aniosMax = tarifasPorDefecto().aniosMaxInstalacion;
  const cambiaTabiques = cambiosDistribucion(v, r) > 0;
  const instOk = (i: Instalacion) => i.accion === "cambiar" || !cambiaTabiques || i.ano != null;
  const puedeSeguir = [
    dir.calle.trim() && dir.numero.trim() && dir.municipio.trim(),
    v.m2 != null && v.m2 > 0 && (v.tipo === "casa" || v.ascensor != null),
    true,
    r.techoActual != null && r.sueloActual != null && r.cambiarVentanas != null,
    r.climaActual != null && r.climaDeseado != null && r.acsActual != null && r.acsDeseado != null && instOk(r.fontaneria) && instOk(r.electricidad),
    r.estancias.length > 0 || r.alcance === "integral",
    c.nombre.trim() && c.acepto,
  ][paso];


  const enviar = async () => {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const token = await enviarProyecto(v, r, { nombre: c.nombre, telefono: c.telefono, email: miembro?.email ?? c.email }, c.acepto);
      try { localStorage.removeItem(BORRADOR); avisarCambio(BORRADOR); } catch { /* ignorar */ }
      // Demostración: la obra queda unida al profesional que invitó al cliente, sin reserva ni fee
      if (invitacion && !conBaseDeDatos) {
        const d = leerLocal();
        const cli = d.clientes.find((x) => x.token === token);
        const pr = cli && d.proyectos.find((x) => x.clienteId === cli.id);
        if (cli && pr) aplicarInvitacionPro(invitacion, { proyectoId: pr.id, tokenCliente: token, cliente: cli.nombre, vivienda: pr.vivienda, reforma: pr.reforma });
        olvidarInvitacionPro();
      }
      router.push(`/p/${token}?enviado=1`);
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : "No se ha podido enviar. Inténtalo de nuevo.");
      setEnviando(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-28 pt-6">
      <Link href="/" className="text-sm text-stone-500 hover:underline">← Inicio</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Tu proyecto de reforma</h1>
      <p className="text-sm text-stone-500">Cuéntanos cómo es tu casa y qué quieres hacer. Son 7 pasos cortos, unos 4 minutos. Al final verás tu presupuesto partida a partida aquí mismo, al momento.</p>
      {invitacion && (
        <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-950 ring-1 ring-violet-200">
          🤝 Te invita tu {invitacion.tipo === "reformista" ? "reformista" : "arquitecto"} {invitacion.codigo}. Al terminar, tu proyecto le llegará directamente, y con él no pagas reserva en la app.
        </p>
      )}

      <ol className="my-5 flex gap-1" aria-label="Pasos">
        {PASOS.map((p, i) => (
          <li key={p} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= paso ? "bg-teal-600" : "bg-stone-200"}`} />
            <span className={`mt-1 hidden text-[11px] sm:block ${i === paso ? "font-semibold text-teal-800" : "text-stone-400"}`}>{p}</span>
          </li>
        ))}
      </ol>

      {paso === 0 && (
        <Tarjeta>
          <h2 className="mb-1 text-lg font-semibold">¿Dónde está la vivienda?</h2>
          <p className="mb-4 text-sm text-stone-500">Con la dirección buscamos la ficha del Catastro y rellenamos los metros y el año del edificio por ti.</p>
          <div className="grid grid-cols-6 gap-3">
            <Campo etiqueta="Tipo de vía" className="col-span-2">
              <select className={inputCls} value={dir.tipoVia} onChange={(e) => setDir({ tipoVia: e.target.value })}>
                {TIPOS_VIA.map((t) => <option key={t.sigla} value={t.sigla}>{t.texto}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Nombre de la calle *" className="col-span-4">
              <input className={inputCls} value={dir.calle} placeholder="Alcalá" onChange={(e) => setDir({ calle: e.target.value })} autoComplete="address-line1" />
            </Campo>
            <Campo etiqueta="Número *" className="col-span-2">
              <input className={inputCls} value={dir.numero} inputMode="numeric" onChange={(e) => setDir({ numero: e.target.value })} />
            </Campo>
            <Campo etiqueta="Escalera" className="col-span-2">
              <input className={inputCls} value={dir.escalera} onChange={(e) => setDir({ escalera: e.target.value })} />
            </Campo>
            <Campo etiqueta="Planta" className="col-span-2">
              <input className={inputCls} value={dir.planta} placeholder="3" onChange={(e) => { setDir({ planta: e.target.value }); setV((x) => ({ ...x, planta: plantaANumero(e.target.value) })); }} />
            </Campo>
            <Campo etiqueta="Puerta" className="col-span-2">
              <input className={inputCls} value={dir.puerta} placeholder="B" onChange={(e) => setDir({ puerta: e.target.value })} />
            </Campo>
            <Campo etiqueta="Código postal" className="col-span-4">
              <input className={inputCls} value={dir.codigoPostal} inputMode="numeric" maxLength={5} onChange={(e) => setDir({ codigoPostal: e.target.value })} autoComplete="postal-code" />
            </Campo>
            <Campo etiqueta="Municipio *" className="col-span-6">
              <input className={inputCls} value={dir.municipio} onChange={(e) => setDir({ municipio: e.target.value })} />
            </Campo>
            <Campo etiqueta="Provincia" className="col-span-6">
              <select className={inputCls} value={dir.provincia} onChange={(e) => setDir({ provincia: e.target.value })}>
                {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Campo>
          </div>

          {!foral ? (
            <Boton variante="secundario" className="mt-4" onClick={buscar} disabled={buscando || !dir.calle.trim() || !dir.numero.trim()}>
              {buscando ? "Buscando en el Catastro…" : "🔎 Buscar mi vivienda en el Catastro"}
            </Boton>
          ) : (
            <p className="mt-4 text-sm text-amber-800">En esta provincia el catastro es foral: rellenarás los datos a mano en el siguiente paso.</p>
          )}

          <ResultadoCatastro res={busqueda} vivienda={v} onElegir={elegir} buscando={buscando} />
        </Tarjeta>
      )}

      {paso === 1 && (
        <Tarjeta className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">¿Qué tipo de vivienda es?</h2>
            <Opciones
              columnas={4}
              valor={v.tipo}
              onChange={(tipo) => setV({ ...v, tipo })}
              opciones={[{ valor: "piso", texto: "Piso" }, { valor: "atico", texto: "Ático" }, { valor: "bajo", texto: "Bajo" }, { valor: "casa", texto: "Casa / chalet" }]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Metros cuadrados construidos *">
              <input className={inputCls} inputMode="decimal" value={v.m2 ?? ""} onChange={(e) => setV({ ...v, m2: e.target.value ? Number(e.target.value.replace(",", ".")) || null : null })} placeholder="85" />
              <span className="mt-1 block text-xs text-stone-500">
                {v.catastro?.superficie ? "Dato del Catastro: superficie de tu vivienda sin zonas comunes del edificio. Puedes corregirlo." : "Lo encuentras en la escritura o en el recibo del IBI (sin contar zonas comunes)."}
              </span>
            </Campo>
            <Campo etiqueta="Año de construcción del edificio">
              <input className={inputCls} inputMode="numeric" value={v.anoConstruccion ?? ""} onChange={(e) => setV({ ...v, anoConstruccion: Number(e.target.value) || null })} placeholder="1975" />
              {v.catastro?.anoConstruccion && <span className="mt-1 block text-xs text-stone-500">Dato del Catastro.</span>}
            </Campo>
          </div>
          {v.tipo !== "casa" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-stone-600">¿En qué planta está?</h3>
                <div className="flex items-center gap-3">
                  <Contador valor={v.planta ?? 0} min={0} max={40} onChange={(planta) => setV({ ...v, planta })} />
                  <span className="text-sm text-stone-500">{textoPlanta(v.planta ?? 0)}</span>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-stone-600">¿El edificio tiene ascensor? *</h3>
                <Opciones valor={v.ascensor} onChange={(ascensor) => setV({ ...v, ascensor })} opciones={[{ valor: true, texto: "Sí" }, { valor: false, texto: "No" }]} />
              </div>
            </div>
          )}
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Cuántas terrazas tiene?</h3>
            <Contador
              valor={v.terrazas.length}
              max={5}
              onChange={(n) => setV({ ...v, terrazas: n > v.terrazas.length ? [...v.terrazas, "abierta"] : v.terrazas.slice(0, n) })}
            />
            <div className="mt-3 space-y-2">
              {v.terrazas.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-stone-600">Terraza {i + 1}</span>
                  <div className="flex-1">
                    <Opciones
                      valor={t}
                      onChange={(nuevo) => setV({ ...v, terrazas: v.terrazas.map((x, j) => (j === i ? nuevo : x)) })}
                      opciones={[{ valor: "abierta", texto: "Abierta" }, { valor: "cerrada", texto: "Cerrada / acristalada" }]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tarjeta>
      )}

      {paso === 2 && (
        <Tarjeta className="space-y-5">
          <h2 className="text-lg font-semibold">¿Cómo es ahora y cómo la quieres?</h2>
          {([
            ["Dormitorios", v.dormitorios, r.dormitoriosDeseados, 0, 8, (n: number) => { setV({ ...v, dormitorios: n }); if (r.dormitoriosDeseados === v.dormitorios) setR({ ...r, dormitoriosDeseados: n }); }, (n: number) => setR({ ...r, dormitoriosDeseados: n })],
            ["Baños", v.banos, r.banosDeseados, 1, 5, (n: number) => { setV({ ...v, banos: n }); if (r.banosDeseados === v.banos) setR({ ...r, banosDeseados: n }); }, (n: number) => setR({ ...r, banosDeseados: n })],
          ] as const).map(([nombre, ahora, quiero, min, max, setAhora, setQuiero]) => (
            <div key={nombre}>
              <h3 className="mb-2 text-sm font-medium text-stone-600">{nombre}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-stone-400">Ahora</div>
                  <Contador valor={ahora} min={0} max={max} onChange={setAhora} />
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">Quiero</div>
                  <Contador valor={quiero} min={min} max={max} onChange={setQuiero} />
                </div>
              </div>
            </div>
          ))}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-stone-600">La cocina la quieres…</h3>
              <Opciones valor={v.cocinaAbierta} onChange={(cocinaAbierta) => setV({ ...v, cocinaAbierta })} opciones={[{ valor: false, texto: "Independiente" }, { valor: true, texto: "Abierta al salón" }]} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-stone-600">¿Quieres cambiar la cocina de sitio?</h3>
              <Opciones valor={r.moverCocina} onChange={(moverCocina) => setR({ ...r, moverCocina })} opciones={[{ valor: false, texto: "No, en el mismo sitio" }, { valor: true, texto: "Sí, moverla" }]} />
            </div>
          </div>
          {cambiaTabiques && <p className="rounded-lg bg-sky-50 p-2 text-sm text-sky-900">Cambia la distribución: habrá que mover tabiques.</p>}
          <div>
            <h3 className="mb-2 font-semibold">Plano base de cómo quedaría</h3>
            <PlanoBase m2={v.m2} dormitorios={r.dormitoriosDeseados} banos={r.banosDeseados} cocinaAbierta={v.cocinaAbierta} terrazas={v.terrazas} />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Ubicación</h3>
            <Ubicacion lat={v.catastro?.lat} lng={v.catastro?.lng} direccionTexto={textoDireccion(dir)} />
          </div>
        </Tarjeta>
      )}

      {paso === 3 && (
        <Tarjeta className="space-y-6">
          <h2 className="text-lg font-semibold">¿Cómo está la casa ahora?</h2>
          <p className="-mt-4 text-sm text-stone-500">Esto es lo que más influye en el coste de la demolición y la albañilería.</p>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Cómo son los techos? *</h3>
            <Opciones columnas={3} valor={r.techoActual} onChange={(techoActual) => setR({ ...r, techoActual })} opciones={TECHOS.map((x) => ({ ...x }))} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Qué suelo hay ahora? *</h3>
            <Opciones columnas={4} valor={r.sueloActual} onChange={(sueloActual) => setR({ ...r, sueloActual })} opciones={SUELOS.map((x) => ({ ...x }))} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Qué suelo te gustaría?</h3>
            <Opciones
              columnas={3}
              valor={r.sueloDeseado}
              onChange={(sueloDeseado) => setR({ ...r, sueloDeseado })}
              opciones={[{ valor: "laminado", texto: "Laminado / tarima" }, { valor: "porcelanico", texto: "Porcelánico" }, { valor: "mantener", texto: "Mantener el actual" }]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Quieres cambiar las ventanas? *</h3>
            <Opciones valor={r.cambiarVentanas} onChange={(cambiarVentanas) => setR({ ...r, cambiarVentanas })} opciones={[{ valor: true, texto: "Sí" }, { valor: false, texto: "No" }]} />
          </div>
        </Tarjeta>
      )}

      {paso === 4 && (
        <Tarjeta className="space-y-6">
          <h2 className="text-lg font-semibold">Instalaciones</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etiqueta="Climatización y calefacción que tienes *">
              <select className={inputCls} value={r.climaActual ?? ""} onChange={(e) => setR({ ...r, climaActual: (e.target.value || null) as Clima | null, climaDeseado: r.climaDeseado ?? ((e.target.value || null) as Clima | null) })}>
                <option value="">Elige</option>
                {CLIMAS.map((x) => <option key={x.valor} value={x.valor}>{x.texto}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="La que te gustaría *">
              <select className={inputCls} value={r.climaDeseado ?? ""} onChange={(e) => setR({ ...r, climaDeseado: (e.target.value || null) as Clima | null })}>
                <option value="">Elige</option>
                {CLIMAS.map((x) => <option key={x.valor} value={x.valor}>{x.valor === r.climaActual ? `${x.texto} (mantener)` : x.texto}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Agua caliente que tienes *">
              <select className={inputCls} value={r.acsActual ?? ""} onChange={(e) => setR({ ...r, acsActual: (e.target.value || null) as Acs | null, acsDeseado: r.acsDeseado ?? ((e.target.value || null) as Acs | null) })}>
                <option value="">Elige</option>
                {ACS.map((x) => <option key={x.valor} value={x.valor}>{x.texto}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="La que te gustaría *">
              <select className={inputCls} value={r.acsDeseado ?? ""} onChange={(e) => setR({ ...r, acsDeseado: (e.target.value || null) as Acs | null })}>
                <option value="">Elige</option>
                {ACS.map((x) => <option key={x.valor} value={x.valor}>{x.valor === r.acsActual ? `${x.texto} (mantener)` : x.texto}</option>)}
              </select>
            </Campo>
          </div>
          <PreguntaInstalacion titulo="Fontanería" valor={r.fontaneria} onChange={(fontaneria) => setR({ ...r, fontaneria })} aniosMax={aniosMax} cambiaTabiques={cambiaTabiques || r.moverCocina} />
          <PreguntaInstalacion titulo="Electricidad" valor={r.electricidad} onChange={(electricidad) => setR({ ...r, electricidad })} aniosMax={aniosMax} cambiaTabiques={cambiaTabiques} />
        </Tarjeta>
      )}

      {paso === 5 && (
        <Tarjeta className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">¿Qué quieres reformar?</h2>
            <Opciones
              valor={r.alcance}
              onChange={(alcance) => setR({ ...r, alcance })}
              opciones={[{ valor: "integral", texto: "Reforma integral", detalle: "Toda la vivienda" }, { valor: "parcial", texto: "Reforma parcial", detalle: "Solo algunas zonas" }]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">{r.alcance === "integral" ? "¿Qué es lo más importante para ti?" : "¿Qué zonas o trabajos? *"}</h3>
            <div className="flex flex-wrap gap-2">
              {ESTANCIAS.map((e) => {
                const on = r.estancias.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setR({ ...r, estancias: on ? r.estancias.filter((x) => x !== e) : [...r.estancias, e] })}
                    className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-teal-600 bg-teal-600 text-white" : "border-stone-300 bg-white text-stone-700"}`}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">Nivel de acabados</h3>
            <Opciones columnas={3} valor={r.calidad} onChange={(calidad) => setR({ ...r, calidad })} opciones={CALIDADES.map((x) => ({ valor: x.valor, texto: x.texto, detalle: x.detalle }))} />
            {r.calidad && <FotosCalidad nivel={NIVEL_DE_CALIDAD[r.calidad] ?? "medio"} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Presupuesto aproximado">
              <select className={inputCls} value={r.presupuestoCliente} onChange={(e) => setR({ ...r, presupuestoCliente: e.target.value })}>
                <option value="">Elige una opción</option>
                {RANGOS_PRESUPUESTO.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="¿Cuándo te gustaría empezar?">
              <select className={inputCls} value={r.cuando} onChange={(e) => setR({ ...r, cuando: e.target.value })}>
                <option value="">Elige una opción</option>
                {PLAZOS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Campo>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-600">¿Vivirás en la casa durante la obra?</h3>
            <Opciones valor={r.viviraEnObra} onChange={(viviraEnObra) => setR({ ...r, viviraEnObra })} opciones={[{ valor: true, texto: "Sí" }, { valor: false, texto: "No" }]} />
          </div>
          <Campo etiqueta="Cuéntanos lo que quieras (ideas, problemas actuales, gustos…)">
            <textarea rows={4} className={inputCls} value={r.comentarios} onChange={(e) => setR({ ...r, comentarios: e.target.value })} />
          </Campo>
        </Tarjeta>
      )}

      {paso === 6 && (
        <div className="space-y-4">
          {!estimacion && <Tarjeta><p className="text-sm text-stone-500">Calculando tu estimación…</p></Tarjeta>}
          {estimacion && (
            <Tarjeta>
              <h2 className="text-lg font-semibold">Tu presupuesto orientativo, partida a partida</h2>
              <p className="mb-3 mt-1 text-sm text-stone-500">Aquí mismo, al momento. Cambia los acabados y verás cómo se actualiza.</p>
              <VistaEstimacion e={estimacion} />
              <div className="mt-4">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">🧩 Tu moodboard</h3>
                  <Link href="/materiales#catalogo" className="text-sm font-medium text-teal-800 underline">Elegir materiales</Link>
                </div>
                <Moodboard compacto />
              </div>
            </Tarjeta>
          )}
          {estimacion && (
            <Tarjeta className="border-teal-200">
              <DetalleReformaForm detalle={r.detalle} onCambio={cambiarDetalle} rapida={rapida} ajustada={estimacion.base} ocupado={recalculando} />
            </Tarjeta>
          )}
          {estimacion && estimacion.materiales?.length > 0 && (
            <Tarjeta>
              <h3 className="mb-2 font-semibold">Elige tus acabados</h3>
              <ElegirMateriales materiales={estimacion.materiales} onElegir={elegirMaterial} ocupado={recalculando} />
              <SeleccionPlegable />
            </Tarjeta>
          )}
          {estimacion && <FasesYParecidas e={estimacion} v={v} r={r} />}
          <Tarjeta>
            <h3 className="mb-2 font-semibold">Resumen</h3>
            <Resumen v={v} r={r} />
          </Tarjeta>
          <Tarjeta className="border-teal-600 ring-2 ring-teal-100">
            <h2 className="text-lg font-semibold">Guarda tu presupuesto en la app</h2>
            <p className="mt-1 text-sm text-stone-600">
              No te lo enviamos por email: queda guardado aquí, en tu enlace privado, con todas sus partidas. Ahí verás también lo que te costaría con cada reformista homologado de tu zona, calculado con sus tarifas.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Nombre y apellidos *" className="sm:col-span-2">
                <input className={inputCls} value={c.nombre} onChange={(e) => setC({ ...c, nombre: e.target.value })} autoComplete="name" />
              </Campo>
              <Campo etiqueta="Teléfono (opcional)">
                <input className={inputCls} type="tel" value={c.telefono} onChange={(e) => setC({ ...c, telefono: e.target.value })} autoComplete="tel" />
              </Campo>
              <Campo etiqueta="Tu email">
                <input className={`${inputCls} bg-stone-50 text-stone-500`} type="email" value={miembro?.email ?? c.email} readOnly={!!miembro} onChange={(e) => setC({ ...c, email: e.target.value })} autoComplete="email" />
              </Campo>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm text-stone-600">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-700" checked={c.acepto} onChange={(e) => setC({ ...c, acepto: e.target.checked })} />
              <span>
                {TEXTO_CONSENTIMIENTO} *{" "}
                <Link href="/privacidad" target="_blank" className="text-teal-700 underline">Ver política de privacidad</Link>
              </span>
            </label>
            <p className="mt-3 text-xs text-stone-500">
              Tus datos se guardan en servidores de la Unión Europea y puedes pedir que los borremos en cualquier momento. Tu teléfono no se muestra a ningún reformista hasta que tú elijas uno.
            </p>
            {errorEnvio && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-800">{errorEnvio}</p>}
          </Tarjeta>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl justify-between gap-2">
          <Boton variante="secundario" onClick={() => setPaso((p) => Math.max(p - 1, 0))} disabled={paso === 0}>Atrás</Boton>
          {paso < PASOS.length - 1 ? (
            <Boton onClick={siguiente} disabled={!puedeSeguir} className="min-w-32">Siguiente</Boton>
          ) : (
            <Boton onClick={enviar} disabled={!puedeSeguir || enviando} className="min-w-32">{enviando ? "Guardando…" : "Guardar mi presupuesto"}</Boton>
          )}
        </div>
      </div>
    </main>
  );
}

function ResultadoCatastro({ res, vivienda, onElegir, buscando }: { res: ResultadoBusqueda | null; vivienda: Vivienda; onElegir: (rc: string) => void; buscando: boolean }) {
  if (!res) return null;
  if (res.estado === "ok" && res.detalle) {
    const d = res.detalle;
    return (
      <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
        <div className="font-semibold">✓ Hemos encontrado tu vivienda en el Catastro</div>
        {d.direccion && <div className="mt-1">{d.direccion}</div>}
        <div className="mt-1 flex flex-wrap gap-x-4">
          {d.superficie && <span>{d.superficie} m² construidos de vivienda{d.superficieComunes ? ` (sin ${d.superficieComunes} m² de zonas comunes)` : ""}</span>}
          {d.anoConstruccion && <span>Año {d.anoConstruccion}</span>}
          {d.uso && <span>Uso: {d.uso}</span>}
        </div>
        <div className="mt-1 text-xs text-emerald-700">Ref. catastral {d.referencia}</div>
      </div>
    );
  }
  if (res.estado === "ok") {
    return (
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">En ese edificio hay varias viviendas. ¿Cuál es la tuya?</p>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {res.inmuebles.map((i) => (
            <button
              key={i.referencia}
              type="button"
              disabled={buscando}
              onClick={() => onElegir(i.referencia)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm hover:border-teal-600 ${vivienda.catastro?.referencia === i.referencia ? "border-teal-600 bg-teal-50" : "border-stone-200 bg-white"}`}
            >
              {i.descripcion} <span className="text-xs text-stone-400">· {i.referencia}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
      {res.mensaje}. No pasa nada: sigue adelante, rellena los datos a mano y el profesional revisará la ficha catastral.
    </div>
  );
}

export default function NuevoProyecto() {
  return (
    <RequiereRegistro motivo="Únete gratis con tu email y ve tu presupuesto partida a partida aquí mismo, al momento. Sin esperar a que te llegue por correo.">
      <NuevoProyectoContenido />
    </RequiereRegistro>
  );
}
