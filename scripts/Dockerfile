FROM node:alpine
RUN apk add git
WORKDIR /app/
RUN git clone https://git.y.gy/pektin/pektin-js-client .
RUN yarn && yarn build
CMD echo "No script selected"