# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2: Servidor nginx
FROM nginx:stable-alpine

# Copiamos archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos configuración de nginx si deseas personalizarla
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
