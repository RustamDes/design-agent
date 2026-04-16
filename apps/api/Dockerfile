FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api
RUN bun run build

EXPOSE 3001
CMD ["bun", "run", "start"]
