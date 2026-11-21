import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacen } from '../../src/datos.js';
import {
  crearReserva,
  mesasDisponibles,
  cancelarReserva,
  obtenerReserva,
} from '../../src/servicios/reservas.js';

// Fecha fija para que las pruebas den siempre el mismo resultado.
const AHORA = new Date('2026-11-21T10:00:00');
const base = { mesaId: 2, fecha: '2026-11-25', hora: '19:00', personas: 4, cliente: 'Laura' };

describe('Reservas', () => {
  let almacen;
  beforeEach(() => {
    almacen = crearAlmacen();
  });

  it('crea una reserva válida', () => {
    const reserva = crearReserva(almacen, base, AHORA);
    assert.equal(reserva.id, 1);
    assert.equal(reserva.estado, 'activa');
    assert.equal(almacen.reservas.length, 1);
  });

  it('no permite reservar la misma mesa dos veces a la misma hora', () => {
    crearReserva(almacen, base, AHORA);
    assert.throws(
      () => crearReserva(almacen, { ...base, cliente: 'Andrés' }, AHORA),
      { status: 409 },
    );
  });

  it('permite reservar la misma mesa a otra hora', () => {
    crearReserva(almacen, base, AHORA);
    const otra = crearReserva(almacen, { ...base, hora: '21:00' }, AHORA);
    assert.equal(otra.id, 2);
  });

  it('no permite reservar en una fecha pasada', () => {
    assert.throws(
      () => crearReserva(almacen, { ...base, fecha: '2026-11-20' }, AHORA),
      { status: 400, message: /pasada/ },
    );
  });

  it('no permite más personas que la capacidad de la mesa', () => {
    assert.throws(
      () => crearReserva(almacen, { ...base, personas: 5 }, AHORA),
      { status: 400, message: /máximo 4/ },
    );
  });

  it('rechaza una mesa que no existe', () => {
    assert.throws(() => crearReserva(almacen, { ...base, mesaId: 99 }, AHORA), { status: 404 });
  });

  it('rechaza datos incompletos o con formato incorrecto', () => {
    assert.throws(() => crearReserva(almacen, { ...base, cliente: '' }, AHORA), { status: 400 });
    assert.throws(() => crearReserva(almacen, { ...base, personas: 0 }, AHORA), { status: 400 });
    assert.throws(() => crearReserva(almacen, { ...base, fecha: '25/11/2026' }, AHORA), {
      status: 400,
    });
  });

  it('una reserva cancelada libera la mesa', () => {
    const reserva = crearReserva(almacen, base, AHORA);
    cancelarReserva(almacen, reserva.id);
    assert.equal(obtenerReserva(almacen, reserva.id).estado, 'cancelada');
    assert.doesNotThrow(() => crearReserva(almacen, base, AHORA));
  });

  it('lista solo las mesas libres y con capacidad suficiente', () => {
    crearReserva(almacen, base, AHORA);
    const libres = mesasDisponibles(almacen, base.fecha, base.hora, 4).map((m) => m.id);
    assert.deepEqual(libres, [3, 4, 5]);
  });
});
