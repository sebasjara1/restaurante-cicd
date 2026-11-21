// Datos en memoria. Cada llamada crea un almacén nuevo, así las pruebas
// no se afectan entre sí.

export function crearAlmacen() {
  return {
    mesas: [
      { id: 1, capacidad: 2 },
      { id: 2, capacidad: 4 },
      { id: 3, capacidad: 4 },
      { id: 4, capacidad: 6 },
      { id: 5, capacidad: 8 },
    ],
    menu: [
      { id: 1, nombre: 'Bandeja paisa', precio: 32000 },
      { id: 2, nombre: 'Ajiaco', precio: 28000 },
      { id: 3, nombre: 'Trucha al ajillo', precio: 35000 },
      { id: 4, nombre: 'Limonada de coco', precio: 9000 },
      { id: 5, nombre: 'Postre de natas', precio: 12000 },
    ],
    reservas: [],
    pedidos: [],
    siguienteReserva: 1,
    siguientePedido: 1,
  };
}
