# Usa Node.js LTS
FROM node:18

# Cartella di lavoro nel container
WORKDIR /app

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto del codice
COPY . .

# Espone la porta del server
EXPOSE 3000

# Avvia il server
CMD [ "npm", "start" ]
