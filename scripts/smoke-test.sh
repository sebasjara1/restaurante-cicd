#!/usr/bin/env bash
# Prueba de humo: revisa que la API desplegada responda bien en sus rutas principales.
# Uso: bash scripts/smoke-test.sh [URL] [VERSION_ESPERADA]
set -uo pipefail

URL="${1:-http://localhost:3000}"
VERSION_ESPERADA="${2:-}"
TOKEN="${API_TOKEN:-token-desarrollo}"
RESPUESTA="$(mktemp)"
fallos=0

echo "Esperando a que la API responda en $URL ..."
for _ in $(seq 1 30); do
  curl -sf "$URL/health" > /dev/null && break
  sleep 1
done

revisar() {
  local nombre="$1" esperado="$2"
  shift 2
  local codigo
  codigo=$(curl -s -o "$RESPUESTA" -w '%{http_code}' "$@")
  if [ "$codigo" = "$esperado" ]; then
    echo "✔ $nombre ($codigo)"
  else
    echo "✖ $nombre: se esperaba $esperado y llegó $codigo"
    fallos=$((fallos + 1))
  fi
}

RESERVA='{"mesaId":4,"fecha":"2099-12-31","hora":"21:00","personas":5,"cliente":"Prueba de humo"}'
PEDIDO='{"mesaId":4,"items":[{"platoId":1,"cantidad":2}]}'

revisar "GET /health" 200 "$URL/health"
if [ -n "$VERSION_ESPERADA" ]; then
  if grep -q "\"version\":\"$VERSION_ESPERADA\"" "$RESPUESTA"; then
    echo "✔ Versión desplegada: $VERSION_ESPERADA"
  else
    echo "✖ La versión desplegada no es $VERSION_ESPERADA: $(cat "$RESPUESTA")"
    fallos=$((fallos + 1))
  fi
fi
revisar "GET /menu" 200 "$URL/menu"
revisar "GET /mesas/disponibles" 200 "$URL/mesas/disponibles?fecha=2099-12-31&hora=21:00"
revisar "POST /reservas (nueva)" 201 -X POST "$URL/reservas" \
  -H 'Content-Type: application/json' -d "$RESERVA"
revisar "POST /reservas (repetida)" 409 -X POST "$URL/reservas" \
  -H 'Content-Type: application/json' -d "$RESERVA"
revisar "POST /pedidos sin token" 401 -X POST "$URL/pedidos" \
  -H 'Content-Type: application/json' -d "$PEDIDO"
revisar "POST /pedidos con token" 201 -X POST "$URL/pedidos" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" -d "$PEDIDO"

rm -f "$RESPUESTA"
if [ "$fallos" -gt 0 ]; then
  echo "Prueba de humo fallida: $fallos revisiones con error"
  exit 1
fi
echo "Prueba de humo superada"
