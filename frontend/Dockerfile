# Frontend (Angular) - Multi-stage build with NGINX

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --force

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default content
RUN rm -rf ./*

# Copy built app
COPY --from=builder /app/dist/frontend/browser ./

# NGINX config for SPA and API proxy (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]


