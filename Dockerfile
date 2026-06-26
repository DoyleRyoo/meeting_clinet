FROM mcr.microsoft.com/devcontainers/javascript-node:22

WORKDIR /app

RUN apt-get update && apt-get install -y git

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm","run","dev","--","--host"]