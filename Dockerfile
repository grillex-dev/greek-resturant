FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY . .

# generate prisma client
RUN npx prisma generate

ARG APP_PORT=5000
EXPOSE $APP_PORT

# run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]