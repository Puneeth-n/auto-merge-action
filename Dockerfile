FROM node:8-alpine

LABEL version="1.0.0"
LABEL repository="http://github.com/puneeth-n/auto-merge-action"
LABEL homepage="http://github.com/puneeth-n/auto-merge-action"
LABEL maintainer="@puneeth-n"
LABEL "com.github.actions.name"="Automatic merge pull requests"
LABEL "com.github.actions.description"="Automatically merges PR on label"
LABEL "com.github.actions.icon"="git-pull-request"
LABEL "com.github.actions.color"="purple"

WORKDIR /opt/bot

ENTRYPOINT ["node", "/opt/bot/dist/index.js"]

COPY ./yarn.lock ./package.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
