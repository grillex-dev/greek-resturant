FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN node node_modules/prisma/build/index.js generate

EXPOSE ${APP_PORT}

CMD ["npm", "start"]
