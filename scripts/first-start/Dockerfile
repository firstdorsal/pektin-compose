FROM node:alpine
WORKDIR /app/
COPY . .
RUN yarn --network-timeout 10000
CMD yarn --silent start 