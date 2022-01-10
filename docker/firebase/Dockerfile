FROM node:14.15.0-alpine3.12

RUN apk update && \
    apk upgrade

RUN apk add openjdk8
RUN apk add curl

RUN npm install -g firebase-tools