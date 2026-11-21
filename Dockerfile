FROM node:22-alpine22

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install

ENTRYPOINT ["node" "app.js"]