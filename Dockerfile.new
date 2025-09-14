FROM node:16

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte para a pasta src
COPY src/ ./src/

# Comando para rodar a aplicação
CMD ["node", "src/app.js"]