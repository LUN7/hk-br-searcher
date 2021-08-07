FROM node:12-slim as base
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
EXPOSE 8000 8000
COPY . .
CMD ["yarn", "start:prod"] 


FROM base as test
WORKDIR /usr/src/app
COPY . . 
CMD ["yarn", "test"] 

FROM base as production
WORKDIR /usr/src/app
COPY . . 
CMD ["yarn", "start:prod"] 