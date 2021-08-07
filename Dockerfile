FROM node:12-slim AS builder
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable=92.0.4515.131-1 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./

EXPOSE 8000 8000
RUN yarn
COPY . .
CMD ["yarn", "start:prod"] 


FROM node:12-slim AS test
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
CMD ["yarn", "test"] 

FROM node:12-slim AS production 
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
CMD ["yarn", "start:prod"] 
