import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacen } from '../../src/datos.js';
import { calcularTotal, crearPedido, obtenerPedido } from '../../src/servicios/pedidos.js';

const { menu } = crearAlmacen();

describe('Cálculo del pedido', () => {
  it('suma los platos y agrega el impuesto al consumo del 8 %', () => {
    // 2 bandejas (64.000) + 1 limonada (9.000) = 73.000; impuesto 5.840
    const resultado = calcularTotal(
      [
        { platoId: 1, cantidad: 2 },
        { platoId: 4, cantidad: 1 },
      ],
      menu,
    );
    assert.equal(resultado.subtotal, 73000);
    assert.equal(resultado.impuesto, 5840);
    assert.equal(resultado.total, 78840);
  });

  it('rechaza un pedido vacío', () => {
    assert.throws(() => calcularTotal([], menu), { status: 400 });
  });

  it('rechaza un plato que no está en el menú', () => {
    assert.throws(() => calcularTotal([{ platoId: 99, cantidad: 1 }], menu), { status: 400 });
  });

  it('rechaza cantidades en cero o negativas', () => {
    assert.throws(() => calcularTotal([{ platoId: 1, cantidad: 0 }], menu), { status: 400 });
    assert.throws(() => calcularTotal([{ platoId: 1, cantidad: -2 }], menu), { status: 400 });
  });
});

describe('Registro de pedidos', () => {
  it('guarda el pedido y lo puede consultar', () => {
    const almacen = crearAlmacen();
    const pedido = crearPedido(almacen, { mesaId: 1, items: [{ platoId: 2, cantidad: 1 }] });
    assert.equal(obtenerPedido(almacen, pedido.id).total, 30240);
  });

  it('rechaza un pedido para una mesa que no existe', () => {
    const almacen = crearAlmacen();
    assert.throws(
      () => crearPedido(almacen, { mesaId: 99, items: [{ platoId: 1, cantidad: 1 }] }),
      { status: 404 },
    );
  });
});
