# restaurante-cicd

API del sistema de reservas y pedidos de un restaurante, usada para practicar un pipeline de CI/CD con GitHub Actions.

## Uso en local

```bash
npm install
npm run lint       # análisis estático con ESLint
npm test           # pruebas unitarias y de integración
npm run test:ci    # pruebas + cobertura (mínimo 80 %) + reporte JUnit
npm start          # API en http://localhost:3000
```

## Docker

```bash
docker build -t restaurante-api:local .
docker run -d --name restaurante-api -p 3000:3000 restaurante-api:local
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio |
| GET | `/menu` | Platos y precios |
| GET | `/mesas/disponibles?fecha=AAAA-MM-DD&hora=HH:MM&personas=N` | Mesas libres |
| POST | `/reservas` | Crear reserva |
| GET | `/reservas/:id` | Consultar reserva |
| DELETE | `/reservas/:id` | Cancelar reserva |
| POST | `/pedidos` | Crear pedido (requiere `Authorization: Bearer <token>`) |
| GET | `/pedidos/:id` | Consultar pedido |

Variables de entorno: `PORT` (3000), `API_TOKEN` (token-desarrollo), `APP_VERSION`.
