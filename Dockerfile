FROM oven/bun:latest
RUN mkdir -p /app
WORKDIR /app
COPY . /app

RUN apt-get update && \
    apt-get install -y curl openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN bun install && \
  bun run build && \
  rm -rf /usr/local/share/.cache && \
  rm -rf /usr/local/share/.config && \
  rm -rf /tmp && rm -rf /root/.cache

EXPOSE 6060
CMD ["bun", "run", "start"]