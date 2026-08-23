FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json server/tsconfig.json ./
RUN npm install
COPY server/src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]
