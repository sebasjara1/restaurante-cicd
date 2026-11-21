import express from 'express';
import { crearAlmacen } from './datos.js';
import { ErrorNegocio } from './errores.js';
import { requiereToken } from './autenticacion.js';
import {
  mesasDisponibles,
  crearReserva,
  obtenerReserva,
  cancelarReserva,
} from './servicios/reservas.js';
import { crearPedido, obtenerPedido } from './servicios/pedidos.js';

const VERSION = process.env.APP_VERSION ?? '1.0.0';

export function crearApp({ almacen = crearAlmacen(), token = 'token-desarrollo' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ estado: 'ok', version: VERSION, activoDesde: Math.round(process.uptime()) });
  });

  app.get('/menu', (req, res) => {
    res.json(almacen.menu);
  });

  app.get('/mesas/disponibles', (req, res) => {
    const { fecha, hora } = req.query;
    const personas = req.query.personas ? Number(req.query.personas) : 1;
    res.json(mesasDisponibles(almacen, fecha, hora, personas));
  });

  app.post('/reservas', (req, res) => {
    res.status(201).json(crearReserva(almacen, req.body));
  });

  app.get('/reservas/:id', (req, res) => {
    res.json(obtenerReserva(almacen, Number(req.params.id)));
  });

  app.delete('/reservas/:id', (req, res) => {
    res.json(cancelarReserva(almacen, Number(req.params.id)));
  });

  app.post('/pedidos', requiereToken(token), (req, res) => {
    res.status(201).json(crearPedido(almacen, req.body));
  });

  app.get('/pedidos/:id', (req, res) => {
    res.json(obtenerPedido(almacen, Number(req.params.id)));
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ErrorNegocio) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
