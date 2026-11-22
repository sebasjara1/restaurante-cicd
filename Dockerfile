FROM node:22-alpine

# La versión llega desde el pipeline y se muestra en /health
ARG APP_VERSION=dev
ENV NODE_ENV=production \
    APP_VERSION=$APP_VERSION
WORKDIR /app

# Primero solo las dependencias, para aprovechar la caché de Docker
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# No correr como root dentro del contenedor
USER node

EXPOSE 3000

# Docker revisa cada 30 s que la API responda en /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
