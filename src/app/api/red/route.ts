import { NextResponse } from "next/server";
import { fichasRed } from "@/lib/red";
import { cargarTodo } from "@/lib/servidor/repo";

/** Escaparate anónimo de reformistas homologados (sin nombres ni contactos). */
export async function GET() {
  return NextResponse.json({ fichas: fichasRed((await cargarTodo()).proveedores) }, { headers: { "Cache-Control": "no-store" } });
}
