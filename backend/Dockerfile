# Backend API (NestJS) - Multi-stage build

FROM node:20-alpine AS builder
WORKDIR /app

# Optimize layer caching
COPY package*.json ./
RUN npm ci --force

COPY . .
RUN npm run build


FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --force

# Copy compiled dist
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Environment defaults (can be overridden by compose)
ENV RABBITMQ_URL=amqp://rabbitmq \
    QUEUE_NOTIFICATION_IN=fila.notificacao.entrada.ANTERO \
    QUEUE_NOTIFICATION_STATUS=fila.notificacao.status.ANTERO \
    RMQ_PREFETCH=1 \
    REQUEUE_ON_ERROR=false

CMD ["node", "dist/main"]


