# Production Dockerfile for GeoBusiness Intelligence Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfiles and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build the assets
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy build artifacts and package configs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend

# Install production dependencies only to reduce image size
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
