FROM oven/bun:1
WORKDIR /app/apps/api

COPY apps/api/package.json ./
COPY apps/api/src ./src

RUN bun install

EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
