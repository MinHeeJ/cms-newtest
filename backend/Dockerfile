FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package.json
RUN npm install --workspace backend

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/src/persistence/prisma ./src/persistence/prisma
COPY --from=builder /app/backend/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
