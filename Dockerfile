FROM node:8-alpine

WORKDIR /opt/bot

ENTRYPOINT ["node", "/opt/bot/dist/index.js"]

COPY ./yarn.lock ./package.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
