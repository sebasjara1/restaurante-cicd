import { ErrorNegocio } from '../errores.js';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^\d{2}:\d{2}$/;

function fechaHora(fecha, hora) {
  if (!FORMATO_FECHA.test(fecha ?? '') || !FORMATO_HORA.test(hora ?? '')) {
    throw new ErrorNegocio(400, 'La fecha debe ser AAAA-MM-DD y la hora HH:MM');
  }
  const momento = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(momento.getTime())) {
    throw new ErrorNegocio(400, 'Fecha u hora no válida');
  }
  return momento;
}

function estaOcupada(almacen, mesaId, fecha, hora) {
  return almacen.reservas.some(
    (r) => r.mesaId === mesaId && r.fecha === fecha && r.hora === hora && r.estado === 'activa',
  );
}

export function mesasDisponibles(almacen, fecha, hora, personas = 1) {
  fechaHora(fecha, hora);
  return almacen.mesas.filter(
    (m) => m.capacidad >= personas && !estaOcupada(almacen, m.id, fecha, hora),
  );
}

export function crearReserva(almacen, datos, ahora = new Date()) {
  const { mesaId, fecha, hora, personas, cliente } = datos ?? {};

  if (!cliente || typeof cliente !== 'string') {
    throw new ErrorNegocio(400, 'El nombre del cliente es obligatorio');
  }
  if (!Number.isInteger(personas) || personas < 1) {
    throw new ErrorNegocio(400, 'El número de personas debe ser un entero mayor que cero');
  }

  const momento = fechaHora(fecha, hora);
  if (momento <= ahora) {
    throw new ErrorNegocio(400, 'No se puede reservar en una fecha pasada');
  }

  const mesa = almacen.mesas.find((m) => m.id === mesaId);
  if (!mesa) {
    throw new ErrorNegocio(404, 'La mesa no existe');
  }
  if (personas > mesa.capacidad) {
    throw new ErrorNegocio(400, `La mesa ${mesa.id} es para máximo ${mesa.capacidad} personas`);
  }
  // if (estaOcupada(almacen, mesaId, fecha, hora)) {
  //   throw new ErrorNegocio(409, 'La mesa ya está reservada en esa fecha y hora');
  // }

  const reserva = {
    id: almacen.siguienteReserva++,
    mesaId,
    fecha,
    hora,
    personas,
    cliente,
    estado: 'activa',
  };
  almacen.reservas.push(reserva);
  return reserva;
}

export function obtenerReserva(almacen, id) {
  const reserva = almacen.reservas.find((r) => r.id === id);
  if (!reserva) {
    throw new ErrorNegocio(404, 'La reserva no existe');
  }
  return reserva;
}

export function cancelarReserva(almacen, id) {
  const reserva = obtenerReserva(almacen, id);
  reserva.estado = 'cancelada';
  return reserva;
}
