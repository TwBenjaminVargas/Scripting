# Usa imagen de Node.js basada en Alpine Linux
FROM node:20-alpine
# Instalar FFmpeg y dependencias de v4l2 (Video4Linux2)
RUN apk add --no-cache ffmpeg v4l-utils

#Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el código fuente del proyecto
COPY . .

# iniciar servidor Node.js
CMD ["node", "tcp_server.mjs"]