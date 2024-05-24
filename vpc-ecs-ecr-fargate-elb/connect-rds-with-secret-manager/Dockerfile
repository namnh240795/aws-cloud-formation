FROM node:lts-alpine3.20 as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . . 

RUN npx prisma generate \
    && pnpm run build \
    && pnpm prune --prod

FROM node:lts-alpine3.20 as production

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

CMD ["pnpm", "run", "start:prod"]
