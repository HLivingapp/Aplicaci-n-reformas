-- Arquitectos (25/11/2026): pagan 99 € al pedir el contacto del cliente (contacto_arquitecto).
alter table pagos drop constraint if exists pagos_concepto_check;
alter table pagos add constraint pagos_concepto_check
  check (concepto in ('acceso_cliente', 'devolucion_acceso', 'cita_proveedor', 'contacto_arquitecto', 'visitas_cliente', 'visita_profesional', 'reserva', 'suscripcion', 'devolucion_visitas', 'servicio'));
