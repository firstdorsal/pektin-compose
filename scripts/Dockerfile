FROM pektin/deno-nodejs-alpine as build-stage
WORKDIR /app/
RUN git clone https://git.y.gy/pektin/pektin-js-client.git/ .
RUN yarn && yarn build

FROM node:alpine
WORKDIR /app/
COPY --from=build-stage /app/ ./
CMD echo "No script selected"