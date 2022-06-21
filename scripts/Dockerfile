FROM node:16.15.0-alpine3.15 as build-stage
RUN apk add --no-cache --update git bash
WORKDIR /app/
RUN git clone https://git.y.gy/pektin/pektin-js-client.git/ .
RUN yarn && yarn build

FROM node:18.2.0-alpine3.15
RUN apk add --no-cache --update wireguard-tools
WORKDIR /app/
COPY --from=build-stage /app/ ./
CMD echo "No script selected"