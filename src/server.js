import { crearApp } from './app.js';

const puerto = Number(process.env.PORT ?? 3000);
const token = process.env.API_TOKEN ?? 'token-desarrollo';

const servidor = crearApp({ token }).listen(puerto, () => {
  console.log(`API del restaurante escuchando en el puerto ${puerto}`);
});

// Docker envía SIGTERM al detener el contenedor; se cierra de forma ordenada.
process.on('SIGTERM', () => servidor.close(() => process.exit(0)));
