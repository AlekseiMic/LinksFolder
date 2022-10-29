FROM node:18
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node
EXPOSE 4200 3333 3336
