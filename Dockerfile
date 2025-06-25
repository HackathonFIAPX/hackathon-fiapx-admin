FROM node:22-slim

RUN apt update && apt install -y openssl procps git

WORKDIR /home/node/app

COPY . .

RUN chown -R node:node /home/node/app

USER node

RUN yarn

CMD yarn dev