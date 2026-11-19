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
  coleccion text not null check (coleccion in ('clientes', 'proyectos', 'presupuestos', 'obras')),
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

-- Añade aquí los emails del equipo:
-- insert into equipo (email, nombre) values ('persona@empresa.es', 'Nombre');
