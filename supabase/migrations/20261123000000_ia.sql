-- =====================================================================================
-- ReformaMejor · IA (asistente de obra y lectura de presupuestos para el tarifario)
-- Se ejecuta después de 20261122000000_plataforma.sql.
--
-- La clave de Anthropic NUNCA está en la base de datos ni en la web: es un secreto de la
-- Edge Function «asistente» (Supabase → Edge Functions → Secrets → ANTHROPIC_API_KEY).
-- La función comprueba aquí el plan de cada persona y lleva la cuenta de lo que usa al mes.
-- =====================================================================================

-- Plan de cada persona. Hasta conectar Stripe, el plan se elige en la app (pago simulado);
-- cuando llegue Stripe, su webhook escribirá origen = 'stripe' y el simulado dejará de valer.
create table if not exists planes (
  usuario uuid primary key references auth.users on delete cascade,
  plan text not null default 'gratis' check (plan in ('gratis', 'basico', 'pro')),
  origen text not null default 'simulado' check (origen in ('simulado', 'stripe', 'equipo')),
  desde timestamptz not null default now(),
  hasta timestamptz
);
alter table planes enable row level security;
drop policy if exists "mi plan" on planes;
create policy "mi plan" on planes for select to authenticated using (usuario = auth.uid() or es_del_equipo());
-- Sin políticas de escritura: solo cambia con la función de abajo, el equipo o el servidor.

create or replace function elegir_plan_simulado(p text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sin sesión'; end if;
  if p not in ('gratis', 'basico', 'pro') then raise exception 'Plan no válido'; end if;
  insert into planes (usuario, plan, origen, desde) values (auth.uid(), p, 'simulado', now())
  on conflict (usuario) do update set plan = excluded.plan, desde = now()
    where planes.origen = 'simulado'; -- un plan pagado con Stripe o dado por el equipo no se toca
end $$;
revoke all on function elegir_plan_simulado(text) from public, anon;
grant execute on function elegir_plan_simulado(text) to authenticated;

-- Consumo de IA por persona y mes (lo escribe solo la Edge Function con la clave de servicio).
create table if not exists uso_ia (
  usuario uuid not null references auth.users on delete cascade,
  mes text not null check (mes ~ '^[0-9]{4}-[0-9]{2}$'),
  modo text not null check (modo in ('asistente', 'tarifa', 'foro')),
  consultas integer not null default 0,
  tokens_entrada bigint not null default 0,
  tokens_salida bigint not null default 0,
  primary key (usuario, mes, modo)
);
create index if not exists uso_ia_mes on uso_ia (mes);
alter table uso_ia enable row level security;
drop policy if exists "mi uso de ia" on uso_ia;
create policy "mi uso de ia" on uso_ia for select to authenticated using (usuario = auth.uid() or es_del_equipo());

create or replace function sumar_uso_ia(u uuid, m text, md text, entrada bigint, salida bigint) returns void
language sql security definer set search_path = public as $$
  insert into uso_ia (usuario, mes, modo, consultas, tokens_entrada, tokens_salida) values (u, m, md, 1, entrada, salida)
  on conflict (usuario, mes, modo) do update set
    consultas = uso_ia.consultas + 1,
    tokens_entrada = uso_ia.tokens_entrada + excluded.tokens_entrada,
    tokens_salida = uso_ia.tokens_salida + excluded.tokens_salida;
$$;
revoke all on function sumar_uso_ia(uuid, text, text, bigint, bigint) from public, anon, authenticated;
grant execute on function sumar_uso_ia(uuid, text, text, bigint, bigint) to service_role;

-- Consultas de todos en un mes (tope global de gasto). Solo para la Edge Function.
create or replace function uso_ia_mes(m text) returns bigint
language sql stable security definer set search_path = public as $$
  select coalesce(sum(consultas), 0) from uso_ia where mes = m;
$$;
revoke all on function uso_ia_mes(text) from public, anon, authenticated;
grant execute on function uso_ia_mes(text) to service_role;

-- «Descargar mis datos» incluye también el plan y el uso de IA.
create or replace function mis_datos() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'perfil', (select to_jsonb(p) from perfiles p where id = auth.uid()),
    'plan', (select to_jsonb(x) from planes x where usuario = auth.uid()),
    'uso_ia', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from uso_ia x where usuario = auth.uid()),
    'datos', (select coalesce(jsonb_agg(to_jsonb(d)), '[]') from datos_usuario d where usuario = auth.uid()),
    'proyectos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from proyectos_cliente x where usuario = auth.uid()),
    'profesional', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from profesionales x where usuario = auth.uid()),
    'encargos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from encargos x where cliente = auth.uid() or es_mi_profesional(profesional_id)),
    'pagos', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from pagos x where usuario = auth.uid()),
    'foro', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from foro_mensajes x where autor = auth.uid())
  );
$$;
grant execute on function mis_datos() to authenticated;
