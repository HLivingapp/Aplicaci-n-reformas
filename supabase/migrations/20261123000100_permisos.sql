-- =====================================================================================
-- ReformaMejor · permisos de tabla para los roles de Supabase
-- Se ejecuta después de 20261123000000_ia.sql. Se puede ejecutar varias veces.
--
-- En este proyecto las tablas de public se crearon sin los GRANT por defecto, así que la app
-- recibe «permission denied» aunque las políticas RLS estén bien. Aquí se dan los permisos de
-- tabla; quién ve y cambia cada fila lo siguen decidiendo las políticas RLS (activas en todas).
-- =====================================================================================

-- El servidor (Edge Functions y la web en Vercel con la clave de servicio) puede con todo.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on
  equipo, registros, ajustes, foro_temas, miembros,
  perfiles, datos_usuario, proyectos_cliente, profesionales, profesionales_privado,
  encargos, pagos, foro_mensajes, foro_votos, planes, uso_ia
to service_role;

-- Personas con sesión: solo lo que sus políticas permiten.
grant select, insert, update on perfiles to authenticated;
grant select, insert, update, delete on datos_usuario, proyectos_cliente, profesionales, profesionales_privado, encargos, foro_mensajes to authenticated;
grant select, insert on pagos, foro_votos to authenticated;
grant select on planes, uso_ia, equipo to authenticated;
grant select, insert, update, delete on registros, ajustes to authenticated; -- RLS: solo el equipo

-- Sin sesión: el escaparate de profesionales y el foro se leen sin registro.
grant select on profesionales, foro_mensajes to anon;

-- Columnas con valores por defecto (identity/serial) necesitan permiso sobre su secuencia.
grant usage, select on all sequences in schema public to authenticated, service_role;
