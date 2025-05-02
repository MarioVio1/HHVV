FROM node:20-slim

# Installa Chromium e dipendenze Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Crea cartella app
WORKDIR /app

# Copia file
COPY . .

# Installa dipendenze
RUN npm install

# Imposta variabile per Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Avvia app
CMD ["node", "server.js"]
