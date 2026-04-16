FROM oven/bun:1
WORKDIR /app

COPY package.json ./
COPY src ./src

RUN bun install

EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
