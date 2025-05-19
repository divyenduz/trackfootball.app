FROM oven/bun:latest
RUN mkdir -p /app
WORKDIR /app
COPY . /app

# Add a symbolic link for npm to use bun instead
RUN ln -s $(which bun) /usr/local/bin/npm

# Install dependencies and build
RUN bun install && \
  bun run build && \
  rm -rf /usr/local/share/.cache && \
  rm -rf /usr/local/share/.config && \
  rm -rf /tmp && rm -rf /root/.cache

EXPOSE 6060
CMD ["bun", "run", "start"]