import { ErrorNegocio } from '../errores.js';

// Impuesto al consumo para restaurantes en Colombia.
export const IMPUESTO_CONSUMO = 0.08;

export function calcularTotal(items, menu) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorNegocio(400, 'El pedido debe tener al menos un plato');
  }

  const detalle = items.map(({ platoId, cantidad }) => {
    const plato = menu.find((p) => p.id === platoId);
    if (!plato) {
      throw new ErrorNegocio(400, `El plato ${platoId} no está en el menú`);
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new ErrorNegocio(400, 'La cantidad debe ser un entero mayor que cero');
    }
    return { platoId, nombre: plato.nombre, cantidad, valor: plato.precio * cantidad };
  });

  const subtotal = detalle.reduce((suma, item) => suma + item.valor, 0);
  const impuesto = Math.round(subtotal * IMPUESTO_CONSUMO);
  return { detalle, subtotal, impuesto, total: subtotal + impuesto };
}

export function crearPedido(almacen, datos) {
  const { mesaId, items } = datos ?? {};
  if (!almacen.mesas.some((m) => m.id === mesaId)) {
    throw new ErrorNegocio(404, 'La mesa no existe');
  }
  const pedido = {
    id: almacen.siguientePedido++,
    mesaId,
    ...calcularTotal(items, almacen.menu),
  };
  almacen.pedidos.push(pedido);
  return pedido;
}

export function obtenerPedido(almacen, id) {
  const pedido = almacen.pedidos.find((p) => p.id === id);
  if (!pedido) {
    throw new ErrorNegocio(404, 'El pedido no existe');
  }
  return pedido;
}
