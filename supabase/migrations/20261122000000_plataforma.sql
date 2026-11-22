-- =====================================================================================
-- ReformaMejor · Plataforma (clientes, profesionales, encargos, pagos simulados y foro)
--
-- Se ejecuta DESPUÉS de supabase/esquema.sql (usa su función es_del_equipo()).
-- Supabase → SQL Editor → New query → pegar este archivo → Run. Se puede ejecutar
-- varias veces sin romper nada.
--
-- Seguridad (RGPD):
--  · RLS activado en TODAS las tablas. Sin una política que lo permita, nadie lee nada.
--  · Cada persona entra con un enlace mágico a su email (sin contraseña) y solo ve lo suyo:
--    auth.uid() identifica a quien hace la petición.
--  · Cliente y profesional de un encargo ven ese encargo; nadie más (salvo el equipo).
--  · Lo único público es el escaparate ANÓNIMO de los profesionales homologados y el foro.
--  · Los pagos son simulados y no se pueden editar ni borrar (registro).
--  · La clave anon es pública por diseño: estas políticas son las que protegen los datos.
--    La clave service_role nunca va al navegador ni al repositorio.
-- =====================================================================================

-- ---------- Perfil de cada persona (se crea solo al entrar por primera vez) ----------
create table if not exists perfiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  rol text not null default 'cliente' check (rol in ('cliente', 'reformista', 'estudio')),
  telefono text check (telefono is null or telefono ~ '^\+34[6789][0-9]{8}$'),
  -- Consentimientos con su texto y fecha (privacidad obligatoria; contacto por WhatsApp/llamada opcional)
  consentimientos jsonb not null default '{}'::jsonb,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table perfiles enable row level security;

create or replace function crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, email) values (new.id, lower(new.email)) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users for each row execute function crear_perfil();

drop policy if exists "perfil propio" on perfiles;
create policy "perfil propio" on perfiles for select to authenticated using (id = auth.uid() or es_del_equipo());
drop policy if exists "perfil propio alta" on perfiles;
create policy "perfil propio alta" on perfiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "perfil propio cambios" on perfiles;
create policy "perfil propio cambios" on perfiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- El email del perfil siempre es el de la cuenta (no se puede cambiar a mano)
create or replace function perfil_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.email := coalesce((select lower(email) from auth.users where id = new.id), new.email);
  new.actualizado := now();
  return new;
end $$;
drop trigger if exists perfil_email on perfiles;
create trigger perfil_email before insert or update on perfiles for each row execute function perfil_email();

-- ---------- Datos personales de la app (borrador de presupuesto, materiales, moodboard, suscripción…) ----------
-- Copia en la nube de lo que la app guarda en el navegador, para no perderlo y verlo en otro dispositivo.
create table if not exists datos_usuario (
  usuario uuid not null default auth.uid() references auth.users on delete cascade,
  clave text not null check (clave ~ '^[a-z0-9:._-]{1,80}$'),
  valor jsonb not null check (pg_column_size(valor) < 1000000),
  actualizado timestamptz not null default now(),
  primary key (usuario, clave)
);
alter table datos_usuario enable row level security;
drop policy if exists "datos propios" on datos_usuario;
create policy "datos propios" on datos_usuario for all to authenticated
  using (usuario = auth.uid()) with check (usuario = auth.uid());

-- ---------- Proyectos y presupuestos del cliente ----------
create table if not exists proyectos_cliente (
  id text primary key check (length(id) between 4 and 80),
  usuario uuid not null default auth.uid() references auth.users on delete cascade,
  -- Cliente, vivienda, reforma, presupuestos y su estado (lo mismo que ve en su enlace privado)
  datos jsonb not null check (pg_column_size(datos) < 2000000),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists proyectos_cliente_usuario on proyectos_cliente (usuario);
alter table proyectos_cliente enable row level security;
drop policy if exists "proyectos propios" on proyectos_cliente;
create policy "proyectos propios" on proyectos_cliente for all to authenticated
  using (usuario = auth.uid() or es_del_equipo()) with check (usuario = auth.uid() or es_del_equipo());

-- ---------- Profesionales: reformistas y estudios de arquitectura ----------
-- Parte PÚBLICA: escaparate anónimo y tarifas (para calcular al momento el presupuesto de cada uno).
create table if not exists profesionales (
  id text primary key check (length(id) between 4 and 80),
  usuario uuid not null unique default auth.uid() references auth.users on delete cascade,
  tipo text not null check (tipo in ('reformista', 'estudio')),
  codigo text not null unique,
  escaparate jsonb not null default '{}'::jsonb, -- zonas, especialidades, fotos de trabajos, valoraciones (sin nombre ni contacto)
  tarifa jsonb,
  homologado boolean not null default false,
  homologado_en timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table profesionales enable row level security;

-- Parte PRIVADA: razón social, CIF, contacto, declaración responsable y estado de cada comprobación.
create table if not exists profesionales_privado (
  id text primary key references profesionales on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  -- Comprobaciones de la homologación automática: REA, AEAT, Seguridad Social, seguro RC
  comprobaciones jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
alter table profesionales_privado enable row level security;

create or replace function es_mi_profesional(pid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profesionales where id = pid and usuario = auth.uid());
$$;

drop policy if exists "escaparate publico" on profesionales;
create policy "escaparate publico" on profesionales for select to anon, authenticated
  using (homologado or usuario = auth.uid() or es_del_equipo());
drop policy if exists "alta profesional" on profesionales;
create policy "alta profesional" on profesionales for insert to authenticated
  with check (usuario = auth.uid() and not homologado);
drop policy if exists "profesional edita lo suyo" on profesionales;
create policy "profesional edita lo suyo" on profesionales for update to authenticated
  using (usuario = auth.uid() or es_del_equipo()) with check (usuario = auth.uid() or es_del_equipo());
drop policy if exists "profesional se da de baja" on profesionales;
create policy "profesional se da de baja" on profesionales for delete to authenticated using (usuario = auth.uid());

drop policy if exists "privado del profesional" on profesionales_privado;
create policy "privado del profesional" on profesionales_privado for all to authenticated
  using (es_mi_profesional(id) or es_del_equipo()) with check (es_mi_profesional(id) or es_del_equipo());

-- Solo el equipo o el servidor (comprobaciones automáticas) pueden homologar o tocar las comprobaciones.
create or replace function proteger_homologacion() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if es_del_equipo() or auth.uid() is null then
    new.actualizado := now();
    return new;
  end if;
  if tg_table_name = 'profesionales' then
    if tg_op = 'INSERT' then
      new.homologado := false; new.homologado_en := null;
    else
      new.homologado := old.homologado; new.homologado_en := old.homologado_en;
      new.usuario := old.usuario; new.codigo := old.codigo; new.tipo := old.tipo;
    end if;
  else
    new.comprobaciones := case when tg_op = 'INSERT' then '{}'::jsonb else old.comprobaciones end;
  end if;
  new.actualizado := now();
  return new;
end $$;
drop trigger if exists proteger_homologacion on profesionales;
create trigger proteger_homologacion before insert or update on profesionales for each row execute function proteger_homologacion();
drop trigger if exists proteger_homologacion on profesionales_privado;
create trigger proteger_homologacion before insert or update on profesionales_privado for each row execute function proteger_homologacion();

-- ---------- Encargos: visitas, presupuesto final, contrato y avances (cliente ↔ profesional) ----------
create table if not exists encargos (
  id text primary key check (length(id) between 4 and 80),
  tipo text not null default 'obra' check (tipo in ('obra', 'estudio')),
  cliente uuid not null default auth.uid() references auth.users on delete cascade,
  -- Id del profesional. En la demo pueden ser los profesionales de ejemplo («ej-…»), que no tienen cuenta.
  profesional_id text not null check (length(profesional_id) between 2 and 80),
  proyecto_id text,
  estado text not null check (length(estado) < 40),
  datos jsonb not null check (pg_column_size(datos) < 1000000),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists encargos_cliente on encargos (cliente);
create index if not exists encargos_profesional on encargos (profesional_id);
alter table encargos enable row level security;

drop policy if exists "partes ven el encargo" on encargos;
create policy "partes ven el encargo" on encargos for select to authenticated
  using (cliente = auth.uid() or es_mi_profesional(profesional_id) or es_del_equipo());
drop policy if exists "cliente pide el encargo" on encargos;
create policy "cliente pide el encargo" on encargos for insert to authenticated with check (cliente = auth.uid());
drop policy if exists "partes actualizan el encargo" on encargos;
create policy "partes actualizan el encargo" on encargos for update to authenticated
  using (cliente = auth.uid() or es_mi_profesional(profesional_id) or es_del_equipo())
  with check (cliente = auth.uid() or es_mi_profesional(profesional_id) or es_del_equipo());
drop policy if exists "cliente retira un encargo sin firmar" on encargos;
create policy "cliente retira un encargo sin firmar" on encargos for delete to authenticated
  using (cliente = auth.uid() and estado not in ('firmado', 'firmado_cliente'));

-- Cada firma solo la puede poner su parte, y un contrato firmado no vuelve atrás.
-- Con los profesionales de ejemplo de la demo («ej-…») el propio cliente hace de profesional.
create or replace function proteger_encargo() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  soy_cliente boolean := new.cliente = auth.uid();
  soy_profesional boolean := es_mi_profesional(new.profesional_id) or (new.profesional_id like 'ej-%' and soy_cliente);
  firma text;
begin
  new.actualizado := now();
  if es_del_equipo() or auth.uid() is null then return new; end if;
  if tg_op = 'UPDATE' then
    new.cliente := old.cliente; new.profesional_id := old.profesional_id; new.tipo := old.tipo; new.creado := old.creado;
    if old.estado = 'firmado' and new.estado <> 'firmado' then
      raise exception 'Un contrato firmado no se puede deshacer';
    end if;
  end if;
  firma := coalesce(new.datos #>> '{firmas,cliente}', '');
  if firma <> coalesce(case when tg_op = 'UPDATE' then old.datos #>> '{firmas,cliente}' end, '') and firma <> '' and not soy_cliente then
    raise exception 'Solo el cliente puede firmar por el cliente';
  end if;
  firma := coalesce(new.datos #>> '{firmas,reformista}', new.datos #>> '{firmas,estudio}', '');
  if firma <> coalesce(case when tg_op = 'UPDATE' then coalesce(old.datos #>> '{firmas,reformista}', old.datos #>> '{firmas,estudio}') end, '') and firma <> '' and not soy_profesional then
    raise exception 'Solo el profesional puede firmar por el profesional';
  end if;
  return new;
end $$;
drop trigger if exists proteger_encargo on encargos;
create trigger proteger_encargo before insert or update on encargos for each row execute function proteger_encargo();

-- Intranet de obra (PR #80): las dos partes del encargo pueden ver los archivos de su obra
-- (carpeta «<id del encargo>/…» del almacén privado «obras»).
drop policy if exists "partes ven archivos de su obra" on storage.objects;
create policy "partes ven archivos de su obra" on storage.objects for select to authenticated
  using (
    bucket_id = 'obras' and exists (
      select 1 from encargos e where e.id = split_part(name, '/', 1)
        and (e.cliente = auth.uid() or es_mi_profesional(e.profesional_id))
    )
  );

-- ---------- Pagos (SIMULADOS hasta conectar Stripe) ----------
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  usuario uuid not null default auth.uid() references auth.users on delete cascade,
  concepto text not null check (concepto in ('visitas_cliente', 'visita_profesional', 'reserva', 'suscripcion', 'devolucion_visitas', 'servicio')),
  importe_cent integer not null check (importe_cent between 0 and 100000000),
  referencia text check (length(referencia) < 120), -- proyecto o encargo
  estado text not null default 'simulado' check (estado = 'simulado'),
  creado timestamptz not null default now()
);
create index if not exists pagos_usuario on pagos (usuario);
alter table pagos enable row level security;
drop policy if exists "pagos propios" on pagos;
create policy "pagos propios" on pagos for select to authenticated using (usuario = auth.uid() or es_del_equipo());
drop policy if exists "registrar pago propio" on pagos;
create policy "registrar pago propio" on pagos for insert to authenticated with check (usuario = auth.uid() and estado = 'simulado');
-- Sin políticas de update/delete: un pago registrado no se cambia.

-- ---------- Foro público ----------
create table if not exists foro_mensajes (
  id text primary key check (length(id) between 4 and 80),
  tema_id text references foro_mensajes (id) on delete cascade, -- null = tema; si no, respuesta a ese tema
  autor uuid not null default auth.uid() references auth.users on delete cascade,
  alias text not null check (length(alias) between 3 and 60),
  profesional boolean not null default false,
  titulo text check (titulo is null or length(titulo) between 8 and 120),
  categoria text check (length(categoria) < 80),
  tipo_tema text check (tipo_tema in ('buena', 'mala', 'pregunta')),
  texto text not null check (length(texto) between 10 and 4000),
  foto text check (foto is null or (foto like 'data:image/jpeg;base64,%' and length(foto) < 1500000)),
  solucion boolean not null default false,
  utiles integer not null default 0,
  denuncias integer not null default 0,
  oculto boolean not null default false,
  creado timestamptz not null default now(),
  check ((tema_id is null) = (titulo is not null))
);
create index if not exists foro_tema on foro_mensajes (tema_id);
alter table foro_mensajes enable row level security;

create table if not exists foro_votos (
  mensaje_id text not null references foro_mensajes (id) on delete cascade,
  usuario uuid not null default auth.uid() references auth.users on delete cascade,
  tipo text not null check (tipo in ('util', 'denuncia')),
  creado timestamptz not null default now(),
  primary key (mensaje_id, usuario, tipo)
);
alter table foro_votos enable row level security;

drop policy if exists "foro se lee sin registro" on foro_mensajes;
create policy "foro se lee sin registro" on foro_mensajes for select to anon, authenticated
  using (not oculto or autor = auth.uid() or es_del_equipo());
drop policy if exists "foro publicar" on foro_mensajes;
create policy "foro publicar" on foro_mensajes for insert to authenticated with check (autor = auth.uid());
drop policy if exists "foro editar lo mio" on foro_mensajes;
create policy "foro editar lo mio" on foro_mensajes for update to authenticated
  using (autor = auth.uid() or es_del_equipo()) with check (autor = auth.uid() or es_del_equipo());
drop policy if exists "foro borrar lo mio" on foro_mensajes;
create policy "foro borrar lo mio" on foro_mensajes for delete to authenticated using (autor = auth.uid() or es_del_equipo());

drop policy if exists "mis votos" on foro_votos;
create policy "mis votos" on foro_votos for select to authenticated using (usuario = auth.uid());
drop policy if exists "votar" on foro_votos;
create policy "votar" on foro_votos for insert to authenticated with check (usuario = auth.uid());

-- Quita teléfonos, emails y enlaces (el foro es público y no se pueden saltar la app).
create or replace function ocultar_contacto(t text) returns text language sql immutable as $$
  select regexp_replace(
           regexp_replace(
             regexp_replace(coalesce(t, ''), '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[contacto oculto]', 'g'),
           '(https?://|www\.)\S+', '[enlace oculto]', 'gi'),
         '(\+?34[\s.-]?)?[6789]([\s.-]?[0-9]){8}', '[teléfono oculto]', 'g');
$$;

-- Lo que la persona no puede decidir: si es profesional homologado, los contadores, el ocultado y la solución.
create or replace function limpiar_mensaje_foro() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  zona text;
begin
  new.texto := ocultar_contacto(new.texto);
  new.titulo := case when new.titulo is null then null else ocultar_contacto(new.titulo) end;
  if es_del_equipo() or auth.uid() is null or current_setting('foro.interno', true) = '1' then return new; end if;
  if tg_op = 'INSERT' then
    new.alias := ocultar_contacto(new.alias);
    select p.escaparate #>> '{zonas,0}' into zona from profesionales p where p.usuario = new.autor and p.homologado limit 1;
    new.profesional := found;
    if found then new.alias := 'Reformista homologado' || coalesce(' · ' || zona, ''); end if;
    new.utiles := 0; new.denuncias := 0; new.oculto := false; new.solucion := false; new.creado := now();
  else
    new.autor := old.autor; new.tema_id := old.tema_id; new.alias := old.alias; new.profesional := old.profesional;
    new.utiles := old.utiles; new.denuncias := old.denuncias; new.oculto := old.oculto;
    new.solucion := old.solucion; new.creado := old.creado;
  end if;
  return new;
end $$;
drop trigger if exists limpiar_mensaje_foro on foro_mensajes;
create trigger limpiar_mensaje_foro before insert or update on foro_mensajes for each row execute function limpiar_mensaje_foro();

-- Contadores de «útil» y denuncias. Con 3 denuncias el mensaje se oculta hasta que lo revise el equipo.
create or replace function contar_votos_foro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('foro.interno', '1', true);
  update foro_mensajes m set
    utiles = (select count(*) from foro_votos v where v.mensaje_id = m.id and v.tipo = 'util'),
    denuncias = (select count(*) from foro_votos v where v.mensaje_id = m.id and v.tipo = 'denuncia'),
    oculto = m.oculto or (select count(*) from foro_votos v where v.mensaje_id = m.id and v.tipo = 'denuncia') >= 3
  where m.id = new.mensaje_id;
  perform set_config('foro.interno', '', true);
  return null;
end $$;
drop trigger if exists contar_votos_foro on foro_votos;
create trigger contar_votos_foro after insert on foro_votos for each row execute function contar_votos_foro();

-- Solo quien abrió el tema marca la respuesta que le sirvió.
create or replace function foro_marcar_solucion(respuesta text) returns void
language plpgsql security definer set search_path = public as $$
declare
  tema text;
begin
  select r.tema_id into tema from foro_mensajes r join foro_mensajes t on t.id = r.tema_id
    where r.id = respuesta and t.autor = auth.uid();
  if tema is null then raise exception 'Solo quien preguntó puede marcar la solución'; end if;
  perform set_config('foro.interno', '1', true);
  update foro_mensajes set solucion = (id = respuesta) where tema_id = tema;
  perform set_config('foro.interno', '', true);
end $$;
revoke all on function foro_marcar_solucion(text) from public, anon;
grant execute on function foro_marcar_solucion(text) to authenticated;

-- ---------- Derecho de acceso y de supresión (RGPD) ----------
-- Descarga de todos mis datos en un JSON.
create or replace function mis_datos() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'perfil', (select to_jsonb(p) from perfiles p where id = auth.uid()),
    'datos', (select coalesce(jsonb_agg(to_jsonb(d)), '[]') from datos_usuario d where usuario = auth.uid()),
    'proyectos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from proyectos_cliente x where usuario = auth.uid()),
    'profesional', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from profesionales x where usuario = auth.uid()),
    'encargos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from encargos x where cliente = auth.uid() or es_mi_profesional(profesional_id)),
    'pagos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from pagos x where usuario = auth.uid()),
    'foro', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from foro_mensajes x where autor = auth.uid())
  );
$$;
grant execute on function mis_datos() to authenticated;

-- Borra la cuenta y todo lo suyo (en cascada). Los contratos firmados se conservan el tiempo que
-- exige la ley: si hay alguno, no se borra y hay que pedirlo al equipo.
create or replace function borrar_mi_cuenta() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  if exists (select 1 from encargos where (cliente = auth.uid() or es_mi_profesional(profesional_id)) and estado = 'firmado') then
    raise exception 'Tienes contratos firmados: escríbenos y lo gestionamos respetando los plazos legales';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function borrar_mi_cuenta() from public, anon;
grant execute on function borrar_mi_cuenta() to authenticated;
