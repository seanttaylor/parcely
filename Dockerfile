FROM node:12-alpine

COPY . /src

RUN chown node -R /src

WORKDIR /src

RUN npm ci --only=production

EXPOSE 3000

CMD [ "npm", "start" ]