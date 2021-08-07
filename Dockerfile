FROM node:12-alpine3.14

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

EXPOSE 8000 8000

COPY . .