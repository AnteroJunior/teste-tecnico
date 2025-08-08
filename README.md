## Projeto: Notificações (NestJS + Angular + RabbitMQ)

Aplicação full-stack demonstrando publicação e consumo de mensagens com RabbitMQ, uma API em NestJS e um frontend Angular.

### Stack

- Backend: NestJS (Node.js)
- Mensageria: RabbitMQ
- Frontend: Angular + NGINX (em produção)
- Containerização: Docker e Docker Compose

## Arquitetura (resumo)

- API expõe endpoints para criar uma notificação e consultar o status.
- Ao criar, a API valida o payload, define status inicial e publica na fila de entrada.
- Um consumidor processa a mensagem (simulado), atualiza o status e publica o resultado na fila de status.
- Um segundo consumidor lê a fila de status e atualiza o status em memória.

Filas padrão (sobrescrevível via env):

- Entrada: `fila.notificacao.entrada.ANTERO`
- Status: `fila.notificacao.status.ANTERO`

## Como rodar com Docker Compose (recomendado)

Pré-requisitos: Docker Desktop

```bash
docker compose up -d --build
```

Serviços e portas:

- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api
- RabbitMQ (console): http://localhost:15672 (user: guest / pass: guest)

Variáveis usadas no backend (definidas no compose):

- `RABBITMQ_URL=amqp://rabbitmq`
- `QUEUE_NOTIFICATION_IN=fila.notificacao.entrada.ANTERO`
- `QUEUE_NOTIFICATION_STATUS=fila.notificacao.status.ANTERO`
- `RMQ_PREFETCH=1`
- `REQUEUE_ON_ERROR=false`

Parar e remover:

```bash
docker compose down -v
```

## Como rodar localmente (sem Docker)

Pré-requisitos: Node.js 20+, npm, e um RabbitMQ acessível.

### 1) Subir RabbitMQ localmente (opção rápida)

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```

### 2) Backend (NestJS)

```bash
cd backend
npm install

# Variáveis de ambiente (exemplos)
set RABBITMQ_URL=amqp://localhost
set QUEUE_NOTIFICATION_IN=fila.notificacao.entrada.ANTERO
set QUEUE_NOTIFICATION_STATUS=fila.notificacao.status.ANTERO
set RMQ_PREFETCH=1
set REQUEUE_ON_ERROR=false

npm run start:dev
```

Endpoints (base: http://localhost:3000/api):

- POST `/notificar`

  - Body JSON:
    ```json
    {
      "mensagemId": "<uuid>",
      "conteudoMensagem": "texto da mensagem"
    }
    ```
  - Resposta: `{ mensagemId, status }`

- GET `/notificar/status/:mensagemId`
  - Resposta: `{ status }`

Testes no backend:

```bash
cd backend
npm test
```

### 3) Frontend (Angular)

```bash
cd frontend
npm install
npm start
# abre em http://localhost:4200
```

Observação: por padrão, o frontend aponta para `http://localhost:3000/api` nos arquivos `src/environments/*.ts`. Se desejar usar um proxy NGINX (em produção via Docker), mantenha como está; caso publique o backend em outra URL, ajuste `apiUrl`.

## Variáveis de ambiente do Backend

- `RABBITMQ_URL` (ex.: `amqp://localhost` ou `amqp://rabbitmq` no Compose)
- `QUEUE_NOTIFICATION_IN` (nome da fila de entrada)
- `QUEUE_NOTIFICATION_STATUS` (nome da fila de status)
- `RMQ_PREFETCH` (controle de concorrência de mensagens)
- `REQUEUE_ON_ERROR` (`true`/`false`)

## Dicas e Solução de Problemas

- Se o backend não conecta ao RabbitMQ, verifique `RABBITMQ_URL` e se a porta `5672` está acessível.
- Painel do RabbitMQ: http://localhost:15672
- Portas padrão: Backend `3000`, Frontend `4200`.
- Para rebuild completo do Docker: `docker compose build --no-cache && docker compose up -d`.

## Scripts úteis

Backend:

- `npm run start:dev` – desenvolvimento com watch
- `npm run test` – testes unitários (amqplib mockado)
- `npm run lint` – lint

Frontend:

- `npm start` – dev server
- `npm run build` – build de produção
