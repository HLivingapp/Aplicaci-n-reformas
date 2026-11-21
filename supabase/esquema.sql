-- Esquema de la base de datos de App Reformas (Supabase / PostgreSQL).
-- Se ejecuta una vez en Supabase → SQL Editor.

-- Personas del equipo que pueden entrar en la parte de empresa (con enlace por email).
create table if not exists equipo (
  email text primary key,
  nombre text,
  creado timestamptz not null default now()
);

-- Clientes, proyectos, presupuestos y obras. Cada registro guarda su contenido en JSON.
create table if not exists registros (
  coleccion text not null check (coleccion in ('clientes', 'proyectos', 'presupuestos', 'obras', 'fotos', 'proveedores')),
  id text not null,
  cliente_id text,
  datos jsonb not null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  primary key (coleccion, id)
);
create index if not exists registros_cliente on registros (cliente_id);
create index if not exists registros_token on registros ((datos->>'token')) where coleccion = 'clientes';

-- Datos de la empresa, tarifario y contador de presupuestos.
create table if not exists ajustes (
  clave text primary key,
  datos jsonb not null,
  actualizado timestamptz not null default now()
);

-- Seguridad: solo el equipo puede leer y escribir. Los clientes acceden a través
-- del servidor de la app con su enlace privado (nunca directamente a la base de datos).
alter table equipo enable row level security;
alter table registros enable row level security;
alter table ajustes enable row level security;

create or replace function es_del_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from equipo where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

drop policy if exists "equipo se ve a sí mismo" on equipo;
create policy "equipo se ve a sí mismo" on equipo for select to authenticated using (es_del_equipo());

drop policy if exists "equipo gestiona registros" on registros;
create policy "equipo gestiona registros" on registros for all to authenticated using (es_del_equipo()) with check (es_del_equipo());

drop policy if exists "equipo gestiona ajustes" on ajustes;
create policy "equipo gestiona ajustes" on ajustes for all to authenticated using (es_del_equipo()) with check (es_del_equipo());

-- Si la tabla ya existía de una versión anterior, permite también la colección 'fotos':
alter table registros drop constraint if exists registros_coleccion_check;
alter table registros add constraint registros_coleccion_check check (coleccion in ('clientes', 'proyectos', 'presupuestos', 'obras', 'fotos', 'proveedores'));

-- Galería de fotos: almacén PRIVADO. Solo el equipo sube y ve; los clientes reciben
-- enlaces temporales (1 hora) que genera el servidor, y solo de fotos aprobadas.
insert into storage.buckets (id, name, public) values ('galeria', 'galeria', false) on conflict (id) do nothing;
drop policy if exists "equipo gestiona galeria" on storage.objects;
create policy "equipo gestiona galeria" on storage.objects for all to authenticated
  using (bucket_id = 'galeria' and es_del_equipo()) with check (bucket_id = 'galeria' and es_del_equipo());

-- Añade aquí los emails del equipo:
-- insert into equipo (email, nombre) values ('persona@empresa.es', 'Nombre');

-- Documentos de homologación de proveedores (privados; los suben por el servidor y solo los ve el equipo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('proveedores', 'proveedores', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
  on conflict (id) do nothing;
drop policy if exists "equipo ve documentos de proveedores" on storage.objects;
create policy "equipo ve documentos de proveedores" on storage.objects for select to authenticated
  using (bucket_id = 'proveedores' and es_del_equipo());
drop policy if exists "equipo borra documentos de proveedores" on storage.objects;
create policy "equipo borra documentos de proveedores" on storage.objects for delete to authenticated
  using (bucket_id = 'proveedores' and es_del_equipo());

-- Comunidad pública (foro). Se lee y se escribe solo a través del servidor de la app,
-- que oculta datos de contacto, comprueba a los reformistas homologados y nunca publica las claves.
create table if not exists foro_temas (
  id text primary key,
  datos jsonb not null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table foro_temas enable row level security;

-- Comunidad Human Living: alta con email. Teléfono y permiso de contacto (WhatsApp o llamada) opcionales,
-- con el texto y la fecha de cada consentimiento. Solo el servidor de la app lee y escribe.
create table if not exists miembros (
  email text primary key,
  telefono text,
  privacidad jsonb not null,
  contacto jsonb,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table miembros enable row level security;
