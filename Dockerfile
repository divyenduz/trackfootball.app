FROM node:20-alpine3.18
RUN mkdir -p /app
WORKDIR /app
COPY . /app

RUN apk update && apk add g++ make python3 curl

# TODO: use yarn --production (currently not done because of nx CLI dep in build pipeline)
RUN yarn && \
  yarn build && \
  rm -rf /usr/local/share/.cache && \
  rm -rf /usr/local/share/.config && \
  rm -rf /tmp && rm -rf /root/.cache

EXPOSE 6060
CMD yarn start