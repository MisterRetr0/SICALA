# Usa una imagen de Node.js que contenga Chromium
FROM mcr.microsoft.com/playwright:v1.32.0-focal

# Instala Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm

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
