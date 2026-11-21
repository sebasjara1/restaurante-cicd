import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearApp } from '../../src/app.js';

const TOKEN = 'token-pruebas';
const FUTURO = '2099-12-31';
const reserva = { mesaId: 3, fecha: FUTURO, hora: '20:00', personas: 2, cliente: 'Camila' };

describe('API del restaurante', () => {
  let app;
  beforeEach(() => {
    app = crearApp({ token: TOKEN });
  });

  it('GET /health responde que el servicio está activo', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.estado, 'ok');
  });

  it('GET /menu devuelve los platos', async () => {
    const res = await request(app).get('/menu');
    assert.equal(res.status, 200);
    assert.ok(res.body.length > 0);
  });

  it('flujo completo de una reserva: crear, consultar y cancelar', async () => {
    const creada = await request(app).post('/reservas').send(reserva);
    assert.equal(creada.status, 201);

    const consultada = await request(app).get(`/reservas/${creada.body.id}`);
    assert.equal(consultada.body.cliente, 'Camila');

    const cancelada = await request(app).delete(`/reservas/${creada.body.id}`);
    assert.equal(cancelada.body.estado, 'cancelada');
  });

  it('POST /reservas devuelve 409 si la mesa ya está reservada', async () => {
    await request(app).post('/reservas').send(reserva);
    const res = await request(app).post('/reservas').send({ ...reserva, cliente: 'Pedro' });
    assert.equal(res.status, 409);
  });

  it('POST /reservas devuelve 400 si la fecha ya pasó', async () => {
    const res = await request(app)
      .post('/reservas')
      .send({ ...reserva, fecha: '2020-01-01' });
    assert.equal(res.status, 400);
  });

  it('GET /mesas/disponibles excluye la mesa reservada', async () => {
    await request(app).post('/reservas').send(reserva);
    const res = await request(app).get(`/mesas/disponibles?fecha=${FUTURO}&hora=20:00`);
    assert.equal(res.status, 200);
    assert.ok(!res.body.some((m) => m.id === 3));
  });

  it('GET /reservas/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/reservas/500');
    assert.equal(res.status, 404);
  });

  it('POST /pedidos sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/pedidos')
      .send({ mesaId: 1, items: [{ platoId: 1, cantidad: 1 }] });
    assert.equal(res.status, 401);
  });

  it('POST /pedidos con token crea el pedido y calcula el total', async () => {
    const creado = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ mesaId: 1, items: [{ platoId: 3, cantidad: 2 }] });
    assert.equal(creado.status, 201);
    assert.equal(creado.body.total, 75600);

    const consultado = await request(app).get(`/pedidos/${creado.body.id}`);
    assert.equal(consultado.body.total, 75600);
  });

  it('responde 400 si el JSON está mal formado', async () => {
    const res = await request(app)
      .post('/reservas')
      .set('Content-Type', 'application/json')
      .send('{mal json');
    assert.equal(res.status, 400);
  });

  it('responde 404 en una ruta que no existe', async () => {
    const res = await request(app).get('/no-existe');
    assert.equal(res.status, 404);
  });
});
