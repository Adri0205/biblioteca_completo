# ─── Stage 1: Build ───────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar la caché de capas
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Variable inyectada en build-time por Coolify (o docker build --build-arg)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────
FROM nginx:1.27-alpine

# Eliminar configuración default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar config personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
