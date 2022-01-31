FROM node:alpine
WORKDIR /app/
COPY . .
RUN yarn --network-timeout 100000
CMD yarn --silent start 