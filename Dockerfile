FROM node:24-alpine
RUN mkdir -p /app
WORKDIR /app
COPY . /app

RUN apk update && \
    apk add --no-cache curl openssl && \
    apk del --purge

RUN npm install -g pnpm && \
  pnpm install --frozen-lockfile && \
  pnpm run build && \
  rm -rf /usr/local/share/.cache && \
  rm -rf /usr/local/share/.config && \
  rm -rf /tmp && rm -rf /root/.cache

EXPOSE 6060
CMD ["pnpm", "run", "start"]