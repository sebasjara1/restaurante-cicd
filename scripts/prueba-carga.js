// Prueba de carga corta con autocannon. Falla si la API se pone lenta o responde con errores.
// Uso: node scripts/prueba-carga.js [URL]
import { appendFileSync } from 'node:fs';
import autocannon from 'autocannon';

const url = process.argv[2] ?? 'http://localhost:3000';
const LIMITE_P99_MS = Number(process.env.LIMITE_P99_MS ?? 500);
const MINIMO_RPS = Number(process.env.MINIMO_RPS ?? 200);

const resultado = await autocannon({
  url,
  connections: 20,
  duration: 15,
  requests: [
    { method: 'GET', path: '/menu' },
    { method: 'GET', path: '/mesas/disponibles?fecha=2099-12-31&hora=20:00' },
    { method: 'GET', path: '/health' },
  ],
});

const errores = resultado.errors + resultado.timeouts + resultado.non2xx;
const filas = [
  ['Peticiones totales', resultado.requests.total, '-'],
  ['Peticiones por segundo (promedio)', Math.round(resultado.requests.average), `>= ${MINIMO_RPS}`],
  ['Latencia promedio (ms)', resultado.latency.average, '-'],
  ['Latencia p99 (ms)', resultado.latency.p99, `<= ${LIMITE_P99_MS}`],
  ['Respuestas con error', errores, '0'],
];

console.table(filas.map(([medida, valor, limite]) => ({ medida, valor, limite })));

const cumple =
  errores === 0 &&
  resultado.latency.p99 <= LIMITE_P99_MS &&
  resultado.requests.average >= MINIMO_RPS;

if (process.env.GITHUB_STEP_SUMMARY) {
  const tabla = filas.map(([m, v, l]) => `| ${m} | ${v} | ${l} |`).join('\n');
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Prueba de carga (20 conexiones, 15 s)\n\n| Medida | Valor | Límite |\n|---|---|---|\n${tabla}\n\n` +
      `**Resultado:** ${cumple ? '✅ Cumple' : '❌ No cumple'}\n`,
  );
}

if (!cumple) {
  console.error('La prueba de carga no cumple los límites definidos');
  process.exit(1);
}
console.log('Prueba de carga superada');
