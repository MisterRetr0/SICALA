# Usa una imagen de Playwright que ya contiene Chromium
FROM mcr.microsoft.com/playwright:v1.32.0-focal

# Instalar Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnss3 \
    libxss1 \
    libxtst6 \
    libx11-xcb1 \
    libdbus-1-3 \
    libgbm1 \
    --no-install-recommends

# Crea y establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de tu proyecto al contenedor
COPY . .

# Instala las dependencias de Node.js
RUN npm install

# Expone el puerto donde tu aplicación corre
EXPOSE 3000

# Ejecuta la aplicación
CMD ["npm", "start"]
