FROM node:22-slim AS builder

RUN apt update && apt install -y openssl procps git

WORKDIR /home/node/app
COPY . .

RUN chown -R node:node /home/node/app

USER node

RUN yarn
RUN yarn build

CMD ["yarn", "prod"]
