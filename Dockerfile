FROM node:17-alpine AS production

WORKDIR usr/src/app

RUN rm -rf dist

COPY package*.json ./

RUN yarn add glob rimraf

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]