// Error de negocio con el código HTTP que debe devolver la API.
export class ErrorNegocio extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
