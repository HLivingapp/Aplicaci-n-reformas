-- =====================================================================================
-- ReformaMejor · Base de conocimiento de la IA
--
-- Documentos que el equipo sube desde /empresa/conocimiento (PDF, Excel, texto) o que se importan
-- de fuentes oficiales (Código Técnico de la Edificación, normativa de Madrid…). Se trocean en
-- fragmentos con búsqueda de texto en español y la IA de la app los usa como contexto y los cita.
--
-- Seguridad (RGPD):
--  · RLS en las dos tablas: solo el equipo (es_del_equipo()) lee y escribe directamente.
--  · La IA consulta con buscar_conocimiento(). A cualquier usuario solo le devuelve documentos marcados
--    como públicos (normativa oficial). Lo interno (partidas, precios de referencia, procesos) solo lo
--    ve el equipo o el servidor (service_role, la Edge Function de la IA).
--  · Al importar se ocultan emails, teléfonos, NIF/CIF/NIE e IBAN. El equipo revisa el resto.
--  · Nada de esto va al repositorio: los documentos viven solo en Supabase (UE).
-- Se puede ejecutar varias veces.
-- =====================================================================================

create extension if not exists unaccent with schema extensions;

-- unaccent no es "immutable" y no se puede usar en columnas generadas: envoltorio fijo al diccionario.
create or replace function sin_acentos(t text) returns text
language sql immutable parallel safe strict set search_path = '' as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, t);
$$;

create table if not exists conocimiento_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (length(titulo) between 2 and 300),
  -- Tema principal (ordena la zona de admin y filtra la búsqueda)
  tema text not null check (tema in ('cte', 'normativa_madrid', 'legalizaciones', 'presupuestos', 'productos', 'tecnica', 'procesos', 'otros')),
  -- Tipos de obra a los que aplica
  tipos_obra text[] not null default '{}'
    check (tipos_obra <@ array['reforma_interior', 'rehabilitacion', 'fachadas', 'instalaciones', 'estructura', 'cubiertas', 'accesibilidad']::text[]),
  fuente text,          -- p. ej. «Código Técnico de la Edificación · DB-HE (codigotecnico.org)»
  url text check (url is null or url ~ '^https://'),
  version text,         -- p. ej. «junio 2022»
  publico boolean not null default false, -- true = normativa pública: la IA la usa con cualquier usuario
  archivo text,         -- ruta en el almacén privado «conocimiento»
  formato text,         -- pdf, xlsx, csv, txt, md, url
  estado text not null default 'procesando' check (estado in ('procesando', 'listo', 'error')),
  paginas int,
  notas text,
  creado_por uuid default auth.uid() references auth.users on delete set null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists conocimiento_documentos_tema on conocimiento_documentos (tema);
alter table conocimiento_documentos enable row level security;

create table if not exists conocimiento_fragmentos (
  id bigint generated always as identity primary key,
  documento uuid not null references conocimiento_documentos on delete cascade,
  orden int not null,
  pagina int,
  seccion text,         -- p. ej. «DB-HE · HE 1» o la hoja del Excel
  texto text not null check (length(texto) between 1 and 20000),
  tipos_obra text[] not null default '{}',
  busqueda tsvector generated always as (
    setweight(to_tsvector('spanish', sin_acentos(coalesce(seccion, ''))), 'A') ||
    setweight(to_tsvector('spanish', sin_acentos(texto)), 'B')
  ) stored,
  unique (documento, orden)
);
create index if not exists conocimiento_fragmentos_busqueda on conocimiento_fragmentos using gin (busqueda);
create index if not exists conocimiento_fragmentos_tipos on conocimiento_fragmentos using gin (tipos_obra);
alter table conocimiento_fragmentos enable row level security;

drop policy if exists "equipo gestiona documentos" on conocimiento_documentos;
create policy "equipo gestiona documentos" on conocimiento_documentos for all to authenticated
  using (es_del_equipo()) with check (es_del_equipo());
drop policy if exists "equipo gestiona fragmentos" on conocimiento_fragmentos;
create policy "equipo gestiona fragmentos" on conocimiento_fragmentos for all to authenticated
  using (es_del_equipo()) with check (es_del_equipo());

create or replace function conocimiento_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin new.actualizado := now(); return new; end $$;
drop trigger if exists conocimiento_actualizado on conocimiento_documentos;
create trigger conocimiento_actualizado before update on conocimiento_documentos for each row execute function conocimiento_actualizado();

-- Almacén PRIVADO de los originales (solo el equipo)
insert into storage.buckets (id, name, public, file_size_limit)
  values ('conocimiento', 'conocimiento', false, 52428800)
  on conflict (id) do nothing;
drop policy if exists "equipo gestiona conocimiento" on storage.objects;
create policy "equipo gestiona conocimiento" on storage.objects for all to authenticated
  using (bucket_id = 'conocimiento' and es_del_equipo()) with check (bucket_id = 'conocimiento' and es_del_equipo());

-- ---------- Búsqueda para la IA ----------
-- Devuelve los fragmentos más relevantes para una pregunta en lenguaje natural.
-- Cualquier palabra cuenta (OR) y se ordena por relevancia; los títulos de sección pesan más.
-- Sin ser del equipo ni service_role, solo se devuelven documentos públicos.
create or replace function buscar_conocimiento(
  consulta text,
  tipos text[] default null,
  temas text[] default null,
  limite int default 8
) returns table (
  fragmento bigint, documento uuid, titulo text, tema text, fuente text, url text, version text,
  pagina int, seccion text, texto text, tipos_obra text[], relevancia real
)
language plpgsql stable security definer set search_path = public as $$
declare
  q tsquery;
  interno boolean := es_del_equipo() or coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  q := nullif(replace(plainto_tsquery('spanish', sin_acentos(left(coalesce(consulta, ''), 2000)))::text, '&', '|'), '')::tsquery;
  if q is null then return; end if;
  return query
    select f.id, d.id, d.titulo, d.tema, d.fuente, d.url, d.version, f.pagina, f.seccion, f.texto, f.tipos_obra,
           ts_rank_cd(f.busqueda, q, 32)::real
    from conocimiento_fragmentos f
    join conocimiento_documentos d on d.id = f.documento
    where f.busqueda @@ q
      and d.estado = 'listo'
      and (interno or d.publico)
      and (tipos is null or cardinality(tipos) = 0 or f.tipos_obra && tipos or d.tipos_obra && tipos)
      and (temas is null or cardinality(temas) = 0 or d.tema = any (temas))
    order by 12 desc
    limit least(greatest(coalesce(limite, 8), 1), 25);
end $$;
revoke all on function buscar_conocimiento(text, text[], text[], int) from public;
grant execute on function buscar_conocimiento(text, text[], text[], int) to anon, authenticated, service_role;

-- Resumen para la zona de admin (cuántos fragmentos tiene cada documento)
create or replace view conocimiento_resumen with (security_invoker = true) as
  select d.*, (select count(*) from conocimiento_fragmentos f where f.documento = d.id) as fragmentos
  from conocimiento_documentos d;

-- Cargas puntuales (p. ej. importar el CTE desde la base de datos): token de un solo uso, solo su huella.
-- Sin políticas: solo la Edge Function (service_role) la lee.
create table if not exists conocimiento_cargas (
  huella text primary key,
  caduca timestamptz not null default now() + interval '2 hours'
);
alter table conocimiento_cargas enable row level security;
grant select, insert, delete on conocimiento_cargas to service_role;

-- Este proyecto no da permisos por defecto a las tablas nuevas: hay que darlos explícitamente.
-- (RLS sigue decidiendo qué filas ve cada uno.)
grant select, insert, update, delete on conocimiento_documentos, conocimiento_fragmentos to authenticated, service_role;
grant select on conocimiento_resumen to authenticated, service_role;
