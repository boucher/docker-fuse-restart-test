FROM node:6.9.0

RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libfuse-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY ./ /app

USER root
CMD node index.js
