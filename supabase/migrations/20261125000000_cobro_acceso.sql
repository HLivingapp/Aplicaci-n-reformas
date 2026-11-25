-- Nuevo modelo de cobro (25/11/2026): acceso único del cliente (29,90 €, tarjeta o Bizum) y 150 € al proveedor por cita aceptada.
-- Garantía: si en 30 días no hay ninguna cita aceptada, se devuelve el acceso (devolucion_acceso).
-- Ya no hay reserva ni fee sobre la obra. Se mantienen los conceptos antiguos para no romper pagos simulados ya guardados.
alter table pagos drop constraint if exists pagos_concepto_check;
alter table pagos add constraint pagos_concepto_check
  check (concepto in ('acceso_cliente', 'devolucion_acceso', 'cita_proveedor', 'visitas_cliente', 'visita_profesional', 'reserva', 'suscripcion', 'devolucion_visitas', 'servicio'));
